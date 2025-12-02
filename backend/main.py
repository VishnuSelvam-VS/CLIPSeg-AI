from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import CLIPSegProcessor, CLIPSegForImageSegmentation
from PIL import Image, ImageDraw, ImageFilter
from ultralytics import SAM
import torch
import io
import base64
import numpy as np
import cv2
from typing import List, Optional
import json
import os

app = FastAPI(title="CLIPSeg Advanced API", version="2.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

print("Loading CLIPSeg model...")
processor = CLIPSegProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
model = CLIPSegForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined").to(device)

print("Loading SAM model...")
# using sam2.1_b.pt (base) for balance of speed/accuracy
sam_model = SAM("sam2.1_b.pt")

def image_to_base64(pil_image):
    buffered = io.BytesIO()
    pil_image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def process_mask(pred_tensor, threshold=0.5):
    """Convert prediction tensor to binary mask"""
    pred_sigmoid = torch.sigmoid(pred_tensor)
    binary_mask = (pred_sigmoid > threshold).float()
    return binary_mask

def create_heatmap(pred_tensor, colormap='jet'):
    """Create colored heatmap from prediction"""
    pred_sigmoid = torch.sigmoid(pred_tensor).cpu().numpy()
    pred_normalized = (pred_sigmoid * 255).astype(np.uint8)
    
    if colormap == 'jet':
        heatmap = cv2.applyColorMap(pred_normalized, cv2.COLORMAP_JET)
    elif colormap == 'viridis':
        heatmap = cv2.applyColorMap(pred_normalized, cv2.COLORMAP_VIRIDIS)
    else:
        heatmap = cv2.applyColorMap(pred_normalized, cv2.COLORMAP_HOT)
    
    return cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)

def create_overlay(pil_image, mask, alpha=0.4, color=(255, 0, 255)):
    if isinstance(mask, torch.Tensor):
        mask = mask.cpu().numpy()
    
    # Ensure mask is proper shape and type
    mask = (mask > 0).astype(np.float32)
    
    # Create alpha mask: 0 where mask is 0, 255*alpha where mask is 1
    mask_alpha = (mask * 255 * alpha).astype(np.uint8)
    mask_pil = Image.fromarray(mask_alpha).convert("L")
    
    if mask_pil.size != pil_image.size:
        mask_pil = mask_pil.resize(pil_image.size, Image.NEAREST)
        
    # Create solid color image
    overlay_color = Image.new("RGBA", pil_image.size, color + (255,))
    overlay_color.putalpha(mask_pil)
    
    # Composite
    return Image.alpha_composite(pil_image.convert("RGBA"), overlay_color)

def find_contours_image(mask, pil_image):
    if isinstance(mask, torch.Tensor):
        mask = mask.cpu().numpy()
    
    mask = (mask * 255).astype(np.uint8)
    mask = cv2.resize(mask, pil_image.size, interpolation=cv2.INTER_NEAREST)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    img_cv = np.array(pil_image)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)
    cv2.drawContours(img_cv, contours, -1, (0, 255, 0), 2)
    
    return Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))

def create_transparent_image(pil_image, mask):
    if isinstance(mask, torch.Tensor):
        mask = mask.cpu().numpy()
        
    mask = (mask * 255).astype(np.uint8)
    mask_pil = Image.fromarray(mask).convert("L")
    
    if mask_pil.size != pil_image.size:
        mask_pil = mask_pil.resize(pil_image.size, Image.NEAREST)
        
    pil_image = pil_image.convert("RGBA")
    pil_image.putalpha(mask_pil)
    return pil_image

def improve_mask_quality(mask):
    if isinstance(mask, torch.Tensor):
        mask_np = mask.cpu().numpy()
    else:
        mask_np = mask
        
    mask_uint8 = (mask_np * 255).astype(np.uint8)
    kernel = np.ones((5,5), np.uint8)
    mask_cleaned = cv2.morphologyEx(mask_uint8, cv2.MORPH_CLOSE, kernel)
    
    return torch.from_numpy(mask_cleaned / 255.0).float().to(device)

@app.post("/segment")
async def segment_image(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    threshold: float = Form(0.5),
    use_sam: bool = Form(True),
    visualization: str = Form("all")
):
    try:
        # Read image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        original_size = pil_image.size
        
        # Process image with CLIPSeg
        print(f"Received request: prompt='{prompt}', threshold={threshold}, use_sam={use_sam}")
        inputs = processor(text=[prompt], images=[pil_image], padding="max_length", return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        preds = outputs.logits[0]
        print(f"CLIPSeg prediction range: min={preds.min().item():.3f}, max={preds.max().item():.3f}")
        
        # Resize to original size
        pred_resized = torch.nn.functional.interpolate(
            preds.unsqueeze(0).unsqueeze(0),
            size=original_size[::-1],
            mode='bilinear',
            align_corners=False
        )[0][0]
        
        binary_mask = process_mask(pred_resized, threshold)
        print(f"Initial mask pixels: {torch.sum(binary_mask).item()}")
        
        # Refine with SAM if requested
        if use_sam:
            try:
                # Use CLIPSeg mask to generate bounding box for SAM
                # Find coordinates where mask is 1
                y_indices, x_indices = torch.where(binary_mask > 0)
                
                if len(y_indices) > 0:
                    x_min, x_max = x_indices.min().item(), x_indices.max().item()
                    y_min, y_max = y_indices.min().item(), y_indices.max().item()
                    
                    # Add some padding
                    padding = 10
                    x_min = max(0, x_min - padding)
                    y_min = max(0, y_min - padding)
                    x_max = min(original_size[0], x_max + padding)
                    y_max = min(original_size[1], y_max + padding)
                    
                    bbox = [x_min, y_min, x_max, y_max]
                    
                    # Run SAM
                    # Note: Ultralytics SAM usage might differ slightly based on version, 
                    # but generally accepts bboxes.
                    # We need to pass the image and the bbox.
                    
                    # Convert PIL to numpy for SAM
                    img_np = np.array(pil_image)
                    
                    # Using ultralytics SAM predict
                    results_sam = sam_model.predict(img_np, bboxes=[bbox], verbose=False)
                    
                    if results_sam and results_sam[0].masks is not None:
                        # Get the mask from SAM
                        sam_mask = results_sam[0].masks.data[0] # First mask
                        
                        # Resize SAM mask if needed (it should match image size usually)
                        if sam_mask.shape != (original_size[1], original_size[0]):
                             sam_mask = torch.nn.functional.interpolate(
                                sam_mask.unsqueeze(0).unsqueeze(0),
                                size=(original_size[1], original_size[0]),
                                mode='bilinear',
                                align_corners=False
                            )[0][0]
                        
                        # Update binary_mask with SAM result
                        binary_mask = (sam_mask > 0).float().to(device)
                        print("✅ SAM refinement applied successfully")
                    else:
                        print("⚠️ SAM returned no masks, falling back to CLIPSeg")
                else:
                    print("⚠️ CLIPSeg found nothing, skipping SAM")
            except Exception as e:
                print(f"❌ SAM refinement failed: {e}")
                import traceback
                traceback.print_exc()

        try:
            binary_mask = improve_mask_quality(binary_mask)
        except Exception as e:
            print(f"Mask improvement failed: {e}")

        results = {}
        
        # Generate visualizations based on request
        if visualization in ["all", "mask"]:
            mask_img = (binary_mask.cpu().numpy() * 255).astype(np.uint8)
            mask_pil = Image.fromarray(mask_img)
            results["mask"] = f"data:image/png;base64,{image_to_base64(mask_pil)}"
        
        if visualization in ["all", "heatmap"]:
            heatmap = create_heatmap(pred_resized, 'jet')
            heatmap_pil = Image.fromarray(heatmap)
            results["heatmap"] = f"data:image/png;base64,{image_to_base64(heatmap_pil)}"
        
        if visualization in ["all", "overlay"]:
            # For overlay, we want a binary-ish look, so we threshold the soft mask
            hard_mask = (binary_mask > 0.5).float()
            overlay = create_overlay(pil_image, hard_mask, alpha=0.4, color=(255, 0, 255))
            results["overlay"] = f"data:image/png;base64,{image_to_base64(overlay)}"
        
        if visualization in ["all", "contours"]:
            contours_img = find_contours_image(binary_mask, pil_image)
            results["contours"] = f"data:image/png;base64,{image_to_base64(contours_img)}"

        if visualization in ["all", "transparent"]:
            # For transparent, we use the SOFT mask for anti-aliasing
            transparent_img = create_transparent_image(pil_image, binary_mask)
            results["transparent"] = f"data:image/png;base64,{image_to_base64(transparent_img)}"
        
        # Calculate confidence score
        confidence = torch.sigmoid(pred_resized).max().item()
        
        return {
            "success": True,
            "prompt": prompt,
            "confidence": round(confidence, 3),
            "visualizations": results
        }

    except Exception as e:
        print(f"Error in segment_image: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/batch-segment")
async def batch_segment(
    image: UploadFile = File(...),
    prompts: str = Form(...)  # JSON array of prompts
):
    """Segment image with multiple prompts"""
    try:
        # Parse prompts
        prompt_list = json.loads(prompts)
        
        # Read image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        original_size = pil_image.size

        # Process all prompts at once
        inputs = processor(
            text=prompt_list, 
            images=[pil_image] * len(prompt_list), 
            padding="max_length", 
            return_tensors="pt"
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
        
        results = []
        
        for idx, prompt in enumerate(prompt_list):
            preds = outputs.logits[idx]
            
            # Resize to original size
            pred_resized = torch.nn.functional.interpolate(
                preds.unsqueeze(0).unsqueeze(0),
                size=original_size[::-1],
                mode='bilinear',
                align_corners=False
            )[0][0]
            
            # Create visualizations
            heatmap = create_heatmap(pred_resized, 'jet')
            heatmap_pil = Image.fromarray(heatmap)
            
            binary_mask = process_mask(pred_resized, 0.4)
            overlay = create_overlay(pil_image, binary_mask, alpha=0.4)
            
            confidence = torch.sigmoid(pred_resized).max().item()
            
            results.append({
                "prompt": prompt,
                "heatmap": f"data:image/png;base64,{image_to_base64(heatmap_pil)}",
                "overlay": f"data:image/png;base64,{image_to_base64(overlay)}",
                "confidence": round(confidence, 3)
            })
        
        return {
            "success": True,
            "count": len(results),
            "results": results
        }

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
