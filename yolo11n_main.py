#!/usr/bin/env python3
"""
Space Station Object Detection Demo with YOLOv11n Model

This script provides a simple way to test the detection of space station objects
using the specialized YOLOv11n model with Python 3.10:
- Fire extinguisher (red labels)
- Oxygen tank (blue labels)
- Toolbox (yellow labels)

Usage:
    python3.10 yolo11n_main.py [image_path]

If no image path is provided, it will process all images in the 'uploads' folder.
"""

import os
import sys
import json
import argparse
import glob
from datetime import datetime

def run_detection(image_path, output_folder="results"):
    """Run the YOLOv11n detection on a single image"""
    # Create a unique output filename
    basename = os.path.basename(image_path)
    name, ext = os.path.splitext(basename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"{output_folder}/detection_{name}_{timestamp}.json"
    
    # Ensure output directory exists
    os.makedirs(output_folder, exist_ok=True)
    
    # Path to our model
    model_path = "models/yolo11n.pt"
    
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        return False
    
    print(f"Attempting YOLOv11n detection...")
    
    # Command to run the detector script
    detector_script = "server/python/yolo11n_detector.py"
    cmd = f"python3.10 {detector_script} --image {image_path} --model {model_path} --output {output_file} --conf 0.25"
    
    print(f"Running YOLOv11n detection: {cmd}")
    exit_code = os.system(cmd)
    
    if exit_code != 0:
        print(f"Error: Detection failed with exit code {exit_code}")
        return False
    
    # Read the detection results
    if not os.path.exists(output_file):
        print(f"Error: Detection output file not found: {output_file}")
        return False
    
    with open(output_file, 'r') as f:
        try:
            results = json.load(f)
        except json.JSONDecodeError:
            print(f"Error: Could not parse detection results JSON")
            return False
    
    # Extract method used and number of detections
    method = results.get('method', 'unknown')
    detections = results.get('detections', [])
    count = len(detections)
    
    print(f"Detection method used: {method}")
    
    # Print the detection results in a readable format
    if count > 0:
        print(f"✓ Detection successful: Found {count} objects")
        for i, detection in enumerate(detections, 1):
            label = detection.get('label', 'unknown')
            confidence = detection.get('confidence', 0.0)
            color = detection.get('color', '#000000')
            context = detection.get('context', '')
            
            print(f"  {i}. {label} (confidence: {confidence:.2f})")
            print(f"     Color: {color}")
            print(f"     Context: {context}")
    else:
        print("✗ No objects detected")
    
    return True

def main():
    """Main function for demo script"""
    print("Space Station Object Detection Demo with YOLOv11n")
    print("=================================================")
    
    # Create parser
    parser = argparse.ArgumentParser(description='Space Station Object Detection with YOLOv11n')
    parser.add_argument('image_path', nargs='?', help='Path to image file (optional)')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Find images to process
    if args.image_path:
        # Process a single image
        if os.path.isfile(args.image_path):
            images = [args.image_path]
        else:
            print(f"Error: Image file not found: {args.image_path}")
            return
    else:
        # Process all images in the uploads folder
        image_patterns = ['uploads/*.jpg', 'uploads/*.jpeg', 'uploads/*.png']
        images = []
        for pattern in image_patterns:
            images.extend(glob.glob(pattern))
    
    # Ensure we have images to process
    if not images:
        print("No images found to process.")
        print("Please provide an image path or place images in the 'uploads' folder.")
        return
    
    print(f"Found {len(images)} images to process\n")
    
    # Process each image
    for i, image_path in enumerate(images, 1):
        print(f"Processing image {i}/{len(images)}: {os.path.basename(image_path)}")
        run_detection(image_path)
        print("")
    
    print("All images processed. Results saved to 'results/' folder.")

if __name__ == "__main__":
    main()