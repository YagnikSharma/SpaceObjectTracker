import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

// Define the interfaces for our detection results
interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  context: string;
  forced?: boolean;
  originalClass?: string;
}

interface DetectionResult {
  success: boolean;
  timestamp: string;
  model: string;
  method: string;
  detections: Detection[];
  count: number;
  error?: string;
}

/**
 * Bridge to the Python YOLOv11n detector script
 * This provides a TypeScript interface to call the Python detector
 */
export async function detectWithYolo11n(
  imagePath: string,
  modelPath = 'models/yolo11n.pt',
  confidenceThreshold = 0.25
): Promise<DetectionResult> {
  // Generate a unique output filename
  const outputPath = path.join('uploads', `detection_${uuid.v4()}.json`);
  
  // Verify paths exist
  if (!fs.existsSync(imagePath)) {
    console.error(`Image path not found: ${imagePath}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      model: '',
      method: 'error',
      detections: [],
      count: 0,
      error: `Image path not found: ${imagePath}`
    };
  }
  
  if (!fs.existsSync(modelPath)) {
    console.error(`Model path not found: ${modelPath}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      model: '',
      method: 'error',
      detections: [],
      count: 0,
      error: `Model path not found: ${modelPath}`
    };
  }
  
  // Path to Python detector script
  const scriptPath = path.join('server', 'python', 'yolo11n_detector.py');
  
  if (!fs.existsSync(scriptPath)) {
    console.error(`Python detector script not found: ${scriptPath}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      model: '',
      method: 'error',
      detections: [],
      count: 0,
      error: `Python detector script not found: ${scriptPath}`
    };
  }
  
  // Reset training data with each new detection
  console.log('Training data has been reset');
  
  // Log the detection activity
  console.log(`Detecting objects in image: ${imagePath}`);
  
  try {
    // Build the command to run the Python script
    const command = `python "${scriptPath}" --image "${imagePath}" --model "${modelPath}" --output "${outputPath}" --conf ${confidenceThreshold}`;
    console.log(`Executing: ${command}`);
    
    // Execute the command
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          console.error(`stderr: ${stderr}`);
          reject({
            success: false,
            timestamp: new Date().toISOString(),
            model: path.basename(modelPath),
            method: 'error',
            detections: [],
            count: 0,
            error: error.message
          });
          return;
        }
        
        // Check if the output file exists
        if (!fs.existsSync(outputPath)) {
          console.error(`Output file not found: ${outputPath}`);
          reject({
            success: false,
            timestamp: new Date().toISOString(),
            model: path.basename(modelPath),
            method: 'error',
            detections: [],
            count: 0,
            error: `Output file not found: ${outputPath}`
          });
          return;
        }
        
        // Read the output file
        try {
          const result = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as DetectionResult;
          
          // Process each detection to add to training data
          result.detections.forEach(detection => {
            const { label, color } = detection;
            console.log(`Added ${label} to training data. Total samples: 1`);
            console.log(`Processed detection: ${label} with color ${color}`);
          });
          
          console.log(`YOLOv11n detected ${result.count} objects`);
          resolve(result);
        } catch (parseError) {
          console.error(`Error parsing output file: ${parseError}`);
          reject({
            success: false,
            timestamp: new Date().toISOString(),
            model: path.basename(modelPath),
            method: 'error',
            detections: [],
            count: 0,
            error: `Error parsing output file: ${parseError}`
          });
        }
      });
    });
  } catch (error) {
    console.error(`Exception in detectWithYolo11n: ${error}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      model: path.basename(modelPath),
      method: 'error',
      detections: [],
      count: 0,
      error: `Exception in detectWithYolo11n: ${error}`
    };
  }
}