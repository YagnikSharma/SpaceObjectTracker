"""
Simple script to test if ultralytics can be installed and imported with Python 3.9
"""

import sys
import importlib.util

def check_package(package_name):
    """Check if a package is installed"""
    spec = importlib.util.find_spec(package_name)
    if spec is None:
        print(f"{package_name} is NOT installed")
        return False
    else:
        print(f"{package_name} is installed")
        return True

def main():
    """Main function"""
    print(f"Python version: {sys.version}")
    
    # Check for numpy
    if not check_package("numpy"):
        print("Installing numpy...")
        try:
            import pip
            pip.main(['install', 'numpy'])
            import numpy
            print(f"NumPy version: {numpy.__version__}")
        except Exception as e:
            print(f"Error installing numpy: {e}")
            return
    
    # Check for opencv
    if not check_package("cv2"):
        print("Installing opencv-python...")
        try:
            import pip
            pip.main(['install', 'opencv-python'])
            import cv2
            print(f"OpenCV version: {cv2.__version__}")
        except Exception as e:
            print(f"Error installing opencv-python: {e}")
            return
    
    # Check for ultralytics
    if not check_package("ultralytics"):
        print("Installing ultralytics...")
        try:
            import pip
            pip.main(['install', 'ultralytics'])
        except Exception as e:
            print(f"Error installing ultralytics: {e}")
            return
    
    # Try to import YOLO
    try:
        from ultralytics import YOLO
        print("Successfully imported YOLO from ultralytics!")
    except ImportError as e:
        print(f"Error importing YOLO: {e}")
        return
    
    print("All packages successfully installed and imported!")

if __name__ == "__main__":
    main()