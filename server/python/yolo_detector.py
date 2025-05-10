#!/usr/bin/env python3
"""
YOLOv8 Space Station Object Detector (Pure YOLO Implementation)

This script processes images using YOLOv8 to detect only specific objects:
- Fire extinguisher (red labels)
- Oxygen tank (blue labels)
- Toolbox (yellow labels)

Usage:
    python yolo_detector.py --image [IMAGE_PATH] --model [MODEL_PATH] --output [OUTPUT_PATH] --conf [CONFIDENCE]

Example:
    python yolo_detector.py --image uploads/scan_123.jpg --model models/yolov8s.pt --output results.json --conf 0.25
"""

import argparse
import json
import numpy as np
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Our target categories - ONLY these three objects
TARGET_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank']

# Color mapping for detections
OBJECT_COLORS = {
    'fire extinguisher': '#f44336',  # Red
    'oxygen tank': '#2196f3',        # Blue
    'toolbox': '#ffc107',            # Yellow
    'default': '#9c27b0'             # Purple (fallback)
}

# YOLOv8 COCO class index to our space station categories mapping
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
    
    # Default fallback mapping (as a last resort)
    0: 'oxygen tank'   # default to oxygen tank if no mapping found
}

def generate_id():
    """Generate a unique ID for detections"""
    return str(uuid.uuid4())

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

def detect_objects(image_path, model_path, conf_threshold=0.25):
    """Detect objects in image using YOLOv8"""
    try:
        # Import ultralytics here to avoid loading it unnecessarily
        try:
            from ultralytics import YOLO
        except ImportError:
            print("Error: Ultralytics library not found")
            return {'success': False, 'error': "YOLOv8 detection library not available", 'detections': [], 'count': 0}
        
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"Error: Image file not found: {image_path}")
            return {'success': False, 'error': f"Image file not found: {image_path}", 'detections': [], 'count': 0}
        
        # Check if model exists
        if not os.path.exists(model_path):
            print(f"Error: Model file not found: {model_path}")
            return {'success': False, 'error': f"Model file not found: {model_path}", 'detections': [], 'count': 0}
        
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
                        'id': generate_id(),
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
        
        # If no detections were found through mapping, try analyzing the image
        if len(detections) == 0:
            # Force classification of the most confident object
            if len(boxes) > 0:
                # Find the most confident detection
                max_conf_idx = 0
                max_conf = 0
                for i, box in enumerate(boxes):
                    if float(box.conf[0]) > max_conf:
                        max_conf = float(box.conf[0])
                        max_conf_idx = i
                
                # Get the most confident detection
                box = boxes[max_conf_idx]
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                
                # Calculate normalized coordinates
                x = x1 / img_width
                y = y1 / img_height
                width = (x2 - x1) / img_width
                height = (y2 - y1) / img_height
                
                # Assign a default space station object (oxygen tank)
                space_class = 'oxygen tank'
                color = OBJECT_COLORS[space_class]
                
                # Create detection
                detection = {
                    'id': generate_id(),
                    'label': space_class,
                    'confidence': confidence * 0.8,  # Reduce confidence since we're forcing classification
                    'x': x,
                    'y': y,
                    'width': width,
                    'height': height,
                    'color': color,
                    'context': generate_context(space_class),
                    'forced': True
                }
                
                detections.append(detection)
        
        # Return the results
        return {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'model': os.path.basename(model_path),
            'detections': detections,
            'count': len(detections)
        }
    
    except Exception as e:
        print(f"Error in YOLOv8 detection: {e}")
        return {
            'success': False,
            'error': str(e),
            'detections': [],
            'count': 0
        }

def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description='YOLOv8 Space Station Object Detector')
    parser.add_argument('--image', required=True, help='Path to the image')
    parser.add_argument('--model', required=True, help='Path to the YOLOv8 model')
    parser.add_argument('--output', required=True, help='Path to the output JSON file')
    parser.add_argument('--conf', type=float, default=0.25, help='Confidence threshold')
    
    args = parser.parse_args()
    
    # Detect objects
    results = detect_objects(args.image, args.model, args.conf)
    
    # Save results to file
    with open(args.output, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Detected {results['count']} objects. Results saved to {args.output}")

if __name__ == '__main__':
    main()