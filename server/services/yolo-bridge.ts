import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { DetectedObject } from '@shared/schema';
import { randomUUID } from 'crypto';

// Promisify exec
const execAsync = promisify(exec);

// Constants for colors
export const OBJECT_COLORS = {
  'fire extinguisher': '#f44336', // Red
  'oxygen tank': '#2196f3',       // Blue
  'toolbox': '#ffc107',           // Yellow
  'astronaut': '#4caf50',         // Green
  'person': '#4caf50',            // Green
  'default': '#ff9800'            // Orange
};

// Priority categories for space station monitoring - Limit to only these three objects
export const PRIORITY_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank'];

/**
 * YOLO Bridge Service
 * Connects the Node.js application with the Python YOLOv8 detector
 */
export class YoloBridge {
  private modelPath: string;
  private pythonScript: string;
  private isModelLoaded: boolean = false;
  private trainingData: Record<string, { count: number, samples: any[] }> = {
    'toolbox': { count: 0, samples: [] },
    'fire extinguisher': { count: 0, samples: [] },
    'oxygen tank': { count: 0, samples: [] }
  };

  constructor() {
    // Set paths
    this.modelPath = path.join(process.cwd(), 'models', 'yolov8s.pt');
    this.pythonScript = path.join(process.cwd(), 'server', 'python', 'yolo_detector.py');
    
    // Check if model exists
    if (fs.existsSync(this.modelPath)) {
      console.log(`YOLOv8 model found at: ${this.modelPath}`);
      this.isModelLoaded = true;
    } else {
      console.log(`YOLOv8 model not found at: ${this.modelPath}`);
    }
    
    // Check if Python script exists
    if (fs.existsSync(this.pythonScript)) {
      console.log(`Python detector script found at: ${this.pythonScript}`);
    } else {
      console.error(`Python detector script not found at: ${this.pythonScript}`);
    }
  }
  
  /**
   * Reset training data and counters
   */
  public resetTrainingData(): void {
    // Reset training data to initial state
    this.trainingData = {
      'toolbox': { count: 0, samples: [] },
      'fire extinguisher': { count: 0, samples: [] },
      'oxygen tank': { count: 0, samples: [] }
    };
    console.log('Training data has been reset');
  }

  /**
   * Detect objects in an image using YOLOv8
   */
  public async detectObjects(imagePath: string): Promise<{ 
    success: boolean; 
    detections: DetectedObject[]; 
    count: number;
    error?: string;
  }> {
    // Reset training data before each detection to ensure fresh start
    this.resetTrainingData();
    try {
      console.log(`Detecting objects in image: ${imagePath}`);
      
      if (!fs.existsSync(imagePath)) {
        return {
          success: false,
          detections: [],
          count: 0,
          error: `Image file not found: ${imagePath}`
        };
      }
      
      // Prepare output file path
      const outputFile = path.join(process.cwd(), 'uploads', `detection_${randomUUID()}.json`);
      
      // Build Python command
      const pythonCommand = `python "${this.pythonScript}" --image "${imagePath}" --model "${this.modelPath}" --output "${outputFile}" --conf 0.25`;
      
      console.log(`Executing: ${pythonCommand}`);
      
      // Execute Python script
      await execAsync(pythonCommand);
      
      // Check if output file was created
      if (!fs.existsSync(outputFile)) {
        console.error(`Output file not created: ${outputFile}`);
        return {
          success: false,
          detections: [],
          count: 0,
          error: 'Detection failed: Could not generate output file'
        };
      }
      
      // Read output file
      const outputData = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      
      // Delete output file
      fs.unlinkSync(outputFile);
      
      // Process and return detections
      const detections = this.processDetections(outputData.detections || []);
      return {
        success: true,
        detections,
        count: detections.length
      };
    } catch (error: any) {
      console.error('Error detecting objects:', error);
      return {
        success: false,
        detections: [],
        count: 0,
        error: `YOLOv8 detection error: ${error?.message || 'Unknown error'}`
      };
    }
  }
  
  /**
   * Process detections from Python script
   */
  private processDetections(rawDetections: any[]): DetectedObject[] {
    return rawDetections.map(detection => {
      // Ensure we only use our specific object labels
      const labelLower = detection.label.toLowerCase();
      let standardizedLabel = labelLower;
      
      // Map to our standard three object types if needed
      if (!PRIORITY_CATEGORIES.includes(labelLower)) {
        if (labelLower.includes('fire') || labelLower.includes('extinguisher')) {
          standardizedLabel = 'fire extinguisher';
        } else if (labelLower.includes('tool') || labelLower.includes('box')) {
          standardizedLabel = 'toolbox';
        } else if (labelLower.includes('oxygen') || labelLower.includes('tank')) {
          standardizedLabel = 'oxygen tank';
        } else {
          // If we can't map to one of our categories, use the first one as default
          standardizedLabel = PRIORITY_CATEGORIES[0];
        }
      }
      
      // Get the appropriate color for the label
      const color = OBJECT_COLORS[standardizedLabel as keyof typeof OBJECT_COLORS] || OBJECT_COLORS.default;
      
      // Create proper DetectedObject with standardized label and color
      const detectedObject: DetectedObject = {
        id: detection.id || randomUUID(),
        label: standardizedLabel,
        confidence: detection.confidence,
        x: detection.x,
        y: detection.y,
        width: detection.width,
        height: detection.height,
        color: color,
        context: detection.context || this.getContextForLabel(standardizedLabel),
        originalClass: detection.originalClass || undefined
      };
      
      // Add to training data if confidence is high
      if (detection.confidence >= 0.6) {
        this.addToTrainingData(detectedObject);
      }
      
      console.log(`Processed detection: ${standardizedLabel} with color ${color}`);
      
      return detectedObject;
    });
  }
  
  /**
   * Get color for a label
   */
  private getColorForLabel(label: string): string {
    const lowerLabel = label.toLowerCase();
    
    // Check each category
    for (const category in OBJECT_COLORS) {
      if (lowerLabel.includes(category)) {
        return OBJECT_COLORS[category as keyof typeof OBJECT_COLORS];
      }
    }
    
    return OBJECT_COLORS.default;
  }
  
  /**
   * Get context information for a label
   */
  private getContextForLabel(label: string): string {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('fire') || lowerLabel.includes('extinguisher')) {
      return 'Critical safety equipment. Check pressure gauge and ensure easy access.';
    } else if (lowerLabel.includes('oxygen') || lowerLabel.includes('tank')) {
      return 'Life support equipment. Verify pressure levels and connection integrity.';
    } else if (lowerLabel.includes('tool') || lowerLabel.includes('box')) {
      return 'Equipment storage. Ensure proper organization and inventory completion.';
    } else if (lowerLabel.includes('person') || lowerLabel.includes('astronaut')) {
      return 'Crew member. Verify proper safety equipment and positioning.';
    }
    
    return 'Space station component. Monitor for proper functionality.';
  }
  
  // No fallback detection - we are exclusively using YOLO for all detections
  
  /**
   * Add detected object to training data
   */
  private addToTrainingData(detectedObject: DetectedObject): void {
    const label = detectedObject.label.toLowerCase();
    
    // Find matching category
    for (const category of PRIORITY_CATEGORIES) {
      if (label.includes(category)) {
        if (!this.trainingData[category]) {
          this.trainingData[category] = { count: 0, samples: [] };
        }
        
        this.trainingData[category].count += 1;
        this.trainingData[category].samples.push({
          id: detectedObject.id,
          label: detectedObject.label,
          confidence: detectedObject.confidence,
          bbox: [detectedObject.x, detectedObject.y, detectedObject.width, detectedObject.height]
        });
        
        console.log(`Added ${category} to training data. Total samples: ${this.trainingData[category].count}`);
        break;
      }
    }
  }
  
  /**
   * Get training statistics
   */
  public getTrainingStats(): { 
    totalSamples: number;
    objectCounts: Record<string, number>;
    modelLoaded: boolean;
    modelPath: string;
    colorMap: typeof OBJECT_COLORS;
  } {
    // Calculate total samples
    let totalSamples = 0;
    const objectCounts: Record<string, number> = {};
    
    for (const [category, data] of Object.entries(this.trainingData)) {
      objectCounts[category] = data.count;
      totalSamples += data.count;
    }
    
    return {
      totalSamples,
      objectCounts,
      modelLoaded: this.isModelLoaded,
      modelPath: this.modelPath,
      colorMap: OBJECT_COLORS
    };
  }
  
  /**
   * Import a custom YOLOv8 model
   */
  public importModel(modelBuffer: Buffer, modelName: string = 'yolov8s.pt'): boolean {
    try {
      // Ensure models directory exists
      const modelsDir = path.join(process.cwd(), 'models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }
      
      // Write model file
      const modelPath = path.join(modelsDir, modelName);
      fs.writeFileSync(modelPath, modelBuffer);
      
      console.log(`Imported YOLOv8 model to: ${modelPath}`);
      this.modelPath = modelPath;
      this.isModelLoaded = true;
      
      return true;
    } catch (error) {
      console.error('Error importing model:', error);
      return false;
    }
  }
}

// Create singleton instance
export const yoloBridge = new YoloBridge();

export default {
  yoloBridge,
  PRIORITY_CATEGORIES,
  OBJECT_COLORS
};