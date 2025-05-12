import { spawn } from 'child_process';
import { DetectionResult } from './tensorflow-detector';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Configuration interface for the YOLOv8 detector
 */
interface YOLOv8Config {
  modelPath: string;
  confidenceThreshold: number;
  pythonPath: string;
  debugMode: boolean;
}

/**
 * Bridge to the YOLOv8 detector Python script
 * Handles communication between Node.js and the Python YOLOv8 detector
 */
export class YOLODetector {
  private config: YOLOv8Config;
  
  /**
   * Initialize the YOLOv8 detector
   * @param modelPath Path to the YOLOv8 model file (.pt)
   * @param config Additional configuration options
   */
  constructor(config: Partial<YOLOv8Config> = {}) {
    // Default configuration
    this.config = {
      modelPath: 'yolov8s.pt',
      confidenceThreshold: 0.25,
      pythonPath: 'python3',
      debugMode: false,
      ...config
    };
    
    console.log(`Initializing YOLOv8 detector with model: ${this.config.modelPath}`);
    
    // Check if the script exists
    const scriptPath = 'server/services/yolo-detector.py';
    if (!fs.existsSync(scriptPath)) {
      console.error(`Error: YOLOv8 detector script not found at ${scriptPath}`);
    }
  }
  
  /**
   * Detect objects in an image using YOLOv8
   * @param imagePath Path to the image file
   * @returns Promise with detection results
   */
  public async detectObjects(imagePath: string): Promise<DetectionResult> {
    try {
      console.log(`Running YOLOv8 detection on ${imagePath}`);
      
      // Verify the image file exists
      if (!fs.existsSync(imagePath)) {
        console.error(`Error: Image file not found at ${imagePath}`);
        return {
          detectedObjects: [],
          imageUrl: `/uploads/${path.basename(imagePath)}`,
          detectionMethod: 'yolov8-no-image'
        };
      }
      
      return new Promise<DetectionResult>((resolve, reject) => {
        // Prepare command line arguments
        const args = [
          'server/services/yolo-detector.py',
          imagePath
        ];
        
        // Add optional arguments if configured
        if (this.config.modelPath !== 'yolov8s.pt') {
          args.push('--model', this.config.modelPath);
        }
        
        if (this.config.confidenceThreshold !== 0.25) {
          args.push('--conf', this.config.confidenceThreshold.toString());
        }
        
        if (this.config.debugMode) {
          args.push('--debug');
        }
        
        // Execute the Python YOLOv8 detector script
        const process = spawn(this.config.pythonPath, args);
        
        let outputData = '';
        let errorData = '';
        
        // Collect stdout data
        process.stdout.on('data', (data) => {
          const chunk = data.toString();
          outputData += chunk;
          
          // Log Python output in debug mode
          if (this.config.debugMode) {
            console.log(`YOLOv8 output: ${chunk}`);
          }
        });
        
        // Collect stderr data
        process.stderr.on('data', (data) => {
          const chunk = data.toString();
          errorData += chunk;
          console.error(`YOLOv8 error: ${chunk}`);
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
            // Try to parse the JSON output from the Python script
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
            
            // Return successful result
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
        
        // Handle execution errors
        process.on('error', (error) => {
          console.error('Failed to start YOLOv8 process:', error);
          resolve({
            detectedObjects: [],
            imageUrl: `/uploads/${path.basename(imagePath)}`,
            detectionMethod: 'yolov8-process-error'
          });
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
// Configure with your specific trained model when running locally
export const yoloDetector = new YOLODetector({
  modelPath: 'yolov8s.pt',        // Use custom path to your trained model
  confidenceThreshold: 0.3,       // Adjust confidence threshold as needed
  debugMode: true                 // Enable debug mode for verbose logging
});