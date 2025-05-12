# YOLOv8 Implementation Guide for Syndetect

This guide provides detailed information on setting up, configuring, and troubleshooting the YOLOv8 object detection system used in the Syndetect platform.

## YOLOv8 Overview

The Syndetect platform uses YOLOv8, a state-of-the-art object detection model developed by Ultralytics. YOLOv8 is known for its speed, accuracy, and versatility in detecting objects in images and videos.

## Setting Up YOLOv8

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- CUDA-compatible GPU (optional, but recommended for faster inference)

### Installation

1. Install the Ultralytics package:
   ```bash
   pip install ultralytics
   ```

2. Install additional dependencies:
   ```bash
   pip install opencv-python numpy pillow
   ```

3. Verify the installation:
   ```bash
   python -c "from ultralytics import YOLO; print('YOLOv8 installed successfully')"
   ```

## Model Files

### Standard YOLOv8 Models

The Syndetect application uses standard YOLOv8 model files:

- `yolov8s.pt`: The small variant of YOLOv8 (recommended for general use)
- `yolov8n.pt`: A nano variant that's faster but less accurate (optional)

Place these model files in the root directory of your project or update the path in the configuration.

### Custom-Trained Models

If you're using custom-trained models for space-specific object detection:

1. Place the custom model file (e.g., `space_objects_yolo.pt`) in the root directory
2. Update the model path in `server/services/yolo-bridge.ts` to use your custom model

## Testing YOLOv8 Independently

Before integrating with the full application, you can test YOLOv8 independently:

1. Create a test script (`test_yolo.py`):
   ```python
   from ultralytics import YOLO
   import cv2
   import numpy as np
   
   # Load the model
   model = YOLO('yolov8s.pt')  # or your custom model path
   
   # Test image path
   img_path = 'path/to/test/image.jpg'
   
   # Run inference
   results = model(img_path)
   
   # Print detection results
   for r in results:
       boxes = r.boxes
       print(f"Detected {len(boxes)} objects")
       
       # Print details of each detection
       for box in boxes:
           cls = int(box.cls[0])
           cls_name = model.names[cls]
           conf = float(box.conf[0])
           print(f"  - {cls_name}: {conf:.2f}")
   
   # Optionally save the visualization
   result_img = results[0].plot()
   cv2.imwrite('detection_result.jpg', result_img)
   
   print("Test completed successfully")
   ```

2. Run the test script:
   ```bash
   python test_yolo.py
   ```

3. Check the output and the generated `detection_result.jpg` to verify that YOLOv8 is working correctly.

## Integration with Node.js

The Syndetect platform uses a bridge between Node.js and Python to run YOLOv8 detections:

### Understanding the Bridge Architecture

The bridge works as follows:
1. The Node.js server receives an image upload
2. It calls a Python script via a child process
3. The Python script runs YOLOv8 detection and returns the results
4. The Node.js server processes and displays the results

### Key Files

- `server/services/yolo-bridge.ts`: The TypeScript code that spawns the Python process
- `server/services/yolo-detector.py`: The Python script that runs YOLOv8 detection

## Common Issues and Troubleshooting

### 1. ParseError: Failed to parse YOLOv8 output

If you see an error like "Failed to parse YOLOv8 output" in the logs:

- **Cause**: The Python script is likely outputting debug or error information that's breaking the JSON parsing
- **Solution**:
  1. Check the Python script for print statements not wrapped in proper JSON
  2. Update the Python script to ensure it only outputs valid JSON
  3. Add proper error handling to capture any Python exceptions and return them as structured JSON

### 2. YOLOv8 Not Detecting Any Objects

If YOLOv8 runs but doesn't detect any objects:

- **Cause**: This could be due to model configuration, confidence thresholds, or the image content
- **Solution**:
  1. Lower the confidence threshold in the detector configuration
  2. Ensure the model is trained to recognize the objects in your images
  3. Check that the image is properly preprocessed before detection

### 3. Python Environment Issues

If you encounter errors related to Python packages:

- **Cause**: Missing dependencies or version conflicts
- **Solution**:
  1. Create a dedicated virtual environment for the project
  2. Install all required packages in the correct versions
  3. Update the bridge to use the specific Python executable from the virtual environment

### 4. Model File Not Found

If you see errors about missing model files:

- **Cause**: The model file path is incorrect or the file is not accessible
- **Solution**:
  1. Check that the model file exists at the specified path
  2. Use absolute paths for the model file in production environments
  3. Ensure the Node.js process has read access to the model file

## Advanced Configuration

### Customizing Detection Parameters

To customize the YOLOv8 detection parameters:

1. Open `server/services/yolo-detector.py`
2. Modify the following parameters:
   - `confidence_threshold`: Minimum confidence score for detections (default: 0.3)
   - `iou_threshold`: Intersection over union threshold for NMS (default: 0.45)
   - `max_detections`: Maximum number of detections to return (default: 100)

### Optimizing for Performance

To optimize YOLOv8 for better performance:

1. **Use a smaller model variant**:
   - YOLOv8n is much faster than YOLOv8s but less accurate
   - YOLOv8m offers a good balance between speed and accuracy

2. **Enable GPU acceleration**:
   - Ensure CUDA is properly installed if using NVIDIA GPUs
   - Set environment variables to use the GPU:
     ```
     export CUDA_VISIBLE_DEVICES=0  # Use first GPU
     ```

3. **Optimize image processing**:
   - Resize images before detection to reduce processing time
   - Use a lower inference size (e.g., 640x640 instead of 1280x1280)

## Customizing Detection Classes

The standard YOLOv8 model is trained on the COCO dataset with 80 classes. To customize for space-specific objects:

### Option 1: Use Class Filtering

1. Keep using the standard model but filter the results to only include relevant classes
2. Update the allowed classes list in your code

### Option 2: Fine-tune the Model

For better results with space-specific objects, fine-tune the YOLOv8 model:

1. Prepare a dataset with labeled images of space objects
2. Fine-tune the YOLOv8 model using the Ultralytics API:
   ```python
   from ultralytics import YOLO
   
   # Load a pre-trained model
   model = YOLO('yolov8s.pt')
   
   # Train the model on your custom dataset
   results = model.train(
       data='path/to/data.yaml',
       epochs=100,
       imgsz=640,
       batch=16,
       name='space_objects'
   )
   
   # Export the model
   model.export(format='onnx')  # or other formats
   ```

3. Use the fine-tuned model in your application

## Resources

- [Ultralytics YOLOv8 Documentation](https://docs.ultralytics.com/)
- [YOLOv8 GitHub Repository](https://github.com/ultralytics/ultralytics)
- [COCO Dataset Classes](https://tech.amikelive.com/node-718/what-object-categories-labels-are-in-coco-dataset/)
- [Model Training Guide](https://docs.ultralytics.com/modes/train/)