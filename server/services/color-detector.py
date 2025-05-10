#!/usr/bin/env python3
"""
Color-based Object Detector for Space Station Equipment

This script analyzes images to detect objects based on their color:
- Orange/Yellow areas are detected as toolboxes
- Green-tinged areas are detected as oxygen tanks
- Red areas are detected as fire extinguishers

Used as a fallback when TensorFlow detection fails.
"""

import os
import cv2
import numpy as np
import json
import sys
import uuid
from pathlib import Path

# Configure color ranges in HSV space
# Yellow-Orange for toolboxes
YELLOW_ORANGE_LOWER = np.array([15, 100, 100])  
YELLOW_ORANGE_UPPER = np.array([40, 255, 255])  

# Green for oxygen tanks
GREEN_LOWER = np.array([40, 40, 40])  
GREEN_UPPER = np.array([80, 255, 255])  

# Red for fire extinguishers (2 ranges because red wraps around in HSV)
RED_LOWER1 = np.array([0, 100, 100])  
RED_UPPER1 = np.array([10, 255, 255])  
RED_LOWER2 = np.array([160, 100, 100])  
RED_UPPER2 = np.array([180, 255, 255])

def detect_objects_by_color(image_path):
    """Detect objects in an image based on color."""
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"Could not read image: {image_path}"}
            
        # Get image dimensions
        height, width = image.shape[:2]
        
        # Convert to HSV for better color detection
        hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Create masks for each color range
        mask_yellow = cv2.inRange(hsv_image, YELLOW_ORANGE_LOWER, YELLOW_ORANGE_UPPER)
        mask_green = cv2.inRange(hsv_image, GREEN_LOWER, GREEN_UPPER)
        mask_red1 = cv2.inRange(hsv_image, RED_LOWER1, RED_UPPER1)
        mask_red2 = cv2.inRange(hsv_image, RED_LOWER2, RED_UPPER2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)
        
        # Find contours for each color
        detected_objects = []
        
        # Process yellow/orange contours (toolboxes)
        contours, _ = cv2.findContours(mask_yellow, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            area = cv2.contourArea(contour)
            # Filter small noise
            if area > 500:  
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 10000, 0.95)  # Base confidence on area, max 0.95
                
                # Create object entry
                detected_objects.append({
                    "id": str(uuid.uuid4()),
                    "label": "toolbox",
                    "confidence": float(confidence),
                    "x": float(x / width),
                    "y": float(y / height),
                    "width": float(w / width),
                    "height": float(h / height),
                    "originalClass": "color-detection",
                    "color": "#ffc107",  # Yellow
                    "context": "Maintenance equipment"
                })
        
        # Process green contours (oxygen tanks)
        contours, _ = cv2.findContours(mask_green, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 10000, 0.95)
                
                detected_objects.append({
                    "id": str(uuid.uuid4()),
                    "label": "oxygen tank",
                    "confidence": float(confidence),
                    "x": float(x / width),
                    "y": float(y / height),
                    "width": float(w / width),
                    "height": float(h / height),
                    "originalClass": "color-detection",
                    "color": "#2196f3",  # Blue
                    "context": "Life support equipment"
                })
        
        # Process red contours (fire extinguishers)
        contours, _ = cv2.findContours(mask_red, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(area / 10000, 0.95)
                
                detected_objects.append({
                    "id": str(uuid.uuid4()),
                    "label": "fire extinguisher",
                    "confidence": float(confidence),
                    "x": float(x / width),
                    "y": float(y / height),
                    "width": float(w / width),
                    "height": float(h / height),
                    "originalClass": "color-detection",
                    "color": "#f44336",  # Red
                    "context": "Critical safety equipment"
                })
        
        # Generate result
        result = {
            "detectedObjects": detected_objects,
            "imageUrl": f"/uploads/{Path(image_path).name}",
            "detectionMethod": "opencv-color"
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python color-detector.py <image_path>"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    result = detect_objects_by_color(image_path)
    print(json.dumps(result))
    sys.exit(0)