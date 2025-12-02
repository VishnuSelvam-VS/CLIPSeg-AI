"""
Test script for CLIPSeg API
Usage: python test_api.py
"""

import requests
import base64
import json
from PIL import Image, ImageDraw
import io

API_URL = "http://localhost:8000"

def create_test_image():
    """Create a simple test image with shapes"""
    img = Image.new('RGB', (512, 512), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw a blue circle (represents a ball)
    draw.ellipse([150, 150, 350, 350], fill='blue', outline='darkblue', width=3)
    
    # Draw a red rectangle (represents a book)
    draw.rectangle([50, 400, 200, 480], fill='red', outline='darkred', width=3)
    
    # Save
    img.save('test_image.jpg')
    print("✅ Created test_image.jpg")
    return 'test_image.jpg'

def test_health():
    """Test API health endpoint"""
    response = requests.get(f"{API_URL}/")
    print("\n🔍 Health Check:")
    print(json.dumps(response.json(), indent=2))

def test_single_segmentation(image_path, prompt, threshold=0.5):
    """Test single prompt segmentation"""
    print(f"\n🎯 Testing segmentation with prompt: '{prompt}'")
    
    files = {'image': open(image_path, 'rb')}
    data = {
        'prompt': prompt,
        'threshold': threshold,
        'visualization': 'all'
    }
    
    response = requests.post(f"{API_URL}/segment", files=files, data=data)
    result = response.json()
    
    if result.get('success'):
        print(f"   ✅ Success! Confidence: {result['confidence']}")
        
        # Save overlay
        overlay_data = result['visualizations']['overlay'].split(',')[1]
        with open(f'result_{prompt.replace(" ", "_")}_overlay.png', 'wb') as f:
            f.write(base64.b64decode(overlay_data))
        print(f"   💾 Saved result_{prompt.replace(' ', '_')}_overlay.png")
        
        return result
    else:
        print(f"   ❌ Error: {result.get('error')}")
        return None

def test_batch_segmentation(image_path, prompts):
    """Test batch segmentation with multiple prompts"""
    print(f"\n🎯 Testing batch segmentation with {len(prompts)} prompts")
    
    files = {'image': open(image_path, 'rb')}
    data = {'prompts': json.dumps(prompts)}
    
    response = requests.post(f"{API_URL}/batch-segment", files=files, data=data)
    result = response.json()
    
    if result.get('success'):
        print(f"   ✅ Success! Processed {result['count']} prompts")
        
        for idx, r in enumerate(result['results']):
            print(f"   - {r['prompt']}: confidence {r['confidence']}")
            
            # Save overlays
            overlay_data = r['overlay'].split(',')[1]
            with open(f'batch_{idx}_{r["prompt"].replace(" ", "_")}.png', 'wb') as f:
                f.write(base64.b64decode(overlay_data))
        
        print(f"   💾 Saved {result['count']} result images")
        return result
    else:
        print(f"   ❌ Error: {result.get('error')}")
        return None

def main():
    print("=" * 60)
    print("🧪 CLIPSeg API Test Suite")
    print("=" * 60)
    
    # Check if API is running
    try:
        test_health()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API at", API_URL)
        print("   Make sure the backend is running:")
        print("   python -m uvicorn main:app --reload")
        return
    
    # Create test image
    test_image = create_test_image()
    
    # Test single segmentation
    test_single_segmentation(test_image, "circle", threshold=0.4)
    test_single_segmentation(test_image, "rectangle", threshold=0.4)
    
    # Test batch segmentation
    test_batch_segmentation(test_image, ["circle", "rectangle", "blue object", "red shape"])
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
