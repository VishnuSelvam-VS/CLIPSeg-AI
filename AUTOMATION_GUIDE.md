# 🤖 Automation & Workflow Guide

Turn your CLIPSeg tool into a fully automated production pipeline.

## 1. Batch Background Removal
We have added a new "headless" automation script that processes entire folders of images automatically.

### **Setup**
1. Ensure your backend server is running:
   ```powershell
   cd backend
   uvicorn main:app --reload
   ```

2. Open a new terminal for the automation script.

### **Usage**
Run the script `workflow_scripts/auto_remove_bg.py`:

```powershell
# Basic Usage (Default: removes background of 'main object')
python workflow_scripts/auto_remove_bg.py --input raw_photos --output processed

# Watch Mode (Automatically processes new files added to the folder)
python workflow_scripts/auto_remove_bg.py --input raw_photos --output processed --watch

# Custom Prompt (e.g., extract only cars)
python workflow_scripts/auto_remove_bg.py --input raw_photos --output car_only --prompt "car"
```

## 2. API Endpoints for Developers

### **POST /remove-bg**
Directly returns a PNG image with the background removed. Optimized for scripts.

- **URL**: `http://localhost:8000/remove-bg`
- **Body (`multipart/form-data`)**:
  - `image`: The image file.
  - `prompt`: (Optional) Text description of what to keep (default: "main object").
- **Response**: Binary PNG image.

### **Python Example**
```python
import requests

with open("my_photo.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/remove-bg",
        files={"image": f},
        data={"prompt": "cat"}
    )
    
with open("cat_transparent.png", "wb") as f:
    f.write(response.content)
```

## 3. Future Upgrades (Roadmap)
- **Video Support**: We are preparing the backend for SAM 2 Video to track objects across frames.
- **Semantic Search**: Indexing processed masks for searching (e.g., "Find all images with red cars").
