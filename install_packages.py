#!/usr/bin/env python3.10
"""
Script to install required packages for Python 3.10
"""

import sys
import subprocess

def main():
    print(f"Python version: {sys.version}")
    packages = ["numpy", "opencv-python", "ultralytics"]
    
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
            return 1
    
    print("\nAll packages installed. Checking imports...")
    
    try:
        import numpy
        print(f"✅ numpy version: {numpy.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import numpy: {e}")
        return 1
    
    try:
        import cv2
        print(f"✅ opencv-python version: {cv2.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import cv2: {e}")
        return 1
    
    try:
        import ultralytics
        print(f"✅ ultralytics version: {ultralytics.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import ultralytics: {e}")
        return 1
    
    print("\nAll imports successful! 🎉")
    return 0

if __name__ == "__main__":
    sys.exit(main())