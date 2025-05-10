#!/usr/bin/env python3.10
"""
Test script to verify the Python 3.10 + YOLOv8 installation

This is a simple script to test if YOLOv8 is properly installed and working.
It attempts to load a model and perform detection on a sample image.
"""

import os
import sys
import time
import json
from datetime import datetime

def main():
    """Main test function"""
    print(f"Running test with Python {sys.version}")
    start_time = time.time()
    
    # Check if we can import required packages
    try:
        import numpy as np
        print(f"✅ numpy version: {np.__version__}")
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
        from ultralytics import YOLO
        print(f"✅ ultralytics version: {ultralytics.__version__}")
    except ImportError as e:
        print(f"❌ Failed to import ultralytics: {e}")
        return 1
    
    # Check for model file
    model_path = os.path.join("models", "yolov8s.pt")
    if not os.path.exists(model_path):
        model_path = "yolov8s.pt"  # Try root directory
        if not os.path.exists(model_path):
            print("⚠️ Model file not found. Using default model.")
            model_path = "yolov8s.pt"  # Use default, will download
    
    # Find test image
    test_image = None
    for img_dir in ["uploads", "datasets", "."]:
        for ext in [".jpg", ".jpeg", ".png"]:
            for img_name in ["test", "sample", "image"]:
                potential_path = os.path.join(img_dir, f"{img_name}{ext}")
                if os.path.exists(potential_path):
                    test_image = potential_path
                    break
            if test_image:
                break
        if test_image:
            break
    
    if not test_image:
        print("⚠️ No test image found. Will create one.")
        # Create a blank test image
        try:
            test_image = "test_image.jpg"
            img = np.zeros((640, 640, 3), dtype=np.uint8)
            # Add some shapes for detection
            cv2.rectangle(img, (100, 100), (300, 300), (0, 255, 0), -1)  # Green rectangle
            cv2.circle(img, (500, 200), 100, (0, 0, 255), -1)  # Red circle
            cv2.imwrite(test_image, img)
            print(f"Created test image at {test_image}")
        except Exception as e:
            print(f"❌ Failed to create test image: {e}")
            return 1
    
    # Try loading the model
    print(f"Loading YOLOv8 model from {model_path}...")
    try:
        model = YOLO(model_path)
        print(f"✅ Model loaded successfully: {model}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return 1
    
    # Try detection
    print(f"Running detection on {test_image}...")
    try:
        results = model(test_image)
        print(f"✅ Detection successful!")
        
        # Get detection details
        detected_classes = []
        for r in results:
            for i, c in enumerate(r.boxes.cls):
                class_name = r.names[int(c)]
                confidence = float(r.boxes.conf[i])
                detected_classes.append(f"{class_name} ({confidence:.2f})")
        
        if detected_classes:
            print(f"Detected objects: {', '.join(detected_classes)}")
        else:
            print("No objects detected in the test image.")
        
        # Save results to a json file for inspection
        output_file = "test_output.json"
        
        # Create a simplified result structure
        json_results = {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "detections": []
        }
        
        for r in results:
            for i, box in enumerate(r.boxes.xyxy):
                class_id = int(r.boxes.cls[i])
                class_name = r.names[class_id]
                confidence = float(r.boxes.conf[i])
                
                x1, y1, x2, y2 = box.tolist()
                detection = {
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2]
                }
                json_results["detections"].append(detection)
        
        with open(output_file, "w") as f:
            json.dump(json_results, f, indent=2)
        
        print(f"Results saved to {output_file}")
        
    except Exception as e:
        print(f"❌ Detection failed: {e}")
        return 1
    
    elapsed = time.time() - start_time
    print(f"\nTest completed in {elapsed:.2f} seconds")
    print("✅ YOLOv8 with Python 3.10 is working correctly!")
    return 0

if __name__ == "__main__":
    sys.exit(main())