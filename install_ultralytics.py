#!/usr/bin/env python3.10
"""
Ultralytics Installation Script

This script attempts to install the Ultralytics package using Python 3.10
to avoid compatibility issues that occur with newer Python versions.
"""

import os
import sys
import subprocess
import time

def main():
    """Main installation function"""
    print(f"Current Python version: {sys.version}")
    
    if not sys.version.startswith("3.10"):
        print("Warning: This script should be run with Python 3.10 for optimal compatibility")
        print(f"Current Python: {sys.executable}")
    
    # Required packages for YOLOv8
    packages = [
        "numpy", 
        "opencv-python", 
        "ultralytics"
    ]
    
    # Install packages
    for package in packages:
        print(f"Installing {package}...")
        
        try:
            # Install with pip
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", "--upgrade", package]
            )
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            print("Continuing with installation...")
            continue
    
    # Verify installations
    print("\nVerifying installations:")
    try:
        import numpy
        print(f"✅ numpy version: {numpy.__version__}")
    except ImportError:
        print("❌ numpy import failed")
    
    try:
        import cv2
        print(f"✅ opencv-python version: {cv2.__version__}")
    except ImportError:
        print("❌ opencv-python import failed")
    
    try:
        import ultralytics
        print(f"✅ ultralytics version: {ultralytics.__version__}")
    except ImportError:
        print("❌ ultralytics import failed")
    
    # Create necessary directories
    print("\nCreating necessary directories:")
    directories = [
        "models",
        "uploads",
        "datasets"
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            print(f"Created directory: {directory}")
    
    # Check for YOLOv8 model file
    model_path = os.path.join("models", "yolov8s.pt")
    if not os.path.exists(model_path):
        print(f"YOLOv8 model not found at {model_path}")
        
        try:
            # Run a simple test to download the model
            print("Attempting to download YOLOv8 model...")
            test_script = """
import ultralytics
from ultralytics import YOLO

# This will download the model if it doesn't exist
model = YOLO('yolov8s.pt')
print(f"Model loaded: {model}")
"""
            with open("download_model.py", "w") as f:
                f.write(test_script)
            
            subprocess.check_call([sys.executable, "download_model.py"])
            print("Model download attempted")
            
            # Copy to models directory
            import shutil
            if os.path.exists("yolov8s.pt"):
                shutil.copy("yolov8s.pt", model_path)
                print(f"Model copied to {model_path}")
        except Exception as e:
            print(f"Error downloading model: {e}")
    else:
        print(f"YOLOv8 model found at {model_path}")
    
    print("\nInstallation complete!")
    return 0

if __name__ == "__main__":
    start_time = time.time()
    result = main()
    elapsed = time.time() - start_time
    print(f"Installation completed in {elapsed:.2f} seconds")
    sys.exit(result)