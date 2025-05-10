import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  context: string;
  model?: string;
}

export interface DetectionResult {
  success: boolean;
  timestamp?: string;
  model?: string;
  method?: string;
  detections: Detection[];
  count: number;
  error?: string;
}

/**
 * YOLOv5 Space Station Object Detector Bridge
 * 
 * This service provides a bridge between the Node.js backend and the Python YOLOv5 detector.
 * It handles executing the Python script, parsing the results, and returning them in a consistent format.
 */
export class YOLOv5Bridge {
  private pythonExecutable: string;
  private detectorScript: string;
  private modelPath: string;
  private confidenceThreshold: number;

  constructor() {
    // We'll try to use Python 3.9 if available, otherwise fall back to system default
    this.pythonExecutable = 'python3.9';
    
    // Set paths for detector script and model
    this.detectorScript = path.resolve(process.cwd(), 'server/python/yolov5_detector.py');
    this.modelPath = path.resolve(process.cwd(), 'models/yolov5s.pt');
    
    // Default confidence threshold
    this.confidenceThreshold = 0.25;

    // Validate detector script exists
    this.validateSetup();
  }

  /**
   * Validate that the detector script and model exist
   */
  private validateSetup(): void {
    // Check if detector script exists
    try {
      if (fs.access(this.detectorScript)) {
        console.log(`YOLOv5 detector script found at: ${this.detectorScript}`);
      }
    } catch (error) {
      console.error(`YOLOv5 detector script not found at: ${this.detectorScript}`);
    }
  }

  /**
   * Run YOLOv5 detection on an image
   * 
   * @param imagePath Path to the image to analyze
   * @returns Promise with detection results
   */
  public async detectObjects(imagePath: string): Promise<DetectionResult> {
    console.log(`Processing image with YOLOv5 space station detector...`);
    console.log(`Detecting objects in image: ${imagePath}`);
    
    try {
      // Generate a unique ID for the detection output file
      const detectionId = uuidv4();
      const outputPath = path.resolve(process.cwd(), `uploads/detection_${detectionId}.json`);
      
      // Build the command to execute the Python script
      const command = `${this.pythonExecutable} "${this.detectorScript}" --image "${imagePath}" --model "${this.modelPath}" --output "${outputPath}" --conf ${this.confidenceThreshold}`;
      
      console.log(`Executing: ${command}`);
      
      // Execute the command
      const { stdout, stderr } = await this.execCommand(command);
      
      if (stderr) {
        console.error(`YOLOv5 detection error: ${stderr}`);
      }
      
      // Read the output JSON file
      const resultsJson = await fs.readFile(outputPath, 'utf8');
      const results: DetectionResult = JSON.parse(resultsJson);
      
      // Clean up the output file
      await fs.unlink(outputPath).catch(error => {
        console.warn(`Failed to delete temporary detection file: ${outputPath}`, error);
      });
      
      console.log(`YOLOv5 detected ${results.count} objects`);
      
      return results;
    } catch (error) {
      console.error('Error in YOLOv5 detection:', error);
      return {
        success: false,
        error: error.message || 'Unknown error in YOLOv5 detection',
        detections: [],
        count: 0
      };
    }
  }

  /**
   * Execute a command and return stdout and stderr
   * 
   * @param command Command to execute
   * @returns Promise with stdout and stderr
   */
  private execCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error && !stderr) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
}

// Singleton instance
export const yolov5Bridge = new YOLOv5Bridge();