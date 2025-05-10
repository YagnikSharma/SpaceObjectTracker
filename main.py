#!/usr/bin/env python3
"""
Space Station Object Detection Demo Script

This script provides a simple way to test the detection of space station objects:
- Fire extinguisher (red labels)
- Oxygen tank (blue labels)
- Toolbox (yellow labels)

Usage:
    python main.py

This will look for images in the 'uploads' folder and run detection on them.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Try to import the detector module
try:
    from server.python.yolo_detector import detect_objects
    print("Successfully imported detector module")
except ImportError as e:
    print(f"Error: Could not import detector module: {e}")
    sys.exit(1)

def main():
    """Main function for demo script"""
    # Check for YOLOv8 model
    model_path = os.path.join("models", "yolov8s.pt")
    if not os.path.exists(model_path):
        model_path = os.path.join("attached_assets", "yolov8s.pt")
        if not os.path.exists(model_path):
            print("Error: YOLOv8 model not found. Please ensure 'yolov8s.pt' is in 'models/' or 'attached_assets/' folder")
            sys.exit(1)
    
    print(f"Found YOLOv8 model at: {model_path}")
    
    # Create output directory if it doesn't exist
    os.makedirs("results", exist_ok=True)
    
    # Check if uploads folder exists
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        print(f"Error: Uploads folder '{uploads_dir}' not found")
        sys.exit(1)
    
    # Get image files from uploads folder
    image_files = [f for f in os.listdir(uploads_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    if not image_files:
        print(f"No image files found in '{uploads_dir}' folder")
        print("Please place some images in the uploads folder and run again")
        sys.exit(1)
    
    # Process each image
    print(f"Found {len(image_files)} images to process")
    
    for idx, img_file in enumerate(image_files, 1):
        image_path = os.path.join(uploads_dir, img_file)
        output_path = os.path.join("results", f"detection_{Path(img_file).stem}.json")
        
        print(f"\nProcessing image {idx}/{len(image_files)}: {img_file}")
        
        # Run detection
        results = detect_objects(image_path, model_path)
        
        # Save results
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Display results
        if results['success']:
            print(f"✓ Detection successful: Found {results['count']} objects")
            for i, obj in enumerate(results['detections'], 1):
                print(f"  {i}. {obj['label']} (confidence: {obj['confidence']:.2f})")
                print(f"     Color: {obj['color']}")
                print(f"     Context: {obj['context']}")
        else:
            print(f"✗ Detection failed: {results.get('error', 'Unknown error')}")
    
    print("\nAll images processed. Results saved to 'results/' folder.")

if __name__ == "__main__":
    print("Space Station Object Detection Demo")
    print("===================================")
    main()