"""
Quick test to verify segmentation is working
"""
import requests
import base64
from PIL import Image, ImageDraw
import io

# Create a simple test image with a clear object
def create_test_image():
    img = Image.new('RGB', (400, 400), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a large blue circle in the center
    draw.ellipse([100, 100, 300, 300], fill='blue', outline='darkblue', width=5)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

print("Creating test image...")
test_image = create_test_image()

print("Sending request to API...")
files = {'image': ('test.png', test_image, 'image/png')}
data = {
    'prompt': 'circle',
    'threshold': 0.35,
    'use_sam': True,
    'visualization': 'all'
}

try:
    response = requests.post('http://localhost:8000/segment', files=files, data=data, timeout=30)
    result = response.json()
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Success: {result.get('success')}")
    print(f"Prompt: {result.get('prompt')}")
    print(f"Confidence: {result.get('confidence')}")
    
    if result.get('success'):
        visualizations = result.get('visualizations', {})
        print(f"\nVisualizations generated:")
        for key in visualizations.keys():
            print(f"  - {key}")
        
        # Save the overlay result
        if 'overlay' in visualizations:
            overlay_data = visualizations['overlay'].split(',')[1]
            with open('test_result_overlay.png', 'wb') as f:
                f.write(base64.b64decode(overlay_data))
            print("\n✅ Saved test_result_overlay.png")
        
        # Save the transparent result
        if 'transparent' in visualizations:
            transparent_data = visualizations['transparent'].split(',')[1]
            with open('test_result_transparent.png', 'wb') as f:
                f.write(base64.b64decode(transparent_data))
            print("✅ Saved test_result_transparent.png")
    else:
        print(f"\n❌ Error: {result.get('error')}")
        
except Exception as e:
    print(f"\n❌ Request failed: {e}")
    import traceback
    traceback.print_exc()
