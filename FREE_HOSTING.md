# ☁️ completely Free Hosting Guide (Hugging Face Spaces)

For a powerful AI app like this (Python + PyTorch + React), the best **completely free** hosting provider is **Hugging Face Spaces**.

They provide:
*   **Free Hosting**: Forever.
*   **Decent Specs**: 2 vCPU, 16GB RAM (Free Tier).
*   **No Credit Card**: You don't need to add payment info.

---

## 🚀 Step-by-Step Deployment

### 1. Create a Hugging Face Account
Go to [huggingface.co/join](https://huggingface.co/join) and create an account if you don't have one.

### 2. Create a New Space
1.  Click your profile picture (top right) -> **New Space**.
2.  **Space Name**: `clipseg-app` (or whatever you like).
3.  **License**: `MIT`.
4.  **Select the Space SDK**: Choose **Docker** (This is important! Do not choose Streamlit/Gradio).
5.  **Space Hardware**: Select **Free** (CPU basic).
6.  Click **Create Space**.

### 3. Upload Your Code
You can upload files via the browser or use Git. The browser is easiest for a one-time setup.

**Option A: Upload via Browser (Easiest)**
1.  In your new Space, go to the **Files** tab.
2.  Click **+ Add file** -> **Upload files**.
3.  Drag and drop the following files/folders from your project:
    *   `backend/` (folder)
    *   `frontend/` (folder)
    *   `Dockerfile` (file)
    *   `requirements.txt` (if it's in the root, otherwise it's inside backend)
4.  **Commit changes**: Click the button to save.

**Option B: Use Git (Professional)**
1.  In your Space, click the "Clone repository" button to get the command.
2.  Run this in your terminal:
    ```bash
    git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
    cd YOUR_SPACE_NAME
    # Copy your project files into this folder
    git add .
    git commit -m "Initial commit"
    git push
    ```

### 4. Wait for Build
1.  Click the **App** tab in your Space.
2.  You will see "Building". This takes about 3-5 minutes.
3.  Once "Running", your app is live! 
4.  Share the URL with anyone.

---

## ⚠️ Important Notes for Free Tier

1.  **Speed**: The free tier uses **CPU Only**.
    *   **CLIPSeg** will be reasonably fast (~1-2 seconds).
    *   **SAM (High Precision)** will be slow (~5-10 seconds per image).
    *   If you want it fast, you can upgrade to a GPU space later (paid), but CPU is free forever.
2.  **Sleep**: The Space might "sleep" after 48 hours of inactivity. It will wake up automatically when someone visits the link (it takes ~10 seconds to wake up).

## 🔧 Troubleshooting

*   **"Runtime Error"**: Check the **Logs** tab in your Space.
*   **"Module not found"**: Ensure `backend/requirements.txt` was uploaded.
*   **"Memory Error"**: The SAM model is large. The free tier has 16GB RAM which is plenty, but if it crashes, try disabling SAM in `main.py` or using a smaller model.
