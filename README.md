# CLIPSeg AI - Advanced Image Segmentation & Editing

A professional-grade web application for zero-shot image segmentation and editing. Combine the power of **CLIPSeg** (text understanding) and **SAM** (Segment Anything Model) for pixel-perfect results.

![CLIPSeg AI](https://img.shields.io/badge/CLIPSeg-AI-violet)
![SAM](https://img.shields.io/badge/SAM-High%20Precision-blue)
![GPU](https://img.shields.io/badge/GPU-Accelerated-green)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.120-009688)

## 🌟 New Features (v2.0)

- **🎨 Magic Brush Editor**: Manually refine masks using a paint/erase tool.
- **🎯 High Precision Mode**: Uses **SAM (Segment Anything Model)** for crisp, industry-standard edges.
- **✨ One-Click Background Removal**: Instantly download objects with transparent backgrounds.
- **🎚️ Sensitivity Control**: Fine-tune segmentation with an adjustable threshold slider.
- **🚀 GPU Acceleration**: Automatic CUDA support for lightning-fast inference.

## 🚀 Quick Start

### Prerequisites

- Python 3.11
- Node.js 18+
- NVIDIA GPU (Optional, but recommended for speed)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd "Image Segmatation"
```

2. **Set up the backend**
```bash
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1

# Install core dependencies
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" pillow opencv-python-headless transformers python-multipart ultralytics requests

# Install PyTorch (Choose one):

# Option A: For NVIDIA GPU (Recommended - Fast)
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# Option B: For CPU (Slower)
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start Backend**:
```bash
cd backend
python -m uvicorn main:app --reload
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Open Browser**: http://localhost:5173

## 📖 Usage Guide

### 1. Basic Segmentation
- Upload an image.
- Type a prompt (e.g., "car").
- Click **Generate**.
- Use the slider to compare results.

### 2. High Precision Mode (SAM)
- Toggle **"High Precision Mode"** ON.
- Generates pixel-perfect masks using the Segment Anything Model.
- *Note: First run downloads the SAM model (~40MB).*

### 3. Magic Brush Editing
- Click **"Edit Mask"** in the results area.
- Use the **+ Brush** to add areas (purple).
- Use the **- Brush** to erase areas.
- Click **Save (✓)** to apply changes.

### 4. Background Removal
- Click **"Remove BG"** to download the object as a transparent PNG.
- Perfect for creating assets for design work.

## 🏗️ Architecture

### Hybrid AI Pipeline
1.  **CLIPSeg**: Understands *what* to segment based on text (e.g., "red car").
2.  **Point Extraction**: Finds the center of the object.
3.  **SAM (Segment Anything)**: Takes the point and generates a high-quality mask.

### Tech Stack
- **Frontend**: React, Tailwind CSS, HTML5 Canvas
- **Backend**: FastAPI, PyTorch, Ultralytics (SAM), Transformers (CLIPSeg)
- **Processing**: OpenCV, NumPy, PIL

## 🔧 Configuration

### GPU Support
The application automatically detects CUDA devices.
- **With GPU**: Inference ~0.1s
- **CPU Only**: Inference ~3s (CLIPSeg) / ~5s (SAM)

### Model Storage
Models are downloaded automatically to:
- CLIPSeg: `~/.cache/huggingface/`
- SAM: `backend/sam2.1_b.pt`

## 🤝 Contributing

Contributions are welcome! Please read [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md) for the roadmap.

## 📄 License

MIT License
