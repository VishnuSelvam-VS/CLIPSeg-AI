# Deployment Guide

This guide covers how to deploy the CLIPSeg AI application for production use.

## 🐳 Docker Deployment (Recommended)

The easiest way to deploy this application is using Docker. This ensures all dependencies (System, Python, Node) are correctly installed.

### 1. Build the Docker Image

We use a multi-stage build:
1.  **Frontend Builder**: Compiles the React app.
2.  **Final Image**: Copies the built frontend and sets up the Python backend.

Create a file named `Dockerfile` in the root directory:

```dockerfile
# Stage 1: Build Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Final Image
FROM python:3.10-slim

# Install system dependencies for OpenCV and GL
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
# Install CPU version of torch by default to keep image size manageable. 
# For GPU, see the GPU section below.
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy Backend Code
COPY backend/ ./backend

# Copy Built Frontend from Stage 1 to a 'static' directory
COPY --from=frontend-builder /app/frontend/dist ./backend/static

# Setup Environment
ENV PORT=8000
WORKDIR /app/backend

# Command to run the application
# We need to ensure main.py is updated to serve static files, 
# or use a reverse proxy like Nginx. 
# For this guide, we assume main.py serves static files or we just run the API.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Update `main.py` for Static Files

To serve the frontend from the Python backend (Single Container), add this to `backend/main.py`:

```python
from fastapi.staticfiles import StaticFiles
import os

# Place this AFTER your API routes
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

### 3. Run with Docker

```bash
docker build -t clipseg-app .
docker run -p 8000:8000 clipseg-app
```

Access at `http://localhost:8000`.

---

## ☁️ Cloud Deployment Options

### Option A: Render / Railway (PaaS)
1.  **Repository**: Push this code to GitHub/GitLab.
2.  **Configuration**:
    *   **Root Directory**: `backend` (if deploying just API) or Root (if using Docker).
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3.  **Docker**: Point the service to the `Dockerfile` for a full stack deployment.

### Option B: Hugging Face Spaces (Gradio/Streamlit)
*Currently, this is a React/FastAPI app. To deploy on HF Spaces easily, consider using the Docker SDK option.*

---

## 🖥️ Manual Production Build (Windows/Linux)

If you don't want to use Docker:

1.  **Build Frontend**:
    ```bash
    cd frontend
    npm run build
    ```
    This creates a `dist` folder.

2.  **Setup Backend**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # or .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    ```

3.  **Serve**:
    *   You can serve the API with `uvicorn main:app`.
    *   You need to serve the `frontend/dist` folder using a web server (like Nginx, Apache, or `serve -s dist`).

