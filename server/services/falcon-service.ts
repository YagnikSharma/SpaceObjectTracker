import { DetectedObject } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { detectObjectsWithYolo, SPACE_OBJECT_COLORS } from "./yolo-service";

interface FalconApiResponse {
  detectedObjects: DetectedObject[];
  imageUrl: string;
}

// Using the color mapping from the YOLO service for consistency
const OBJECT_COLORS = SPACE_OBJECT_COLORS;

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
 * Process an image with our enhanced Falcon API to detect space objects
 * @param imageBuffer - Image buffer to process
 * @returns Object with detected objects and image URL
 */
export async function processImageWithFalcon(imageBuffer: Buffer): Promise<FalconApiResponse> {
  try {
    console.log('Processing image with enhanced Falcon API...');
    
    // Save the image and get its URL
    const imageUrl = await saveImage(imageBuffer);
    
    // Detect space objects in the image
    const detectedObjects = await detectObjectsWithYolo(imageBuffer);
    
    console.log(`Enhanced Falcon API detected ${detectedObjects.length} objects in the image`);
    
    return {
      detectedObjects,
      imageUrl
    };
  } catch (error) {
    console.error('Error in enhanced Falcon API:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : String(error)}`);
  }
}
