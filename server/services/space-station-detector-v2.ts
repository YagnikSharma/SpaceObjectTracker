import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { detectWithYolo11n } from './yolo11n-bridge';

// Define interfaces for the detector
interface SpaceStationObject {
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
  imageUrl: string;
  detectedObjects: SpaceStationObject[];
  detectionId: number;
  source: string;
  stats: {
    priorityObjectsDetected: number;
    humansDetected: number;
    detectionMethod: string;
  };
}

/**
 * Space Station Detector Service - V2
 * Uses exclusively the YOLOv11n model for improved accuracy on space station objects
 */
export class SpaceStationDetectorV2 {
  private static instance: SpaceStationDetectorV2;
  private modelPath: string;
  private detectionCounter: number = 0;
  
  private constructor() {
    // Set default model path
    this.modelPath = path.join('models', 'yolo11n.pt');
    
    // Check if model exists
    if (fs.existsSync(this.modelPath)) {
      console.log(`YOLOv11n model found at: ${this.modelPath}`);
    } else {
      console.error(`YOLOv11n model not found at: ${this.modelPath}`);
    }
  }
  
  public static getInstance(): SpaceStationDetectorV2 {
    if (!SpaceStationDetectorV2.instance) {
      SpaceStationDetectorV2.instance = new SpaceStationDetectorV2();
    }
    return SpaceStationDetectorV2.instance;
  }
  
  /**
   * Process an image and detect space station objects
   */
  public async processImage(imagePath: string): Promise<DetectionResult> {
    console.log('Processing image with YOLOv11n space station detector...');
    
    // Generate a unique ID for the processed image
    const uniqueId = uuid.v4().substring(0, 8);
    const filename = path.basename(imagePath);
    const extension = path.extname(filename);
    const baseFilename = path.basename(filename, extension);
    
    // Create a copy of the image with a unique name for storage
    const destinationFilename = `space_station_scan_${uniqueId}${extension}`;
    const destinationPath = path.join('uploads', destinationFilename);
    
    try {
      // Copy the uploaded image
      fs.copyFileSync(imagePath, destinationPath);
      
      // Run YOLOv11n detection
      console.log('Detecting objects with YOLOv11n...');
      const detectionResult = await detectWithYolo11n(imagePath, this.modelPath);
      
      // Map the detections to our space station objects format
      const detectedObjects: SpaceStationObject[] = detectionResult.detections.map(detection => ({
        id: detection.id,
        label: detection.label,
        confidence: detection.confidence,
        x: detection.x,
        y: detection.y,
        width: detection.width,
        height: detection.height,
        color: detection.color,
        context: detection.context,
        forced: detection.forced,
        originalClass: detection.originalClass
      }));
      
      // Increment detection counter for unique IDs
      this.detectionCounter++;
      
      // Count priority objects and humans
      const priorityObjectCount = detectedObjects.length;
      const humanCount = 0; // Current implementation doesn't count humans
      
      // Print detection statistics
      console.log('Space Station Detection Results:');
      console.log(`- Total Objects: ${detectedObjects.length}`);
      console.log(`- Priority Objects: ${priorityObjectCount}`);
      console.log(`- Humans Detected: ${humanCount}`);
      console.log(`- Detection Method: yolo11n`);
      
      // Return formatted results
      return {
        imageUrl: `/uploads/${destinationFilename}`,
        detectedObjects,
        detectionId: this.detectionCounter,
        source: 'yolo11n',
        stats: {
          priorityObjectsDetected: priorityObjectCount,
          humansDetected: humanCount,
          detectionMethod: 'yolo11n'
        }
      };
    } catch (error) {
      console.error('Error in processImage:', error);
      
      // Return empty results with error information
      return {
        imageUrl: `/uploads/${destinationFilename}`,
        detectedObjects: [],
        detectionId: this.detectionCounter,
        source: 'error',
        stats: {
          priorityObjectsDetected: 0,
          humansDetected: 0,
          detectionMethod: 'error'
        }
      };
    }
  }
  
  /**
   * Reset the internal state for testing
   */
  public reset(): void {
    this.detectionCounter = 0;
    console.log('Detection counter has been reset');
  }
}

// Export a singleton instance
export const spaceStationDetectorV2 = SpaceStationDetectorV2.getInstance();