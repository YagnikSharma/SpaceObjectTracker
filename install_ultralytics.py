#!/usr/bin/env python3.9
"""
Ultralytics Installation Script

This script attempts to install the Ultralytics package using Python 3.9
to avoid compatibility issues that occur with newer Python versions.
"""

import os
import sys
import subprocess
import platform

def main():
    # Print Python version information
    print(f"Python version: {platform.python_version()}")
    print(f"Python executable: {sys.executable}")
    print(f"Platform: {platform.platform()}")
    
    # Try to install ultralytics
    print("\nAttempting to install ultralytics...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "ultralytics"])
        print("✅ Ultralytics installed successfully!")
        
        # Verify installation
        try:
            import ultralytics
            print(f"Ultralytics version: {ultralytics.__version__}")
            print("✅ Import successful!")
        except ImportError as e:
            print(f"❌ Import failed: {e}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed: {e}")
    
if __name__ == "__main__":
    main()