import { spawn } from 'child_process';
import { DetectionResult } from './tensorflow-detector';

/**
 * Bridge to the OpenCV-based color detector Python script
 * Used as a fallback when TensorFlow fails to detect objects
 */
export class OpenCVColorDetector {
  /**
   * Detect objects in an image using OpenCV color detection
   * @param imagePath Path to the image file
   * @returns Promise with detection results
   */
  public async detectObjects(imagePath: string): Promise<DetectionResult> {
    try {
      console.log(`Running OpenCV color detection on ${imagePath}`);
      
      return new Promise<DetectionResult>((resolve, reject) => {
        // Execute the Python color detector script
        const process = spawn('python3', ['server/services/color-detector.py', imagePath]);
        
        let outputData = '';
        let errorData = '';
        
        // Collect stdout data
        process.stdout.on('data', (data) => {
          outputData += data.toString();
        });
        
        // Collect stderr data
        process.stderr.on('data', (data) => {
          errorData += data.toString();
          console.error(`OpenCV error: ${data.toString()}`);
        });
        
        // Handle process completion
        process.on('close', (code) => {
          if (code !== 0) {
            console.error(`OpenCV process exited with code ${code}`);
            console.error(`Error output: ${errorData}`);
            reject(new Error(`OpenCV detection failed with code ${code}: ${errorData}`));
            return;
          }
          
          try {
            const result = JSON.parse(outputData);
            
            // Check if the Python script returned an error
            if (result.error) {
              reject(new Error(`OpenCV detection error: ${result.error}`));
              return;
            }
            
            resolve(result);
          } catch (error) {
            console.error('Failed to parse OpenCV output', error);
            console.error('Output data:', outputData);
            reject(new Error('Failed to parse OpenCV detector output'));
          }
        });
      });
    } catch (error) {
      console.error('Error in OpenCV color detection:', error);
      throw new Error('Failed to process image with OpenCV');
    }
  }
}

export const opencvDetector = new OpenCVColorDetector();