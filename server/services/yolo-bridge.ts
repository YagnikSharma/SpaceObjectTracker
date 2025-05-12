import { spawn } from 'child_process';
import { DetectionResult } from './tensorflow-detector';
import * as path from 'path';

/**
 * Bridge to the YOLOv8 detector Python script
 * Handles communication between Node.js and the Python YOLOv8 detector
 */
export class YOLODetector {
  private modelPath: string;
  
  /**
   * Initialize the YOLOv8 detector
   * @param modelPath Path to the YOLOv8 model file (.pt)
   */
  constructor(modelPath: string = 'yolov8s.pt') {
    this.modelPath = modelPath;
    console.log(`Initializing YOLOv8 detector with model: ${this.modelPath}`);
  }
  
  /**
   * Detect objects in an image using YOLOv8
   * @param imagePath Path to the image file
   * @returns Promise with detection results
   */
  public async detectObjects(imagePath: string): Promise<DetectionResult> {
    try {
      console.log(`Running YOLOv8 detection on ${imagePath}`);
      
      return new Promise<DetectionResult>((resolve, reject) => {
        // Execute the Python YOLOv8 detector script
        const process = spawn('python3', [
          'server/services/yolo-detector.py', 
          imagePath,
          // Additional arguments could be added here if needed
          // For example: '--model', this.modelPath
        ]);
        
        let outputData = '';
        let errorData = '';
        
        // Collect stdout data
        process.stdout.on('data', (data) => {
          outputData += data.toString();
        });
        
        // Collect stderr data
        process.stderr.on('data', (data) => {
          errorData += data.toString();
          console.error(`YOLOv8 error: ${data.toString()}`);
        });
        
        // Handle process completion
        process.on('close', (code) => {
          if (code !== 0) {
            console.error(`YOLOv8 process exited with code ${code}`);
            console.error(`Error output: ${errorData}`);
            resolve({
              detectedObjects: [],
              imageUrl: `/uploads/${path.basename(imagePath)}`,
              detectionMethod: 'yolov8-failed'
            });
            return;
          }
          
          try {
            const result = JSON.parse(outputData);
            
            // Check if the Python script returned an error
            if (result.error) {
              console.error(`YOLOv8 detection error: ${result.error}`);
              resolve({
                detectedObjects: [],
                imageUrl: `/uploads/${path.basename(imagePath)}`,
                detectionMethod: 'yolov8-error'
              });
              return;
            }
            
            resolve(result);
          } catch (error) {
            console.error('Failed to parse YOLOv8 output', error);
            console.error('Output data:', outputData);
            resolve({
              detectedObjects: [],
              imageUrl: `/uploads/${path.basename(imagePath)}`,
              detectionMethod: 'yolov8-parse-error'
            });
          }
        });
      });
    } catch (error) {
      console.error('Error in YOLOv8 detection:', error);
      return {
        detectedObjects: [],
        imageUrl: `/uploads/${path.basename(imagePath)}`,
        detectionMethod: 'yolov8-exception'
      };
    }
  }
}

// Export a singleton instance of the YOLOv8 detector
// Modify the model path as needed for your specific trained model
export const yoloDetector = new YOLODetector();