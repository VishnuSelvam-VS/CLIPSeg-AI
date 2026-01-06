
try:
    from diffusers import AutoPipelineForInpainting, DPMSolverMultistepScheduler
    print("✅ Adapters imported successfully")
except ImportError as e:
    print(f"❌ Import failed: {e}")
