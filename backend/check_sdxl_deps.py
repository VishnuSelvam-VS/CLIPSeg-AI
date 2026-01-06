
import sys
import os

print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")

print("-" * 20)

try:
    import torch
    print(f"✅ torch: {torch.__version__}")
    print(f"   CUDA available: {torch.cuda.is_available()}")
except ImportError as e:
    print(f"❌ torch: Not found ({e})")

try:
    import diffusers
    print(f"✅ diffusers: {diffusers.__version__}")
except ImportError as e:
    print(f"❌ diffusers: Not found ({e})")

try:
    import accelerate
    print(f"✅ accelerate: {accelerate.__version__}")
except ImportError as e:
    print(f"❌ accelerate: Not found ({e})")

try:
    import safetensors
    print(f"✅ safetensors: {safetensors.__version__}")
except ImportError as e:
    print(f"❌ safetensors: Not found ({e})")

try:
    import scipy
    print(f"✅ scipy: {scipy.__version__}")
except ImportError as e:
    print(f"❌ scipy: Not found ({e})")
