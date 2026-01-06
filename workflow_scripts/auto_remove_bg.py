"""
Batch Background Removal Script
-------------------------------
This script monitors an input directory for new images, removes their background using the local AI server,
and saves the result to an output directory.

Prerequisites:
- Ensure the backend server is running: `python backend/main.py`
- Install requests: `pip install requests`

Usage:
python workflow_scripts/auto_remove_bg.py --input raw_photos --output processed_imgs
"""

import os
import time
import argparse
import requests
import sys
from pathlib import Path

# Configuration
SERVER_URL = "http://localhost:8000/remove-bg"
SUPPORTED_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}

def process_file(file_path, output_dir, prompt="main object"):
    filename = os.path.basename(file_path)
    print(f"🔄 Processing: {filename}...", end="", flush=True)
    
    try:
        with open(file_path, 'rb') as f:
            t0 = time.time()
            response = requests.post(
                SERVER_URL, 
                files={'image': f},
                data={'prompt': prompt}
            )
            
            if response.status_code == 200:
                output_filename = f"nobg_{os.path.splitext(filename)[0]}.png"
                output_path = os.path.join(output_dir, output_filename)
                
                with open(output_path, 'wb') as out:
                    out.write(response.content)
                
                duration = time.time() - t0
                print(f" ✅ Done ({duration:.2f}s) -> saved to {output_filename}")
                return True
            else:
                print(f" ❌ Failed: {response.status_code} - {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(" ❌ Error: Connection failed. Is the backend server running?")
        return False
    except Exception as e:
        print(f" ❌ Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Automated Background Removal Workflow")
    parser.add_argument("--input", "-i", type=str, default="raw_images", help="Input folder containing images")
    parser.add_argument("--output", "-o", type=str, default="processed_images", help="Output folder")
    parser.add_argument("--prompt", "-p", type=str, default="main object", help="What to cut out (default: 'main object')")
    parser.add_argument("--watch", "-w", action="store_true", help="Watch folder mode (process new files as they arrive)")
    
    args = parser.parse_args()
    
    # Create directories
    os.makedirs(args.input, exist_ok=True)
    os.makedirs(args.output, exist_ok=True)
    
    print(f"🚀 Started Batch Automator")
    print(f"📂 Input:  {os.path.abspath(args.input)}")
    print(f"📂 Output: {os.path.abspath(args.output)}")
    print(f"🎯 Target: '{args.prompt}'")
    
    processed = set()
    
    # Initial pass
    files = [f for f in os.listdir(args.input) if os.path.splitext(f.lower())[1] in SUPPORTED_EXTS]
    print(f"📊 Found {len(files)} existing files.")
    
    for f in files:
        if process_file(os.path.join(args.input, f), args.output, args.prompt):
            processed.add(f)
            
    if args.watch:
        print("\n👀 Watching for new files... (Ctrl+C to stop)")
        try:
            while True:
                time.sleep(1)
                current_files = set(f for f in os.listdir(args.input) if os.path.splitext(f.lower())[1] in SUPPORTED_EXTS)
                new_files = current_files - processed
                
                for f in new_files:
                    if process_file(os.path.join(args.input, f), args.output, args.prompt):
                        processed.add(f)
                        
        except KeyboardInterrupt:
            print("\n🛑 Stopped.")

if __name__ == "__main__":
    main()
