# Stage 1: Build Frontend
FROM node:22-slim as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Final Image
FROM python:3.10-slim

# Install system dependencies for OpenCV and GL
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt .
# Install CPU version of torch by default. 
# NOTE: For GPU support, use a cuda-enabled base image and install cuda torch.
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy Backend Code
COPY backend/ .

# Copy Built Frontend from Stage 1 to a 'static' directory in backend
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
