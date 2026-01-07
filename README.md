---
title: CLIPSeg AI
emoji: 🖼️
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# CLIPSeg AI - Advanced Image Segmentation & Editing

A professional-grade web application for zero-shot image segmentation and editing. Combine the power of **CLIPSeg** (text understanding) and **SAM** (Segment Anything Model) for pixel-perfect results.

![CLIPSeg AI](https://img.shields.io/badge/CLIPSeg-AI-violet)
![SAM](https://img.shields.io/badge/SAM-High%20Precision-blue)
![GPU](https://img.shields.io/badge/GPU-Accelerated-green)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123-009688)

## 🌟 Features

- **🎯 Zero-Shot Segmentation**: Type any object name (e.g., "car", "person", "sky") and get instant segmentation.
- **🎨 Magic Brush Editor**: Manually refine masks using a paint/erase tool.
- **✨ Studio Mode**: Apply professional effects like **Portrait Blur**, **Color Pop (B&W Background)**, and **Neon Glow**.
- **🪄 Generative Fill**: Replace objects with AI-generated content (SDXL / SD 1.5).
- **🧹 Magic Eraser**: Remove objects from images with AI-powered inpainting.
- **🎯 High Precision Mode**: Uses **SAM (Segment Anything Model)** for crisp, industry-standard edges.
- **✨ One-Click Background Removal**: Instantly download objects with transparent backgrounds.
- **🎚️ Sensitivity Control**: Fine-tune segmentation with an adjustable threshold slider.
- **🚀 Hybrid Acceleration**: Automatic CUDA (GPU) and CPU optimization for all models.

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** (3.11 recommended)
- **Node.js 18+**
- **NVIDIA GPU** (Optional, but robust CPU fallback is included)

### ⚡ One-Click Start (Windows)

```powershell
cd "Image Segmatation"
.\start_app.ps1
```

This script will:
1. Create the backend virtual environment (if missing).
2. Install all dependencies (backend & frontend).
3. Start both the Backend and Frontend servers in new windows.

### Manual Installation

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies 
pip install -r requirements.txt

# For NVIDIA GPU (Recommended - Fast):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# For CPU only:
# pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open Browser:** http://localhost:5173

## 📖 Usage Guide

### 1. Basic Segmentation
- Upload an image
- Type a prompt (e.g., "car", "person", "dog")
- Click **Generate Segmentation**
- Use the slider to compare results

### 2. Generative Fill (New! ✨)
- Go to the **Studio ✨** tab after segmenting an object.
- **Select Style**: Choose from Realism, Cinematic, Cyberpunk, Anime, or Art.
- **Describe**: Type what you want to see (e.g., "red bus").
- **Creativity**: Adjust strength (Higher = less like original shape).
- **Generate**: The system automatically enhances your prompt and uses **Negative Prompts** for high quality.
    - *GPU Users*: Uses **SDXL Inpainting** (1024x1024, High Quality).
    - *CPU Users*: Automatically falls back to **SD 1.5 Inpainting** (512x512, Faster).

### 3. High Precision Mode (SAM)
- Toggle **"High Precision Mode"** ON
- Generates pixel-perfect masks using the Segment Anything Model
- *Note: First run downloads the SAM model (~40MB).*

### 4. Magic Brush Editing
- Click **"Editor"** tab in the results area
- Use the **+ Brush** to add areas to the mask
- Use the **- Brush** to erase areas
- Click **Save (✓)** to apply changes

### 5. Studio Mode Effects
- Click **"Studio ✨"** tab for creative effects:
  - **Background Blur**: Blur the background for portrait effect
  - **B&W Background**: Keep subject in color, make background grayscale
  - **Neon Glow**: Add a glowing effect around the subject
  - **Sticker Border**: Add a white border for sticker effect
  - **Custom Background**: Upload your own background image

### 6. Background Removal
- Click **"Remove BG"** to download the object as a transparent PNG
- Perfect for creating assets for design work

## 🏗️ Architecture

### Hybrid AI Pipeline
1. **CLIPSeg**: Understands *what* to segment based on text (e.g., "red car")
2. **Bounding Box Extraction**: Finds the region of the object
3. **SAM (Segment Anything)**: Takes the bbox and generates a high-quality mask
4. **Generative Pipeline**:
    - **SDXL Inpainting (GPU)**: For high-fidelity object replacement.
    - **SD 1.5 Inpainting (CPU)**: Optimized fallback for non-GPU systems.
5. **Post-Processing**: Morphological operations for clean edges

### Tech Stack
- **Frontend**: React 19, Tailwind CSS, HTML5 Canvas
- **Backend**: FastAPI, PyTorch, Ultralytics (SAM), Transformers (CLIPSeg), Diffusers (SDXL/SD1.5)
- **Processing**: OpenCV, NumPy, PIL

## 🔧 Configuration

### GPU & CPU Support
The application includes a smart hardware detection system:
- **GPU (CUDA)**:
    - CLIPSeg (Fast)
    - SAM (Fast)
    - SDXL Inpainting (High Quality, fp16 mode)
- **CPU**:
    - CLIPSeg (Standard)
    - SAM (Standard)
    - SD 1.5 Inpainting (Optimized, fp32 mode, ~1-3 min generation)

### Model Files
Models are downloaded automatically:
- **CLIPSeg**: `~/.cache/huggingface/`
- **SAM**: `backend/sam2.1_s.pt` (~40MB)

## 📁 Project Structure

```
Image Segmatation/
├── backend/
│   ├── main.py           # FastAPI server
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React component
│   │   ├── index.css     # Tailwind styles
│   │   └── main.jsx      # React entry point
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
├── start_app.ps1         # One-click start script
├── README.md             # This file
└── .gitignore
```

## 🐛 Troubleshooting

### "Module not found: ultralytics"
Run the backend with virtual environment activated:
```bash
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

### Slow performance
- Enable GPU: Install CUDA version of PyTorch
- Disable SAM: Uncheck "High Precision Mode" for faster (but less accurate) results

### Magic Eraser not working
- Make sure you've generated a segmentation first
- Check browser console for error messages

## 🤝 Contributing

Contributions are welcome! See [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md) for the roadmap.

## 📄 License

MIT License
