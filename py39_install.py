"""
Direct installer for ultralytics in Python 3.9
"""

import subprocess
import sys
import os

def run_command(cmd):
    """Run a command and return the output"""
    print(f"Running: {' '.join(cmd)}")
    process = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
    )
    for line in iter(process.stdout.readline, ''):
        print(line, end='')
    process.stdout.close()
    return process.wait()

def main():
    # Check Python version
    print(f"Python version: {sys.version}")
    if not sys.version.startswith("3.9"):
        print("This script must be run with Python 3.9")
        return
    
    # Create virtual environment directory if it doesn't exist
    venv_dir = os.path.join("py39_env", "venv")
    if not os.path.exists(venv_dir):
        os.makedirs("py39_env", exist_ok=True)
        run_command([sys.executable, "-m", "venv", venv_dir])
    
    # Get the path to the virtual environment python
    if sys.platform == "win32":
        venv_python = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        venv_python = os.path.join(venv_dir, "bin", "python")
    
    # Upgrade pip in the virtual environment
    run_command([venv_python, "-m", "pip", "install", "--upgrade", "pip"])
    
    # Install dependencies
    print("Installing dependencies...")
    run_command([venv_python, "-m", "pip", "install", "wheel", "setuptools"])
    run_command([venv_python, "-m", "pip", "install", "numpy"])
    run_command([venv_python, "-m", "pip", "install", "opencv-python"])
    
    # Install ultralytics
    print("Installing ultralytics...")
    run_command([venv_python, "-m", "pip", "install", "ultralytics"])
    
    # Test ultralytics import
    print("Testing ultralytics import...")
    test_import = f'''
import sys
print(f"Python version: {sys.version}")
try:
    import numpy
    print(f"NumPy version: {numpy.__version__}")
    import cv2
    print(f"OpenCV version: {cv2.__version__}")
    from ultralytics import YOLO
    print("Ultralytics imported successfully!")
    print("Installation complete!")
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)
'''
    
    # Write test script
    with open("test_import.py", "w") as f:
        f.write(test_import)
    
    # Run test script
    run_command([venv_python, "test_import.py"])

if __name__ == "__main__":
    main()