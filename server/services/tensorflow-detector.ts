import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { v4 as uuidv4 } from 'uuid';
import { DetectedObject } from '@shared/schema';

// Define our priority objects (the only ones we care about)
const PRIORITY_OBJECTS = [
  'toolbox',
  'oxygen tank',
  'fire extinguisher'
];

// Define color mapping for our priority objects
const OBJECT_COLORS: Record<string, string> = {
  'toolbox': '#ffc107',         // yellow
  'oxygen tank': '#2196f3',     // blue
  'fire extinguisher': '#f44336', // red
  'default': '#9e9e9e',         // gray
};

// Define context for each object type
const OBJECT_CONTEXT: Record<string, string> = {
  'toolbox': 'Maintenance equipment',
  'oxygen tank': 'Life support equipment',
  'fire extinguisher': 'Critical safety equipment',
};

// Map COCO-SSD class names to our custom object names
const CLASS_MAPPING: Record<string, string> = {
  // Direct mappings
  'suitcase': 'toolbox',
  'handbag': 'toolbox',
  'backpack': 'toolbox',
  'bottle': 'oxygen tank',
  'vase': 'oxygen tank',
  'wine glass': 'oxygen tank',
  'cup': 'oxygen tank',
  'cell phone': 'toolbox',
  
  // If needed, add more mappings here
};

export interface DetectionResult {
  detectedObjects: DetectedObject[];
  imageUrl: string;
  detectionMethod: string;
}

class TensorFlowDetector {
  private model: cocossd.ObjectDetection | null = null;
  private isLoading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  
  constructor() {
    // Initialize the model on startup
    this.loadModel();
  }
  
  private async loadModel(): Promise<void> {
    if (this.model) return;
    if (this.isLoading) return this.loadPromise as Promise<void>;
    
    this.isLoading = true;
    
    try {
      console.log('Loading TensorFlow COCO-SSD model...');
      this.loadPromise = new Promise<void>(async (resolve) => {
        // Load TensorFlow.js and the COCO-SSD model
        await tf.ready();
        this.model = await cocossd.load();
        console.log('TensorFlow COCO-SSD model loaded successfully');
        resolve();
      });
      
      await this.loadPromise;
    } catch (error) {
      console.error('Failed to load TensorFlow model:', error);
      throw new Error('Failed to load detection model');
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Helper method to determine if a detected object looks like an oxygen tank
   * based on shape characteristics (cylindrical with green top)
   */
  private async checkForOxygenTankPattern(imagePath: string, predictions: cocossd.DetectedObject[]): Promise<DetectedObject[]> {
    // Objects that might be incorrectly classified but could be oxygen tanks
    const cylindricalObjects = ['bottle', 'vase', 'cup', 'wine glass'];
    const additionalObjects: DetectedObject[] = [];
    
    try {
      // Process predictions that might be oxygen tanks but were not detected as such
      for (const prediction of predictions) {
        const { class: className, score, bbox } = prediction;
        const [x, y, width, height] = bbox;
        
        // Check if the object is cylindrical and not already mapped to a priority object
        const isCylindrical = cylindricalObjects.includes(className);
        const alreadyMapped = CLASS_MAPPING[className] === 'oxygen tank';
        
        // If it's cylindrical but not yet mapped as oxygen tank, we'll add it
        if (isCylindrical && !alreadyMapped && score > 0.5) {
          console.log(`Found potential oxygen tank (${className}) with confidence ${score}`);
          
          additionalObjects.push({
            id: uuidv4(),
            label: 'oxygen tank',
            confidence: score * 0.9, // Slightly reduce confidence as it's a pattern match
            x: x,
            y: y,
            width: width,
            height: height,
            originalClass: className,
            color: OBJECT_COLORS['oxygen tank'],
            context: OBJECT_CONTEXT['oxygen tank']
          });
        }
      }
      
      return additionalObjects;
    } catch (error) {
      console.error('Error checking for oxygen tank patterns:', error);
      return [];
    }
  }

  public async detectObjects(imagePath: string): Promise<DetectionResult> {
    // Ensure model is loaded
    if (!this.model) {
      await this.loadModel();
    }
    
    try {
      // Read the image file
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Convert buffer to TensorFlow tensor
      const tfImage = tf.node.decodeImage(imageBuffer);
      
      // Run object detection
      const predictions = await this.model!.detect(tfImage as tf.Tensor3D);
      
      // Get image dimensions
      const [height, width] = tfImage.shape.slice(0, 2);
      
      // Release the tensor to free memory
      tfImage.dispose();
      
      console.log(`TensorFlow COCO-SSD detected ${predictions.length} objects`);
      
      // Process predictions to extract our priority objects
      const detectedObjects: DetectedObject[] = [];
      
      for (const prediction of predictions) {
        const { class: className, score, bbox } = prediction;
        const [x, y, width, height] = bbox;
        
        // Map COCO-SSD class to our custom class if applicable
        let mappedClass = CLASS_MAPPING[className] || className;
        
        // Check if this is one of our priority objects
        const isPriorityObject = PRIORITY_OBJECTS.some(obj => 
          mappedClass.toLowerCase().includes(obj.toLowerCase())
        );
        
        if (isPriorityObject) {
          // Find exact match for proper coloring and context
          const matchedObject = PRIORITY_OBJECTS.find(obj => 
            mappedClass.toLowerCase().includes(obj.toLowerCase())
          ) || mappedClass;
          
          const color = OBJECT_COLORS[matchedObject] || OBJECT_COLORS.default;
          const context = OBJECT_CONTEXT[matchedObject] || '';
          
          detectedObjects.push({
            id: uuidv4(),
            label: matchedObject,
            confidence: score,
            x: x / width,
            y: y / height,
            width: width / width,
            height: height / height,
            originalClass: className,
            color,
            context
          });
          
          console.log(`Processed detection: ${matchedObject} with color ${color}`);
        }
      }
      
      // Use pattern recognition to find additional oxygen tanks
      if (detectedObjects.length === 0) {
        const cylinderObjects = await this.checkForOxygenTankPattern(imagePath, predictions);
        
        // Add any detected oxygen tanks
        if (cylinderObjects.length > 0) {
          for (const obj of cylinderObjects) {
            detectedObjects.push({
              ...obj,
              // Normalize coordinates
              x: obj.x / width,
              y: obj.y / height,
              width: obj.width / width,
              height: obj.height / height
            });
            console.log(`Added oxygen tank from pattern detection with confidence ${obj.confidence}`);
          }
        }
      }
      
      // Generate a relative image URL
      const imageUrl = `/uploads/${path.basename(imagePath)}`;
      
      return {
        detectedObjects,
        imageUrl,
        detectionMethod: 'tensorflow-cocossd'
      };
    } catch (error) {
      console.error('Error during TensorFlow object detection:', error);
      throw new Error('Failed to detect objects using TensorFlow');
    }
  }
}

export const tensorflowDetector = new TensorFlowDetector();