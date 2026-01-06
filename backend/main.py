from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import CLIPSegProcessor, CLIPSegForImageSegmentation
from PIL import Image
try:
    from ultralytics import SAM
    HAS_SAM = True
except ImportError:
    HAS_SAM = False
    print("⚠️ Ultralytics not found. SAM features will be disabled.")

import torch
import io
import base64
import numpy as np
import cv2
import json
import time

app = FastAPI(title="CLIPSeg Advanced API", version="2.2")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== GPU CONFIGURATION ==========
if torch.cuda.is_available():
    device = torch.device("cuda")
    gpu_name = torch.cuda.get_device_name(0)
    print(f"🚀 GPU: {gpu_name}")
    # Optimizations
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
else:
    device = torch.device("cpu")
    print("⚠️ CPU mode")

print(f"📍 Device: {device}")

# ========== LOAD MODELS ==========
print("📦 Loading CLIPSeg...")
processor = CLIPSegProcessor.from_pretrained("CIDAS/clipseg-rd64-refined")
model = CLIPSegForImageSegmentation.from_pretrained("CIDAS/clipseg-rd64-refined")
model = model.to(device)
model.eval()

sam_model = None
if HAS_SAM:
    try:
        print("📦 Loading SAM...")
        sam_model = SAM("sam2.1_s.pt")
    except Exception as e:
        print(f"⚠️ Failed to load SAM model: {e}")
        HAS_SAM = False

# ========== GENERATIVE FILL (SDXL Inpainting) ==========
HAS_SDXL = False
sdxl_pipe = None
try:
    from diffusers import AutoPipelineForInpainting, DPMSolverMultistepScheduler
    print("📦 Loading SDXL Inpainting (this may take a moment)...")
    
    # Select Model based on Device (Avoid OOM on CPU)
    if torch.cuda.is_available():
        print("🚀 GPU detected: Loading SDXL Inpainting (High Quality)...")
        model_id = "diffusers/stable-diffusion-xl-1.0-inpainting-0.1"
        dtype = torch.float16
        variant = "fp16"
        IS_SDXL = True
        use_safe = True
    else:
        print("🐢 CPU detected: Loading SD 1.5 Inpainting (Lighter/Faster)...")
        # SDXL is too heavy for most CPUs/RAM, use standard SD 1.5
        model_id = "runwayml/stable-diffusion-inpainting"
        dtype = torch.float32
        variant = None
        IS_SDXL = False
        use_safe = False # generic fallback
        
    sdxl_pipe = AutoPipelineForInpainting.from_pretrained(
        model_id,
        torch_dtype=dtype,
        variant=variant,
        use_safetensors=use_safe
    )

    # Use DPM++ 2M Karras Scheduler (Faster & Better Quality)
    sdxl_pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        sdxl_pipe.scheduler.config,
        use_karras_sigmas=True,
        algorithm_type="dpmsolver++"
    )
    
    # Speed Optimizations
    if torch.cuda.is_available():
        sdxl_pipe.enable_model_cpu_offload()
        sdxl_pipe.enable_vae_slicing()
        try:
            sdxl_pipe.enable_xformers_memory_efficient_attention()
            print("⚡ Xformers enabled!")
        except Exception:
            pass
    else:
        # CPU Optimizations
        sdxl_pipe.enable_vae_slicing()
            
    HAS_SDXL = True
    print(f"✅ Generative Fill Ready! (Model: {'SDXL' if IS_SDXL else 'SD 1.5'})")
except ImportError:
    print("⚠️ Diffusers not found. Generative Fill will be disabled.")
except Exception as e:
    print(f"⚠️ Failed to load SDXL: {e}")

# Warmup GPU with dummy inference
print("🔥 Warming up GPU...")
with torch.no_grad():
    dummy = torch.randn(1, 3, 352, 352).to(device)
    _ = model.clip.vision_model(dummy)
print("✅ Ready!")


@app.get("/health")
async def health_check():
    return {"status": "ok", "device": str(device)}


def image_to_base64(pil_image):
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def improve_mask(mask_np):
    """Fast mask cleanup"""
    mask = (mask_np * 255).astype(np.uint8)
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    return mask / 255.0


@app.post("/segment")
async def segment_image(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    threshold: float = Form(0.5),
    use_sam: bool = Form(True),
    visualization: str = Form("all")
):
    try:
        total_start = time.time()
        
        # Read image
        t0 = time.time()
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        original_size = pil_image.size
        print(f"⏱️ Image load: {(time.time()-t0)*1000:.0f}ms")
        
        # CLIPSeg inference
        t0 = time.time()
        inputs = processor(text=[prompt], images=[pil_image], padding="max_length", return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        preds = outputs.logits[0]
        print(f"⏱️ CLIPSeg: {(time.time()-t0)*1000:.0f}ms")
        
        # Resize prediction
        t0 = time.time()
        pred_resized = torch.nn.functional.interpolate(
            preds.unsqueeze(0).unsqueeze(0),
            size=(original_size[1], original_size[0]),
            mode='bilinear',
            align_corners=False
        )[0][0]
        
        pred_sigmoid = torch.sigmoid(pred_resized)
        binary_mask = (pred_sigmoid > threshold).float()
        print(f"⏱️ Resize: {(time.time()-t0)*1000:.0f}ms")
        
        # SAM refinement
        if use_sam and binary_mask.sum() > 100 and HAS_SAM and sam_model:
            t0 = time.time()
            try:
                y_idx, x_idx = torch.where(binary_mask > 0)
                if len(y_idx) > 0:
                    pad = 20
                    bbox = [
                        max(0, x_idx.min().item() - pad),
                        max(0, y_idx.min().item() - pad),
                        min(original_size[0], x_idx.max().item() + pad),
                        min(original_size[1], y_idx.max().item() + pad)
                    ]
                    
                    img_np = np.array(pil_image)
                    results = sam_model.predict(img_np, bboxes=[bbox], verbose=False)
                    
                    if results and results[0].masks is not None:
                        sam_mask = results[0].masks.data[0].cpu().numpy()
                        if sam_mask.shape != (original_size[1], original_size[0]):
                            sam_mask = cv2.resize(sam_mask.astype(np.float32), original_size)
                        binary_mask = torch.from_numpy(sam_mask).float().to(device)
                        print(f"⏱️ SAM: {(time.time()-t0)*1000:.0f}ms ✅")
            except Exception as e:
                print(f"⚠️ SAM error: {e}")
        
        # Convert mask to numpy
        mask_np = binary_mask.cpu().numpy()
        mask_np = improve_mask(mask_np)
        
        # Generate visualizations
        t0 = time.time()
        results = {}
        
        if visualization in ["all", "mask"]:
            mask_img = (mask_np * 255).astype(np.uint8)
            results["mask"] = f"data:image/png;base64,{image_to_base64(Image.fromarray(mask_img))}"
        
        if visualization in ["all", "heatmap"]:
            heat = (pred_sigmoid.cpu().numpy() * 255).astype(np.uint8)
            heatmap = cv2.applyColorMap(heat, cv2.COLORMAP_JET)
            heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
            results["heatmap"] = f"data:image/png;base64,{image_to_base64(Image.fromarray(heatmap))}"
        
        if visualization in ["all", "overlay"]:
            img_np = np.array(pil_image)
            overlay = img_np.copy()
            mask_bool = mask_np > 0.5
            overlay[mask_bool] = overlay[mask_bool] * 0.6 + np.array([255, 0, 255]) * 0.4
            results["overlay"] = f"data:image/png;base64,{image_to_base64(Image.fromarray(overlay.astype(np.uint8)))}"
        
        if visualization in ["all", "contours"]:
            mask_uint8 = (mask_np * 255).astype(np.uint8)
            contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            img_contours = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            cv2.drawContours(img_contours, contours, -1, (0, 255, 0), 2)
            results["contours"] = f"data:image/png;base64,{image_to_base64(Image.fromarray(cv2.cvtColor(img_contours, cv2.COLOR_BGR2RGB)))}"
        
        if visualization in ["all", "transparent"]:
            img_rgba = pil_image.convert("RGBA")
            mask_pil = Image.fromarray((mask_np * 255).astype(np.uint8)).resize(pil_image.size)
            img_rgba.putalpha(mask_pil)
            results["transparent"] = f"data:image/png;base64,{image_to_base64(img_rgba)}"
        
        print(f"⏱️ Visualizations: {(time.time()-t0)*1000:.0f}ms")
        
        confidence = pred_sigmoid.max().item()
        total_time = (time.time() - total_start) * 1000
        print(f"✅ TOTAL: {total_time:.0f}ms | Prompt: '{prompt}' | Conf: {confidence:.2f}")
        
        return {
            "success": True,
            "prompt": prompt,
            "confidence": round(confidence, 3),
            "processing_time_ms": round(total_time),
            "visualizations": results
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.post("/batch-segment")
async def batch_segment(
    image: UploadFile = File(...),
    prompts: str = Form(...)
):
    try:
        prompt_list = json.loads(prompts)
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        original_size = pil_image.size

        inputs = processor(
            text=prompt_list,
            images=[pil_image] * len(prompt_list),
            padding="max_length",
            return_tensors="pt"
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        results = []
        for idx, prompt in enumerate(prompt_list):
            preds = outputs.logits[idx]
            pred_resized = torch.nn.functional.interpolate(
                preds.unsqueeze(0).unsqueeze(0),
                size=(original_size[1], original_size[0]),
                mode='bilinear',
                align_corners=False
            )[0][0]
            
            pred_sigmoid = torch.sigmoid(pred_resized)
            mask_np = (pred_sigmoid > 0.4).cpu().numpy().astype(np.float32)
            
            # Heatmap
            heat = (pred_sigmoid.cpu().numpy() * 255).astype(np.uint8)
            heatmap = cv2.applyColorMap(heat, cv2.COLORMAP_JET)
            heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
            
            # Overlay
            img_np = np.array(pil_image)
            overlay = img_np.copy()
            mask_bool = mask_np > 0.5
            overlay[mask_bool] = overlay[mask_bool] * 0.6 + np.array([255, 0, 255]) * 0.4
            
            results.append({
                "prompt": prompt,
                "heatmap": f"data:image/png;base64,{image_to_base64(Image.fromarray(heatmap))}",
                "overlay": f"data:image/png;base64,{image_to_base64(Image.fromarray(overlay.astype(np.uint8)))}",
                "confidence": round(pred_sigmoid.max().item(), 3)
            })

        return {"success": True, "count": len(results), "results": results}

    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


from fastapi.responses import Response

@app.post("/remove-bg")
async def remove_bg_api(image: UploadFile = File(...), prompt: str = Form("main object")):
    """
    Directly returns a PNG image with background removed.
    Ideal for scripts and automated workflows.
    """
    try:
        # Load Image
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        original_size = pil_image.size

        # Inference
        inputs = processor(text=[prompt], images=[pil_image], padding="max_length", return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Resize mask
        preds = outputs.logits[0]
        pred_resized = torch.nn.functional.interpolate(
            preds.unsqueeze(0).unsqueeze(0),
            size=(original_size[1], original_size[0]),
            mode='bilinear',
            align_corners=False
        )[0][0]
        binary_mask = (torch.sigmoid(pred_resized) > 0.5).float()
        
        # SAM Refinement (Optional but recommended for quality)
        if binary_mask.sum() > 100 and HAS_SAM and sam_model:
            try:
                y_idx, x_idx = torch.where(binary_mask > 0)
                if len(y_idx) > 0:
                    bbox = [
                        max(0, x_idx.min().item() - 20),
                        max(0, y_idx.min().item() - 20),
                        min(original_size[0], x_idx.max().item() + 20),
                        min(original_size[1], y_idx.max().item() + 20)
                    ]
                    img_np = np.array(pil_image)
                    sam_results = sam_model.predict(img_np, bboxes=[bbox], verbose=False)
                    if sam_results and sam_results[0].masks is not None:
                        sam_mask = sam_results[0].masks.data[0].cpu().numpy()
                        if sam_mask.shape != (original_size[1], original_size[0]):
                             sam_mask = cv2.resize(sam_mask.astype(np.float32), original_size)
                        binary_mask = torch.from_numpy(sam_mask).float().to(device)
            except: pass

        # Apply Mask
        mask_np = binary_mask.cpu().numpy()
        mask_np = improve_mask(mask_np) # Smooth edges
        
        img_rgba = pil_image.convert("RGBA")
        mask_pil = Image.fromarray((mask_np * 255).astype(np.uint8)).resize(pil_image.size)
        img_rgba.putalpha(mask_pil)
        
        # Save to buffer
        buf = io.BytesIO()
        img_rgba.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/inpaint")
async def inpaint_image(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    radius: int = Form(3)
):
    try:
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

        mask_data = await mask.read()
        pil_mask = Image.open(io.BytesIO(mask_data)).convert("L").resize(pil_image.size)
        mask_np = np.array(pil_mask)

        kernel = np.ones((5, 5), np.uint8)
        mask_dilated = cv2.dilate(mask_np, kernel, iterations=2)

        inpainted = cv2.inpaint(img_cv, mask_dilated, radius, cv2.INPAINT_TELEA)
        inpainted_rgb = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB)

        return {
            "success": True,
            "image": f"data:image/png;base64,{image_to_base64(Image.fromarray(inpainted_rgb))}"
        }


    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.post("/generative-fill")
async def generative_fill(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.85),
    steps: int = Form(20)
):
    """
    AI-powered Generative Fill using Stable Diffusion XL Inpainting.
    Replaces the masked area with AI-generated content based on the prompt.
    """
    if not HAS_SDXL or sdxl_pipe is None:
        return JSONResponse(
            status_code=503, 
            content={"success": False, "error": "Generative Fill not available. Install diffusers: pip install diffusers transformers accelerate"}
        )
    
    try:
        # Load images
        image_data = await image.read()
        init_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        mask_data = await mask.read()
        mask_image = Image.open(io.BytesIO(mask_data)).convert("RGB").resize(init_image.size)
        
        # SDXL works best at 1024x1024, SD 1.5 at 512x512
        original_size = init_image.size
        # Fallback to 512 if not SDXL (assumes global IS_SDXL exists)
        target_size = (1024, 1024) if 'IS_SDXL' in globals() and IS_SDXL else (512, 512)
        
        init_image_resized = init_image.resize(target_size, Image.Resampling.LANCZOS)
        mask_image_resized = mask_image.resize(target_size, Image.Resampling.LANCZOS)
        
        print(f"🎨 Generative Fill: '{prompt}' | Steps: {steps} | Strength: {strength}")
        
        # Run inpainting
        # Enhance prompt for better quality
        enhanced_prompt = f"{prompt}, professional photography, high quality, highly detailed, sharp focus, 8k uhd, photorealistic, realistic textures"
        
        # Comprehensive negative prompt
        negative_prompt = (
            "blurred, ugly, low quality, low resolution, extra limbs, deformed, bad anatomy, "
            "artifacts, watermark, text, distortion, fuzzy, grain, amateur, noise, "
            "blurry, haze, geometric patterns, worst quality, normal quality, jpeg artifacts"
        )
        
        result = sdxl_pipe(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,
            image=init_image_resized,
            mask_image=mask_image_resized,
            num_inference_steps=steps,
            strength=strength,
            guidance_scale=7.5
        ).images[0]
        
        # Resize back to original
        result = result.resize(original_size, Image.Resampling.LANCZOS)
        
        print("✅ Generative Fill complete!")
        
        return {
            "success": True,
            "image": f"data:image/png;base64,{image_to_base64(result)}"
        }
        
    except Exception as e:
        print(f"❌ Generative Fill error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.get("/capabilities")
async def get_capabilities():
    """Returns which optional features are available"""
    return {
        "sam": HAS_SAM,
        "generative_fill": HAS_SDXL,
        "device": str(device)
    }


# ========== STATIC FILES (DEPLOYMENT) ==========
from fastapi.staticfiles import StaticFiles
import os

# Mount Processed Images for Gallery Access
processed_path = "../processed"
if not os.path.exists(processed_path):
    os.makedirs(processed_path)
    
app.mount("/processed", StaticFiles(directory=processed_path), name="processed")

@app.get("/gallery")
async def get_gallery_images():
    """List all images in the processed directory"""
    try:
        if not os.path.exists(processed_path):
            return []
            
        images = []
        # Sort by modification time (newest first)
        files = sorted(os.listdir(processed_path), key=lambda x: os.path.getmtime(os.path.join(processed_path, x)), reverse=True)
        
        for f in files:
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                images.append({
                    "name": f,
                    "url": f"/processed/{f}",
                    "timestamp": os.path.getctime(os.path.join(processed_path, f))
                })
        return images
    except Exception as e:
        print(f"Gallery Error: {e}")
        return []

# Serve React Frontend if "static" directory exists (Docker/Production)
# OR if "dist" exists in frontend folder (Local fallback)
static_path = "static"
frontend_dist_path = "../frontend/dist"

if os.path.exists(static_path):
    print(f"📂 Serving static files from: {static_path}")
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
elif os.path.exists(frontend_dist_path):
    print(f"📂 Serving static files from: {frontend_dist_path}")
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")
else:
    print("⚠️ No static files found. API only mode.")
