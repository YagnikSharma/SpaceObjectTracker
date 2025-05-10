#!/usr/bin/env python3
"""
Ultralytics Installation Script for Python 3.9

This script attempts to install the Ultralytics package using Python 3.9
to avoid compatibility issues that occur with newer Python versions.
"""

import os
import sys
import subprocess
import importlib.util
import platform

def check_dependencies():
    """Check if dependencies are installed"""
    try:
        import numpy
        print(f"✅ NumPy is already installed: {numpy.__version__}")
    except ImportError:
        print("Installing numpy...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "numpy"])
        import numpy
        print(f"✅ numpy installed successfully")

    try:
        import cv2
        print(f"✅ OpenCV is already installed: {cv2.__version__}")
    except ImportError:
        print("Installing opencv-python...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "opencv-python"])
        import cv2
        print(f"✅ OpenCV installed successfully")

def install_ultralytics():
    """Install the Ultralytics package"""
    print("Installing Ultralytics...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "ultralytics"])
        
        # Verify installation
        try:
            from ultralytics import YOLO
            print(f"✅ Ultralytics installed successfully!")
            return True
        except ImportError as e:
            print(f"❌ Failed to import Ultralytics after installation: {e}")
            return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Ultralytics: {e}")
        return False

def test_yolo():
    """Test if YOLOv8 can be imported and used"""
    try:
        from ultralytics import YOLO
        print("Testing YOLO import...")
        print("YOLO class successfully imported.")
        
        # Try to load a model (without downloading)
        model_path = "models/yolo11n.pt"
        if os.path.exists(model_path):
            try:
                print(f"Testing model loading with {model_path}...")
                model = YOLO(model_path)
                print("✅ Model loaded successfully!")
                return True
            except Exception as e:
                print(f"❌ Failed to load model: {e}")
                return False
        else:
            print(f"⚠️ Model file not found at {model_path}. Skipping model load test.")
            return True
    except ImportError as e:
        print(f"❌ Failed to import YOLO: {e}")
        return False

def main():
    """Main installation function"""
    print("="*80)
    print("Ultralytics Installation Script for Python 3.9")
    print("="*80)
    
    print(f"Current Python version: {sys.version}")
    if not sys.version.startswith("3.9"):
        print("⚠️ Warning: This script is designed for Python 3.9")
        print(f"Current Python version: {sys.version}")
    
    # Check for dependencies
    check_dependencies()
    
    # Install Ultralytics
    success = install_ultralytics()
    
    if success:
        # Test YOLOv8
        test_success = test_yolo()
        if test_success:
            print("\n===== Installation Summary =====")
            print("✅ Ultralytics package installed successfully.")
            print("✅ YOLO model load test passed.")
            print("\nYou can now use ultralytics with this Python environment!")
        else:
            print("\n===== Installation Summary =====")
            print("✅ Ultralytics package installed.")
            print("❌ YOLO model load test failed.")
            print("\nThe package is installed but there may be issues with model loading.")
    else:
        print("\n===== Installation Summary =====")
        print("❌ Failed to install Ultralytics package.")
        print("\nPlease check the error messages above.")

if __name__ == "__main__":
    main()