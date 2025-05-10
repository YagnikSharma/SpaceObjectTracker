import { randomUUID } from "crypto";
import * as tf from "@tensorflow/tfjs-node";
import { DetectedObject } from "@shared/schema";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

// Initialize OpenAI for image understanding and context enhancement
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Track detected objects for training data
const detectionTrainingData: { [key: string]: { count: number, data: any[] } } = {
  "toolbox": { count: 0, data: [] },
  "fire extinguisher": { count: 0, data: [] },
  "oxygen tank": { count: 0, data: [] },
  "astronaut": { count: 0, data: [] },
  "person": { count: 0, data: [] }
};

// Define priority objects for space station monitoring
export const PRIORITY_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank', 'astronaut'];

// Loading the AI model
let detectionModel: tf.GraphModel | null = null;

// Define colors for visualization
const OBJECT_COLORS: Record<string, string> = {
  // Priority objects - with specific colors for visibility
  "toolbox": "#ffc107", // yellow 
  "fire extinguisher": "#f44336", // red
  "oxygen tank": "#2196f3", // blue
  
  // Human detection - always green
  "astronaut": "#4caf50", // green
  "person": "#4caf50", // green
  
  // Space station tools colors
  "torque wrench": "#ff9800",
  "power drill": "#ffeb3b",
  "multimeter": "#ffc107",
  "EVA toolkit": "#ffc107",
  "air quality monitor": "#8bc34a",
  "electronic screwdriver": "#cddc39",
  "pressure gauge": "#3f51b5", 
  "soldering iron": "#e91e63",
  "wire cutters": "#9c27b0",
  "oxygen analyzer": "#2196f3",
  
  // Default colors
  "default": "#f44336" // Default is red
};

/**
 * Space Object Detector Service
 * Provides methods to detect and analyze objects in space station environments
 */
export class SpaceObjectDetector {
  private modelPath: string;
  private isModelLoaded: boolean = false;
  
  constructor() {
    this.modelPath = path.join(process.cwd(), 'models', 'yolov8s.pt');
    this.setupDirectories();
    console.log(`Model will be loaded from: ${this.modelPath}`);
  }
  
  /**
   * Setup required directories
   */
  private setupDirectories() {
    const uploadDir = path.join(process.cwd(), 'uploads');
    const modelsDir = path.join(process.cwd(), 'models');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
  }
  
  /**
   * Initialize the space object detection model
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log("Initializing space object detection model...");
      
      // We'll use TensorFlow.js with a pre-trained model for object detection
      // as an alternative to direct YOLOv8 integration
      detectionModel = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1', { fromTFHub: true });
      
      console.log("Space object detection model loaded successfully!");
      this.isModelLoaded = true;
      return true;
    } catch (error) {
      console.error("Error initializing space object detection model:", error);
      return false;
    }
  }
  
  /**
   * Detect objects in an image
   */
  public async detectObjects(imagePath: string): Promise<DetectedObject[]> {
    try {
      console.log(`Processing image for detection: ${imagePath}`);
      
      // Check if model is loaded
      if (!this.isModelLoaded && !detectionModel) {
        await this.initialize();
      }
      
      // We'll use the OpenAI Vision API as our primary detection method
      // This provides accurate recognition of space station objects
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      return this.analyzeImageWithAI(imageBase64);
    } catch (error) {
      console.error("Error detecting objects:", error);
      return [];
    }
  }
  
  /**
   * Analyze image with AI vision models
   */
  private async analyzeImageWithAI(imageBase64: string): Promise<DetectedObject[]> {
    try {
      console.log("Analyzing image with object detection AI...");
      
      // Use OpenAI Vision for accurate detection
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are an accurate space station object detection system. ONLY identify objects that are ACTUALLY present in the image. Focus on detecting: toolboxes, fire extinguishers, oxygen tanks, and astronauts if present. Output a JSON array of objects with the key 'objects'. For each object include: label (string), confidence (number 0-1), x (normalized 0-1), y (normalized 0-1), width (normalized 0-1), height (normalized 0-1)."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and identify objects in a space station environment. Focus on detecting safety equipment (fire extinguishers, oxygen tanks), tools (toolboxes), and people (astronauts)."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      // Parse the response
      try {
        const result = JSON.parse(response.choices[0].message.content || "{}");
        
        // Only process if we have objects and they're in an array
        if (result.objects && Array.isArray(result.objects) && result.objects.length > 0) {
          return result.objects.map((obj: any) => {
            // Validate the object has all required properties
            if (!obj.label || typeof obj.confidence !== 'number' || 
                typeof obj.x !== 'number' || typeof obj.y !== 'number' ||
                typeof obj.width !== 'number' || typeof obj.height !== 'number') {
              console.error("Invalid object format from detection:", obj);
              return null;
            }
            
            // Convert to DetectedObject format
            const label = obj.label.toLowerCase();
            
            // Determine color based on object type
            let color = OBJECT_COLORS.default;
            
            if (label.includes("person") || label.includes("astronaut") || label.includes("human")) {
              color = OBJECT_COLORS["astronaut"]; // green for humans
            } else if (label.includes("fire extinguisher")) {
              color = OBJECT_COLORS["fire extinguisher"]; // red for fire extinguishers
            } else if (label.includes("oxygen tank")) {
              color = OBJECT_COLORS["oxygen tank"]; // blue for oxygen
            } else if (label.includes("toolbox") || label.includes("tool box")) {
              color = OBJECT_COLORS["toolbox"]; // yellow for toolbox
            } else if (label in OBJECT_COLORS) {
              color = OBJECT_COLORS[label];
            }
            
            const detectedObject: DetectedObject = {
              id: randomUUID(),
              label: obj.label,
              confidence: obj.confidence,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              color,
              context: this.generateObjectContext(obj.label)
            };
            
            // Add to training data if confidence is high
            if (obj.confidence > 0.7) {
              this.addToTrainingData(detectedObject);
            }
            
            return detectedObject;
          }).filter(Boolean); // Remove any null objects
        }
      } catch (error) {
        console.error("Error parsing detection response:", error);
      }
      
      return [];
    } catch (error) {
      console.error("Error analyzing image:", error);
      return [];
    }
  }
  
  /**
   * Generate contextual information for detected objects
   */
  private generateObjectContext(label: string): string {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes("fire extinguisher")) {
      return "Critical safety equipment. Check pressure gauge and ensure easy access.";
    } else if (lowerLabel.includes("oxygen tank")) {
      return "Life support equipment. Verify pressure levels and connection integrity.";
    } else if (lowerLabel.includes("toolbox")) {
      return "Equipment storage. Ensure proper organization and inventory completion.";
    } else if (lowerLabel.includes("astronaut") || lowerLabel.includes("person")) {
      return "Crew member. Verify proper safety equipment and positioning.";
    }
    
    return "Space station component. Monitor for proper functionality.";
  }
  
  /**
   * Add detection to training dataset
   */
  private addToTrainingData(detectedObject: DetectedObject): void {
    const label = detectedObject.label.toLowerCase();
    
    // Check if this is a priority object
    for (const category of PRIORITY_CATEGORIES) {
      if (label.includes(category)) {
        if (!detectionTrainingData[category]) {
          detectionTrainingData[category] = { count: 0, data: [] };
        }
        
        detectionTrainingData[category].count += 1;
        detectionTrainingData[category].data.push({
          bbox: [detectedObject.x, detectedObject.y, detectedObject.width, detectedObject.height],
          confidence: detectedObject.confidence,
          originalData: detectedObject
        });
        
        console.log(`Added detection of ${category} to training data. Total samples: ${detectionTrainingData[category].count}`);
        break;
      }
    }
  }
  
  /**
   * Get model statistics and status
   */
  public getModelStats() {
    let totalSamples = 0;
    const objectCounts: Record<string, number> = {};
    
    for (const [label, data] of Object.entries(detectionTrainingData)) {
      objectCounts[label] = data.count;
      totalSamples += data.count;
    }
    
    return {
      modelLoaded: this.isModelLoaded,
      modelPath: this.modelPath,
      totalSamples,
      objectCounts
    };
  }
  
  /**
   * Import a custom model
   */
  public importModel(modelBuffer: Buffer, modelName: string = 'space-objects-model.pt'): boolean {
    try {
      const modelsDir = path.join(process.cwd(), 'models');
      const newModelPath = path.join(modelsDir, modelName);
      
      fs.writeFileSync(newModelPath, modelBuffer);
      console.log(`Custom model imported successfully to ${newModelPath}`);
      this.modelPath = newModelPath;
      
      // Reset model to trigger reloading with new model
      this.isModelLoaded = false;
      
      return true;
    } catch (error) {
      console.error("Error importing custom model:", error);
      return false;
    }
  }
}

// Create singleton instance
export const spaceObjectDetector = new SpaceObjectDetector();

// Initialize model on startup
spaceObjectDetector.initialize().catch(err => 
  console.error("Failed to initialize space object detection model:", err)
);

export default {
  spaceObjectDetector,
  PRIORITY_CATEGORIES,
  OBJECT_COLORS
};