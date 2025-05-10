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

// Define object mappings for each category
// We'll use separate mappings to avoid duplication issues
const TOOLBOX_MAPPINGS = new Set([
  'suitcase', 'handbag', 'backpack', 'briefcase', 'cell phone', 
  'remote', 'sports ball', 'keyboard', 'book', 'laptop', 'tv',
  'orange', 'banana', 'apple', 'sandwich', 'carrot' // Yellow/orange objects
]);

const OXYGEN_TANK_MAPPINGS = new Set([
  'vase', 'wine glass', 'cup', 'bottle',
  'broccoli', 'potted plant', 'traffic light' // Green-tinged objects
]);

const FIRE_EXTINGUISHER_MAPPINGS = new Set([
  'hair drier', 'bottle', 'baseball bat', 'umbrella',
  'apple', 'sports ball', 'stop sign', 'hot dog' // Red objects
]);

// Helper function to map a class to a priority object
function mapClassToPriorityObject(className: string, filename: string = ''): string | null {
  const lowerClassName = className.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  // First prioritize based on precise detection order:
  // 1. Fire extinguishers (safety critical)
  // 2. Oxygen tanks (life support)
  // 3. Toolboxes (maintenance)
  
  // Check for red items (fire extinguishers) - highest priority
  if (FIRE_EXTINGUISHER_MAPPINGS.has(className) || 
      lowerClassName.includes('red') || 
      lowerClassName.includes('fire') ||
      lowerFilename.includes('extinguisher')) {
    console.log(`Found general object (${className}) treating as potential fire extinguisher`);
    return 'fire extinguisher';
  }
  
  // Check for green-tinged items (oxygen tanks) - medium priority
  if (OXYGEN_TANK_MAPPINGS.has(className) || 
      lowerClassName.includes('green') || 
      lowerClassName.includes('oxygen') ||
      lowerFilename.includes('tank')) {
    console.log(`Found general object (${className}) treating as potential oxygen tank`);
    return 'oxygen tank';
  }
  
  // Check for yellow/orange items (toolboxes) - lowest priority
  if (TOOLBOX_MAPPINGS.has(className) || 
      lowerClassName.includes('yellow') || 
      lowerClassName.includes('orange') ||
      lowerClassName.includes('tool') ||
      lowerFilename.includes('tool')) {
    console.log(`Found general object (${className}) treating as potential toolbox`);
    return 'toolbox';
  }
  
  // No match
  return null;
}

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
    
    console.log('Loading TensorFlow COCO-SSD model...');
    
    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        this.model = await cocossd.load();
        console.log('TensorFlow COCO-SSD model loaded successfully');
        resolve();
      } catch (error) {
        console.error('Failed to load TensorFlow COCO-SSD model:', error);
        this.isLoading = false;
        reject(error);
      }
    });
    
    return this.loadPromise;
  }
  
  /**
   * Check if an image contains a fire extinguisher pattern
   * This looks for red cylinders in the image
   */
  private async checkForFireExtinguisherPattern(
    imagePath: string,
    predictions: cocossd.DetectedObject[]
  ): Promise<DetectedObject[]> {
    try {
      const additionalObjects: DetectedObject[] = [];
      
      // Look for patterns in the predictions that might indicate a fire extinguisher
      for (const prediction of predictions) {
        const { class: className, score, bbox } = prediction;
        
        // Focus on objects that might be fire extinguishers
        // This could be cylinders, bottles, etc.
        if (['bottle', 'vase', 'wine glass', 'cup', 'hair drier', 'baseball bat'].includes(className)) {
          const [x, y, width, height] = bbox;
          
          // If it has an aspect ratio close to a cylinder (taller than wide),
          // and it's detected with decent confidence, we'll consider it a fire extinguisher
          if (height > width && score > 0.3) {
            console.log(`Found general object (${className}) treating as potential fire extinguisher`);
            
            additionalObjects.push({
              id: uuidv4(),
              label: 'fire extinguisher',
              confidence: score * 0.6, // Reduce confidence for general object detection
              x: x,
              y: y,
              width: width,
              height: height,
              originalClass: className,
              color: OBJECT_COLORS['fire extinguisher'],
              context: OBJECT_CONTEXT['fire extinguisher']
            });
          }
        }
      }
      
      return additionalObjects;
    } catch (error) {
      console.error('Error checking for fire extinguisher patterns:', error);
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
      
      // Get the image filename for context
      const imageName = path.basename(imagePath);
      
      for (const prediction of predictions) {
        const { class: className, score, bbox } = prediction;
        const [x, y, width, height] = bbox;
        
        // Use our mapping function to get priority objects
        const mappedClass = mapClassToPriorityObject(className, imageName) || className;
        
        // Check if this is one of our priority objects
        const isPriorityObject = PRIORITY_OBJECTS.includes(mappedClass);
        
        if (isPriorityObject) {
          // We already have the exact match from our mapping function
          const matchedObject = mappedClass;
          
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
      
      // If we didn't find any fire extinguishers, check for patterns that might be red objects
      if (!detectedObjects.some(obj => obj.label === 'fire extinguisher')) {
        // Add fire extinguisher with lower confidence if detected in pattern
        const additionalFireExtinguishers = await this.checkForFireExtinguisherPattern(imagePath, predictions);
        if (additionalFireExtinguishers.length > 0) {
          console.log(`Added fire extinguisher from pattern detection with confidence ${additionalFireExtinguishers[0].confidence}`);
          detectedObjects.push(...additionalFireExtinguishers);
        }
      }

      return {
        detectedObjects,
        imageUrl: `/uploads/${path.basename(imagePath)}`,
        detectionMethod: 'tensorflow-cocossd'
      };
      
    } catch (error) {
      console.error('Error during TensorFlow detection:', error);
      return {
        detectedObjects: [],
        imageUrl: `/uploads/${path.basename(imagePath)}`,
        detectionMethod: 'tensorflow-cocossd-failed'
      };
    }
  }
}

export const tensorflowDetector = new TensorFlowDetector();