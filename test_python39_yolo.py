#!/usr/bin/env python3
"""
Test script to verify the Python 3.9 + Ultralytics installation
"""

import os
import sys
import subprocess
import json

def main():
    # Check for Python 3.9
    python39_path = "/home/runner/workspace/.pythonlibs/bin/python3.9"
    if not os.path.exists(python39_path):
        print(f"Error: Python 3.9 not found at {python39_path}")
        return 1
    
    print(f"Python 3.9 found at: {python39_path}")
    
    # Check for ultralytics installation in Python 3.9
    try:
        cmd = [python39_path, "-c", "import ultralytics; print(f'Ultralytics version: {ultralytics.__version__}')"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Ultralytics is properly installed in Python 3.9")
            print(result.stdout.strip())
        else:
            print("❌ Ultralytics import failed in Python 3.9")
            print(result.stderr.strip())
            
            # Try installing it
            print("\nAttempting to install ultralytics in Python 3.9...")
            install_cmd = [python39_path, "-m", "pip", "install", "ultralytics"]
            install_result = subprocess.run(install_cmd, capture_output=True, text=True)
            
            if install_result.returncode == 0:
                print("✅ Ultralytics installed successfully")
            else:
                print("❌ Ultralytics installation failed")
                print(install_result.stderr.strip())
                return 1
    except Exception as e:
        print(f"Error checking ultralytics: {e}")
        return 1
    
    # Test the subprocess detector
    print("\nTesting subprocess detector...")
    subprocess_script = "server/python/yolo_subprocess.py"
    if not os.path.exists(subprocess_script):
        print(f"Error: Subprocess script not found at {subprocess_script}")
        return 1
    
    # Find a test image
    test_image = None
    for path in ["uploads", "attached_assets"]:
        if os.path.exists(path):
            for file in os.listdir(path):
                if file.endswith((".jpg", ".jpeg", ".png")):
                    test_image = os.path.join(path, file)
                    break
            if test_image:
                break
    
    if not test_image:
        print("Error: No test image found")
        return 1
    
    # Find the YOLOv8 model
    model_path = "models/yolov8s.pt"
    if not os.path.exists(model_path):
        model_path = "attached_assets/yolov8s.pt"
        if not os.path.exists(model_path):
            print("Error: YOLOv8 model not found")
            return 1
    
    # Create output path
    os.makedirs("results", exist_ok=True)
    output_path = "results/test_output.json"
    
    # Run the subprocess detector
    try:
        cmd = [
            python39_path,
            subprocess_script,
            "--image", test_image,
            "--model", model_path,
            "--output", output_path,
            "--conf", "0.25"
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Subprocess detector ran successfully")
            
            if os.path.exists(output_path):
                with open(output_path, 'r') as f:
                    detection_results = json.load(f)
                
                if detection_results.get('success', False):
                    print(f"✅ Detection successful: {detection_results.get('count', 0)} objects found")
                    for i, obj in enumerate(detection_results.get('detections', []), 1):
                        print(f"  {i}. {obj['label']} (confidence: {obj['confidence']:.2f})")
                        print(f"     Color: {obj['color']}")
                else:
                    print(f"❌ Detection failed: {detection_results.get('error', 'Unknown error')}")
            else:
                print(f"❌ Output file not created: {output_path}")
        else:
            print("❌ Subprocess detector failed")
            print(f"Error: {result.stderr.strip()}")
    except Exception as e:
        print(f"Error running subprocess detector: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())