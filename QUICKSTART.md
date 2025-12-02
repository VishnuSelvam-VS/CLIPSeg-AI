# CLIPSeg AI - Quick Start Guide v2.0

Get up and running with the advanced segmentation features in minutes.

## ⚡ Fast Setup

### 1. Backend Setup

```powershell
cd backend

# Create & Activate Venv
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

# Install Dependencies (including SAM support)
pip install fastapi "uvicorn[standard]" pillow opencv-python-headless transformers python-multipart ultralytics requests

# Install PyTorch (GPU Version - Recommended)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
# OR for CPU:
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 2. Frontend Setup

```powershell
cd frontend
npm install
```

### 3. Run

**Terminal 1 (Backend):**
```powershell
python -m uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```powershell
npm run dev
```

---

## 🎮 Feature Guide

### 🎯 High Precision Mode (SAM)
*Best for: Clean edges, professional cutouts*
1.  Upload image.
2.  Toggle **"High Precision Mode"** switch.
3.  Enter prompt and generate.
4.  Result will have sharp, pixel-perfect boundaries.

### 🎨 Magic Brush Editor
*Best for: Fixing small mistakes*
1.  Generate a segmentation.
2.  Click **"Edit Mask"**.
3.  **Draw** over missing parts to add them.
4.  **Erase** extra parts.
5.  Click **Save**.

### ✨ Background Removal
*Best for: Creating assets*
1.  Generate (and optionally edit) your mask.
2.  Click **"Remove BG"**.
3.  Save the transparent PNG.

### 🎚️ Threshold Control
*Best for: Fine-tuning sensitivity*
- **Lower (0.2)**: Captures more (good for faint objects).
- **Higher (0.7)**: Captures less (good for separating objects).

## ❓ Troubleshooting

**"SAM model loading..." hangs?**
- The first time you run High Precision Mode, it downloads the SAM model (~40MB). This is normal.

**"CUDA not available"?**
- Ensure you installed the GPU version of PyTorch.
- Check if you have NVIDIA drivers installed.
- The app will fallback to CPU automatically.

**"Edit Mask" button missing?**
- Generate a result first. The editor works on the generated mask.
