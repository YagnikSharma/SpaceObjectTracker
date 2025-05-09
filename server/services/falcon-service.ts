import { DetectedObject } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

interface FalconApiResponse {
  detectedObjects: DetectedObject[];
  imageUrl: string;
}

// Map of common space object types and their corresponding colors
const OBJECT_COLORS: Record<string, string> = {
  satellite: "#3B82F6", // blue
  debris: "#F59E0B",    // amber
  station: "#10B981",   // green
  rocket: "#6366F1",    // indigo
  telescope: "#8B5CF6", // violet
  default: "#EF4444",   // red
};

// Sample space object types and their probabilities
const SPACE_OBJECT_TYPES = [
  { label: "satellite", probability: 0.4 },
  { label: "debris", probability: 0.25 },
  { label: "station", probability: 0.1 },
  { label: "rocket", probability: 0.15 },
  { label: "telescope", probability: 0.1 }
];

/**
 * Mock function to simulate space object detection
 * Generates random space objects based on image properties
 */
function detectObjectsInImage(imageBuffer: Buffer): DetectedObject[] {
  // Get a semi-deterministic number based on image size
  const imageSize = imageBuffer.length;
  const numObjects = Math.max(1, Math.min(5, Math.floor(imageSize / 100000) + 1));
  
  const objects: DetectedObject[] = [];
  
  for (let i = 0; i < numObjects; i++) {
    // Random position and size
    const x = Math.random() * 0.7; // Keep within bounds
    const y = Math.random() * 0.7;
    const width = Math.random() * 0.2 + 0.1;
    const height = Math.random() * 0.2 + 0.1;
    
    // Select object type based on probabilities
    let objectType = SPACE_OBJECT_TYPES[0].label;
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const obj of SPACE_OBJECT_TYPES) {
      cumulativeProbability += obj.probability;
      if (rand <= cumulativeProbability) {
        objectType = obj.label;
        break;
      }
    }
    
    // Random confidence level (higher for more common objects)
    const baseConfidence = objectType === "satellite" || objectType === "debris" ? 0.8 : 0.7;
    const confidence = baseConfidence + (Math.random() * 0.2);
    
    objects.push({
      id: randomUUID(),
      label: objectType,
      confidence,
      x,
      y,
      width,
      height,
      color: OBJECT_COLORS[objectType] || OBJECT_COLORS.default
    });
  }
  
  return objects;
}

/**
 * Save image to disk with a unique filename
 */
async function saveImage(imageBuffer: Buffer): Promise<string> {
  const id = randomUUID();
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `${id}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    
    await fs.writeFile(filepath, imageBuffer);
    
    // Return URL path to the saved image
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
}

/**
 * Process an image with our simulated Falcon API to detect space objects
 * @param imageBuffer - Image buffer to process
 * @returns Object with detected objects and image URL
 */
export async function processImageWithFalcon(imageBuffer: Buffer): Promise<FalconApiResponse> {
  try {
    console.log('Processing image with simulated Falcon API...');
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save the image and get its URL
    const imageUrl = await saveImage(imageBuffer);
    
    // Detect objects in the image
    const detectedObjects = detectObjectsInImage(imageBuffer);
    
    console.log(`Detected ${detectedObjects.length} objects in the image`);
    
    return {
      detectedObjects,
      imageUrl
    };
  } catch (error) {
    console.error('Error in simulated Falcon API:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
