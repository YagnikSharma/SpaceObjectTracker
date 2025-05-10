#!/usr/bin/env python3.9
"""
YOLOv8 Detection Subprocess

This script is designed to be called by Python 3.9 as a subprocess to leverage
Ultralytics YOLOv8 for detection when the main Python version doesn't support it.

Usage:
    python3.9 yolo_subprocess.py --image [IMAGE_PATH] --model [MODEL_PATH] --output [OUTPUT_PATH] --conf [CONF]
"""

import argparse
import json
import os
import sys
from datetime import datetime

# Try to import Ultralytics
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    print("Error: Ultralytics not available in Python 3.9 subprocess")
    YOLO_AVAILABLE = False
    sys.exit(1)

# Target categories
TARGET_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank']

# YOLO class mappings
YOLO_CLASS_MAPPING = {
    # Container-like objects to toolbox
    24: 'toolbox',  # backpack
    26: 'toolbox',  # handbag
    28: 'toolbox',  # suitcase
    33: 'toolbox',  # books
    73: 'toolbox',  # laptop
    
    # Cylinder-like objects to fire extinguisher
    39: 'fire extinguisher',  # bottle
    41: 'fire extinguisher',  # wine glass
    44: 'fire extinguisher',  # bottle
    76: 'fire extinguisher',  # keyboard
    
    # Round/spherical objects to oxygen tank
    32: 'oxygen tank',  # sports ball
    45: 'oxygen tank',  # bowl
}

# Color mapping
OBJECT_COLORS = {
    'fire extinguisher': '#f44336',  # Red
    'oxygen tank': '#2196f3',        # Blue
    'toolbox': '#ffc107',            # Yellow
    'default': '#9c27b0'             # Purple (fallback)
}

def generate_context(label):
    """Generate contextual information for detections"""
    label_lower = label.lower()
    
    if 'fire' in label_lower or 'extinguisher' in label_lower:
        return 'Critical safety equipment. Check pressure gauge and ensure easy access.'
    elif 'oxygen' in label_lower or 'tank' in label_lower:
        return 'Life support equipment. Verify pressure levels and connection integrity.'
    elif 'tool' in label_lower or 'box' in label_lower:
        return 'Equipment storage. Ensure proper organization and inventory completion.'
    
    return 'Space station component. Monitor for proper functionality.'

def detect_with_yolo(image_path, model_path, conf_threshold=0.25):
    """Run YOLOv8 detection"""
    try:
        # Check paths
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        # Load model and run inference
        model = YOLO(model_path)
        results = model(image_path, conf=conf_threshold)
        
        # Extract detections
        detections = []
        
        # Process results
        for result in results:
            boxes = result.boxes
            
            # Get image dimensions
            img_height, img_width = result.orig_shape
            
            for i, box in enumerate(boxes):
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Calculate normalized coordinates
                x = x1 / img_width
                y = y1 / img_height
                width = (x2 - x1) / img_width
                height = (y2 - y1) / img_height
                
                # Get confidence and class
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                original_class = result.names[class_id]
                
                # Map to our space station object categories
                space_class = None
                
                # STEP 1: Try direct name mapping
                for category in TARGET_CATEGORIES:
                    if category in original_class.lower():
                        space_class = category
                        break
                
                # STEP 2: Try class ID mapping
                if not space_class and class_id in YOLO_CLASS_MAPPING:
                    space_class = YOLO_CLASS_MAPPING[class_id]
                
                # STEP 3: Check for synonyms
                if not space_class:
                    if any(word in original_class.lower() for word in ['tool', 'box', 'container', 'kit', 'bag']):
                        space_class = 'toolbox'
                    elif any(word in original_class.lower() for word in ['fire', 'extinguisher', 'bottle', 'cylinder']):
                        space_class = 'fire extinguisher'
                    elif any(word in original_class.lower() for word in ['oxygen', 'tank', 'gas', 'canister', 'tube']):
                        space_class = 'oxygen tank'
                
                # Only proceed if we mapped to one of our categories
                if space_class in TARGET_CATEGORIES:
                    # Get color for this category
                    color = OBJECT_COLORS.get(space_class, OBJECT_COLORS['default'])
                    
                    # Create detection object
                    detection = {
                        'label': space_class,
                        'confidence': confidence,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'color': color,
                        'context': generate_context(space_class),
                        'originalClass': original_class
                    }
                    
                    detections.append(detection)
        
        return {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'model': os.path.basename(model_path),
            'method': 'yolov8-py39',
            'detections': detections,
            'count': len(detections)
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'detections': [],
            'count': 0
        }

def main():
    """Main entry point for command-line usage"""
    parser = argparse.ArgumentParser(description='YOLOv8 Detection Subprocess')
    parser.add_argument('--image', required=True, help='Path to the image')
    parser.add_argument('--model', required=True, help='Path to the YOLOv8 model')
    parser.add_argument('--output', required=True, help='Path to output JSON results')
    parser.add_argument('--conf', type=float, default=0.25, help='Confidence threshold')
    
    args = parser.parse_args()
    
    # Run detection
    results = detect_with_yolo(args.image, args.model, args.conf)
    
    # Write results to output file
    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Also print to stdout for parent process
    print(json.dumps(results))
    
    # Return success
    return 0 if results['success'] else 1

if __name__ == '__main__':
    sys.exit(main())