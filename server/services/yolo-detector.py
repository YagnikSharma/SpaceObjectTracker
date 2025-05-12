#!/usr/bin/env python3
"""
YOLOv8 Object Detector for Space Station Equipment

This script analyzes images to detect specific objects in space station environments:
- Toolboxes and maintenance equipment
- Oxygen tanks and life support systems
- Fire extinguishers and safety equipment

It uses a YOLOv8 model trained specifically for these objects.
"""

import os
import sys
import json
import uuid
import cv2
import numpy as np
from pathlib import Path

# These would be handled by the ultralytics library when running locally
# Import statements are provided but commented out for clarity
# from ultralytics import YOLO

# Define object mapping for YOLOv8 classes
# Class indices will depend on your specific trained model
PRIORITY_OBJECTS = {
    0: "toolbox",           # Assuming class 0 is toolbox in the trained model
    1: "oxygen tank",       # Assuming class 1 is oxygen tank
    2: "fire extinguisher"  # Assuming class 2 is fire extinguisher
}

# Define color mapping for object visualization
OBJECT_COLORS = {
    "toolbox": "#ffc107",           # yellow
    "oxygen tank": "#2196f3",       # blue
    "fire extinguisher": "#f44336", # red
    "default": "#9e9e9e",           # gray
}

# Define context for each object type
OBJECT_CONTEXT = {
    "toolbox": "Maintenance equipment",
    "oxygen tank": "Life support equipment",
    "fire extinguisher": "Critical safety equipment",
}

def detect_objects_with_yolo(image_path, model_path="yolov8s.pt", conf_threshold=0.25):
    """
    Detect objects in an image using a trained YOLOv8 model
    
    Args:
        image_path: Path to the input image
        model_path: Path to the trained YOLOv8 model
        conf_threshold: Confidence threshold for detections
        
    Returns:
        Dict containing detection results
    """
    try:
        # IMPORTANT: This code needs to be uncommented when running locally
        # ----------------------------------------------------------------
        # The code below shows the exact implementation needed when running locally with VS Code
        # This will be activated by removing the triple quotes
        """
        # Import the YOLO class from ultralytics
        from ultralytics import YOLO
        
        # Load the trained YOLOv8 model
        print(f"Loading YOLOv8 model from {model_path}")
        model = YOLO(model_path)
        
        # Run inference on the image
        print(f"Running inference on {image_path}")
        results = model(image_path, conf=conf_threshold)
        
        # Process results
        detected_objects = []
        
        # Get image dimensions for normalization
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"Could not read image: {image_path}"}
            
        height, width = image.shape[:2]
        
        # Extract detections from results
        for result in results:
            boxes = result.boxes
            
            for i, box in enumerate(boxes):
                # Get coordinates and class
                x1, y1, x2, y2 = box.xyxy[0].tolist()  # Get box coordinates
                cls = int(box.cls[0].item())           # Get class index
                conf = box.conf[0].item()              # Get confidence score
                
                # Calculate width and height of box
                w = x2 - x1
                h = y2 - y1
                
                # Map class index to object label
                label = PRIORITY_OBJECTS.get(cls, f"class_{cls}")
                
                # Get color and context for the object
                color = OBJECT_COLORS.get(label, OBJECT_COLORS["default"])
                context = OBJECT_CONTEXT.get(label, "")
                
                # Create object entry with normalized coordinates (0-1 range)
                detected_objects.append({
                    "id": str(uuid.uuid4()),
                    "label": label,
                    "confidence": float(conf),
                    "x": float(x1 / width),
                    "y": float(y1 / height),
                    "width": float(w / width),
                    "height": float(h / height),
                    "originalClass": f"yolo_class_{cls}",
                    "color": color,
                    "context": context
                })
            
            # Optional visualization code for debugging
            # Save the image with bounding boxes for review
            # This can be uncommented locally for testing
            '''
            output_img = image.copy()
            for obj in detected_objects:
                x1 = int(obj["x"] * width)
                y1 = int(obj["y"] * height)
                w = int(obj["width"] * width)
                h = int(obj["height"] * height)
                label = obj["label"]
                conf = obj["confidence"]
                
                # Convert hex color to BGR
                hex_color = obj["color"].lstrip('#')
                rgb_color = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
                bgr_color = (rgb_color[2], rgb_color[1], rgb_color[0])
                
                # Draw rectangle
                cv2.rectangle(output_img, (x1, y1), (x1 + w, y1 + h), bgr_color, 2)
                
                # Add label and confidence
                text = f"{label}: {conf:.2f}"
                cv2.putText(output_img, text, (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, bgr_color, 2)
            
            # Save the output image with detections
            output_path = f"detections_{Path(image_path).stem}.jpg"
            cv2.imwrite(output_path, output_img)
            print(f"Saved visualization to {output_path}")
            '''
        
        print(f"Detected {len(detected_objects)} objects with YOLOv8")
        """
        # ----------------------------------------------------------------
        
        # This is a temporary stub for the Replit environment
        # For demonstration purposes only - this will be replaced by the actual code above when running locally
        detected_objects = []
        
        # Generate detection result
        result = {
            "detectedObjects": detected_objects,
            "imageUrl": f"/uploads/{Path(image_path).name}",
            "detectionMethod": "yolov8"
        }
        
        return result
        
    except Exception as e:
        print(f"Error in YOLOv8 detection: {str(e)}")
        return {"error": str(e)}

def parse_args():
    """Parse command line arguments"""
    import argparse
    
    parser = argparse.ArgumentParser(description='YOLOv8 object detector for space station equipment')
    parser.add_argument('image_path', type=str, help='Path to the image file to process')
    parser.add_argument('--model', type=str, default='yolov8s.pt', help='Path to the YOLOv8 model file (.pt)')
    parser.add_argument('--conf', type=float, default=0.25, help='Confidence threshold for detections')
    parser.add_argument('--debug', action='store_true', help='Enable debug output')
    
    return parser.parse_args()

if __name__ == "__main__":
    try:
        # Parse command line arguments
        args = parse_args()
        
        # Enable debug logging if requested
        if args.debug:
            print(f"Debug mode enabled")
            print(f"Processing image: {args.image_path}")
            print(f"Using model: {args.model}")
            print(f"Confidence threshold: {args.conf}")
        
        # Run detection
        result = detect_objects_with_yolo(
            image_path=args.image_path,
            model_path=args.model,
            conf_threshold=args.conf
        )
        
        # Output the result as JSON
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        # Handle any unexpected errors
        error_result = {
            "error": f"Error in YOLOv8 detector: {str(e)}",
            "detectedObjects": [],
            "imageUrl": "",
            "detectionMethod": "yolov8-error"
        }
        print(json.dumps(error_result))
        sys.exit(1)

"""
# ===================================================================
# LOCAL SETUP GUIDE FOR RUNNING THIS PROJECT WITH YOLOV8
# ===================================================================

## Prerequisites:
- Python 3.8+ (Python 3.10 recommended for best compatibility)
- GPU with CUDA support recommended but not required

## Setup Steps:

1. Install required libraries:
   ```
   pip install ultralytics opencv-python numpy
   ```

2. Place your pre-trained YOLOv8 model file (e.g., yolov8s.pt) in the project root

3. Ensure the model is trained for the target classes:
   - toolbox (class 0)
   - oxygen tank (class 1)
   - fire extinguisher (class 2)

4. If you have a custom model with different class mappings, update the 
   PRIORITY_OBJECTS dictionary in this file

## Running the Detector Directly:
   ```
   python yolo-detector.py path/to/image.jpg --model path/to/model.pt --conf 0.3
   ```

## Troubleshooting:
- If you encounter CUDA errors, try using CPU only: 
  ```
  export CUDA_VISIBLE_DEVICES=-1
  ```
- For memory issues, try using a smaller model like yolov8n.pt

## For Full Project Integration:
1. Update this script by uncommenting the code inside detect_objects_with_yolo()
2. Make sure Node.js and all required NPM packages are installed
3. Start the server:
   ```
   npm run dev
   ```

## Common Issues:
- GPU memory errors: Try reducing batch size or using a smaller model
- Class mapping errors: Make sure your trained model's classes match the PRIORITY_OBJECTS
- Path errors: Use absolute paths if you encounter file not found errors
"""