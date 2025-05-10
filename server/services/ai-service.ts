import { randomUUID } from "crypto";
import * as tf from "@tensorflow/tfjs";
import { DetectedObject } from "@shared/schema";
import { enhanceDetectionWithContext } from "./falcon-service";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import OpenAI from "openai";

// Initialize OpenAI for image understanding
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Loading the AI model
let aiModel: tf.GraphModel | null = null;

// Track detected objects for training data
const detectionTrainingData: { [key: string]: { count: number, data: any[] } } = {
  "toolbox": { count: 0, data: [] },
  "fire extinguisher": { count: 0, data: [] },
  "oxygen tank": { count: 0, data: [] },
  "astronaut": { count: 0, data: [] },
  "person": { count: 0, data: [] }
};

// Define priority objects for space station
const PRIORITY_OBJECTS = ["toolbox", "fire extinguisher", "oxygen tank"];

// Define space object colors for visualization
const SPACE_OBJECT_COLORS: Record<string, string> = {
  // Priority objects - highlighted in warning color
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
  
  // Gauge and meter colors
  "oxygen level gauge": "#03a9f4",
  "radiation detector": "#f44336",
  "humidity sensor": "#00bcd4",
  "air flow meter": "#009688",
  "carbon dioxide monitor": "#673ab7",
  "temperature gauge": "#ff5722",
  
  // Structural elements colors
  "airlock": "#607d8b", 
  "hatch seal": "#795548",
  "window panel": "#9e9e9e",
  "solar panel": "#ffeb3b",
  "air filtration unit": "#8bc34a",
  "water recycling system": "#00bcd4",
  "electrical panel": "#ffc107",
  "communication module": "#3f51b5",
  "life support system": "#4caf50",
  
  // Emergency equipment colors - all in red
  "emergency oxygen supply": "#f44336",
  "first aid kit": "#e91e63",
  "emergency lighting": "#ff9800",
  "evacuation procedure": "#607d8b",
  
  // Default colors
  "default": "#f44336" // Default is red
};

// Mapping of detected objects to space station objects
const DETECTED_TO_SPACE: Record<string, string> = {
  // Map generic objects to space station equivalents  
  "person": "astronaut",
  "bicycle": "mobility device",
  "car": "rover",
  "boat": "water recycling system",
  "airplane": "spacecraft",
  "backpack": "toolbox",
  "suitcase": "toolbox",
  "bottle": "oxygen tank",
  "bus": "habitat module",
  "train": "transport module",
  "truck": "cargo module",
  
  // Space station tools mapping
  "scissors": "wire cutters",
  "knife": "multipurpose tool",
  "spoon": "sample collection tool",
  "bowl": "container unit",
  "oven": "thermal processing unit",
  "microwave": "food preparation unit",
  
  // Direct mappings for space station elements
  "torque wrench": "torque wrench",
  "power drill": "power drill",
  "multimeter": "multimeter",
  "pressure gauge": "pressure gauge",
  "oxygen level gauge": "oxygen level gauge",
  "airlock": "airlock",
  "hatch seal": "hatch seal",
  "window panel": "window panel",
  "solar panel": "solar panel",
  "air filtration unit": "air filtration unit",
  "fire extinguisher": "fire extinguisher",
  "oxygen tank": "oxygen tank",
  "toolbox": "toolbox",
  
  // Default mapping
  "default": "unknown component"
};

/**
 * Initialize and load the AI model for space object detection
 */
export async function initAIModel(): Promise<void> {
  try {
    console.log("Loading AI model for space object detection...");
    
    // In a real implementation, load a custom trained model for space station components
    if (!aiModel) {
      // Load the model (using a public TF model for demonstration)
      aiModel = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1', { fromTFHub: true });
      console.log("AI model loaded successfully!");
    }
  } catch (error) {
    console.error("Error loading AI model:", error);
    // We will continue without model, using simulated detection in case of failure
  }
}

/**
 * Add detection to training dataset for continuous learning
 */
function addToTrainingData(detectedObject: DetectedObject): void {
  const label = detectedObject.label.toLowerCase();
  
  // Check if this is a priority object or a person
  const trainingLabels = [...PRIORITY_OBJECTS, "astronaut", "person"];
  
  for (const trainLabel of trainingLabels) {
    if (label.includes(trainLabel)) {
      if (!detectionTrainingData[trainLabel]) {
        detectionTrainingData[trainLabel] = { count: 0, data: [] };
      }
      
      detectionTrainingData[trainLabel].count += 1;
      detectionTrainingData[trainLabel].data.push({
        bbox: [detectedObject.x, detectedObject.y, detectedObject.width, detectedObject.height],
        confidence: detectedObject.confidence,
        originalData: detectedObject
      });
      
      console.log(`Added detection of ${trainLabel} to training data. Total samples: ${detectionTrainingData[trainLabel].count}`);
      break;
    }
  }
}

/**
 * Analyze image with OpenAI Vision API for accurate object detection
 */
async function analyzeImageWithAI(imageBase64: string): Promise<DetectedObject[]> {
  try {
    console.log("Analyzing image with OpenAI Vision API...");
    
    // Use OpenAI Vision API to analyze the image - this is real, not simulated
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
      messages: [
        {
          role: "system",
          content: "You are an accurate computer vision system. ONLY identify objects that are ACTUALLY present in the image. DO NOT hallucinate or make up objects. Be very conservative with your detections. You should ONLY detect real objects that are visibly present. Output a JSON array of objects with the key 'objects'. If no objects of interest are found, return an empty array. For each object present include: label (string - actual object name), confidence (number 0-1), x (normalized 0-1), y (normalized 0-1), width (normalized 0-1), height (normalized 0-1)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and identify ONLY REAL objects that are ACTUALLY present. Do not hallucinate objects. Be very conservative. If you're not certain, don't detect it. Focus on detecting: toolboxes, fire extinguishers, oxygen tanks, and people if present. Only return objects that are definitely present in the image."
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
            console.error("Invalid object format from OpenAI:", obj);
            return null;
          }
          
          // Convert to DetectedObject format
          const label = obj.label.toLowerCase();
          
          // Determine color - green for humans, red for others unless they're in our color map
          let color = "#f44336"; // default red
          
          if (label.includes("person") || label.includes("astronaut") || label.includes("human")) {
            color = "#4caf50"; // green for humans
          } else if (PRIORITY_OBJECTS.some(priority => label.includes(priority))) {
            color = "#ffc107"; // yellow for priority objects
          } else if (label in SPACE_OBJECT_COLORS) {
            color = SPACE_OBJECT_COLORS[label];
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
            originalClass: "vision-detected"
          };
          
          // Add to training data only if confidence is high
          if (obj.confidence > 0.7) {
            addToTrainingData(detectedObject);
          }
          
          return detectedObject;
        }).filter(Boolean); // Remove any null objects
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error, "Response:", response.choices[0].message.content);
    }
    
    return [];
  } catch (error) {
    console.error("Error analyzing image with OpenAI Vision API:", error);
    return [];
  }
}

/**
 * Processes an image using AI model for space station object detection
 */
export async function detectSpaceStationObjects(
  imageBuffer: Buffer, 
  originalWidth: number, 
  originalHeight: number
): Promise<DetectedObject[]> {
  try {
    console.log("Processing image with accurate object detection...");
    
    // Note: We're using advanced AI-powered detection in this implementation
    // Specifically using OpenAI Vision API for precise object detection
    
    // Convert image buffer to base64 for AI analysis
    const imageBase64 = imageBuffer.toString('base64');
    
    // Analyze with OpenAI Vision API
    const aiDetectedObjects = await analyzeImageWithAI(imageBase64);
    
    // If AI detection found objects, use those
    if (aiDetectedObjects.length > 0) {
      console.log(`OpenAI Vision detected ${aiDetectedObjects.length} objects`);
      
      // Enhance detected objects with proper colors and context
      const colorMappedObjects = aiDetectedObjects.map(obj => {
        const label = obj.label.toLowerCase();
        
        // Map to space station equivalents if needed
        let mappedLabel = obj.label;
        for (const [key, value] of Object.entries(DETECTED_TO_SPACE)) {
          if (label.includes(key.toLowerCase())) {
            mappedLabel = value;
            break;
          }
        }
        
        // Set color based on object type
        let color = "#f44336"; // default red
        
        if (label.includes("person") || label.includes("astronaut")) {
          color = "#4caf50"; // green for humans
        } else {
          // Check if we have a color for this object
          for (const [key, colorValue] of Object.entries(SPACE_OBJECT_COLORS)) {
            if (mappedLabel.toLowerCase().includes(key.toLowerCase())) {
              color = colorValue;
              break;
            }
          }
        }
        
        return {
          ...obj,
          label: mappedLabel,
          color
        };
      });
      
      // Enhance with Falcon context 
      const contextEnhancedObjects = enhanceDetectionWithContext(colorMappedObjects);
      
      return contextEnhancedObjects;
    }
    
    // If OpenAI Vision API didn't detect any objects, return empty array
    console.log("No objects detected in the image by Vision API");
    return [];
    
  } catch (error) {
    console.error('Error in object detection:', error);
    // Return empty array in case of error - no fake objects
    return [];
  }
}

/**
 * Gets statistics about the training data collection
 */
export function getTrainingStatistics(): { totalSamples: number, objectCounts: Record<string, number> } {
  let totalSamples = 0;
  const objectCounts: Record<string, number> = {};
  
  for (const [label, data] of Object.entries(detectionTrainingData)) {
    objectCounts[label] = data.count;
    totalSamples += data.count;
  }
  
  return {
    totalSamples,
    objectCounts
  };
}

// Initialize model when module is loaded
initAIModel().catch(err => console.error("Failed to initialize AI model:", err));

export default {
  detectSpaceStationObjects,
  initAIModel,
  getTrainingStatistics,
  SPACE_OBJECT_COLORS,
  DETECTED_TO_SPACE,
  PRIORITY_OBJECTS
};