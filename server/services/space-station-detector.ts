import { randomUUID } from 'crypto';
import { DetectedObject } from '@shared/schema';
import { yoloBridge } from './yolo-bridge';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

// Initialize OpenAI for enhanced detection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Space Station Detector 
 * Comprehensive service for detecting objects in space station environments
 */
export class SpaceStationDetector {
  /**
   * Process and detect objects in an uploaded image
   */
  public async detectObjectsInImage(imageBuffer: Buffer, originalFilename: string): Promise<{
    success: boolean;
    imageUrl: string;
    detectedObjects: DetectedObject[];
    detectionMethod: string;
  }> {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save image with a unique filename
      const imageName = `space_station_scan_${randomUUID()}.jpg`;
      const imagePath = path.join(uploadsDir, imageName);
      fs.writeFileSync(imagePath, imageBuffer);
      
      // Detect objects using YOLOv8 bridge
      console.log('Detecting objects with YOLOv8...');
      const yoloResult = await yoloBridge.detectObjects(imagePath);
      
      // If YOLOv8 detection found objects, return those
      if (yoloResult.success && yoloResult.detections.length > 0) {
        console.log(`YOLOv8 detected ${yoloResult.count} objects`);
        
        return {
          success: true,
          imageUrl: `/uploads/${imageName}`,
          detectedObjects: yoloResult.detections,
          detectionMethod: 'yolov8'
        };
      }
      
      // If YOLOv8 failed or found no objects, try with OpenAI Vision API
      console.log('YOLOv8 found no objects, trying OpenAI Vision API...');
      const visionResult = await this.detectWithOpenAI(imageBuffer);
      
      if (visionResult.length > 0) {
        console.log(`OpenAI Vision detected ${visionResult.length} objects`);
        
        return {
          success: true,
          imageUrl: `/uploads/${imageName}`,
          detectedObjects: visionResult,
          detectionMethod: 'openai-vision'
        };
      }
      
      // If all detection methods failed, return empty results
      return {
        success: true,
        imageUrl: `/uploads/${imageName}`,
        detectedObjects: [],
        detectionMethod: 'no-detections'
      };
    } catch (error) {
      console.error('Error detecting objects:', error);
      throw error;
    }
  }
  
  /**
   * Detect objects using OpenAI Vision API
   */
  private async detectWithOpenAI(imageBuffer: Buffer): Promise<DetectedObject[]> {
    try {
      console.log('Analyzing image with OpenAI Vision API...');
      
      // Convert buffer to base64
      const imageBase64 = imageBuffer.toString('base64');
      
      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: 'system',
            content: `You are a space station object detection system. Identify ONLY these three specific objects in the image: 
            - toolboxes
            - fire extinguishers
            - oxygen tanks
            
            Output a JSON array of objects with the key 'objects'. For each object include:
            - label (string)
            - confidence (number 0-1)
            - x (normalized 0-1, representing the left edge)
            - y (normalized 0-1, representing the top edge)
            - width (normalized 0-1)
            - height (normalized 0-1)`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify only toolboxes, fire extinguishers, and oxygen tanks in this image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000
      });
      
      // Parse and validate response
      try {
        const result = JSON.parse(response.choices[0].message.content || '{}');
        
        if (result.objects && Array.isArray(result.objects) && result.objects.length > 0) {
          return result.objects.map((obj: any) => {
            // Validate object has required properties
            if (!obj.label || typeof obj.confidence !== 'number' || 
                typeof obj.x !== 'number' || typeof obj.y !== 'number' ||
                typeof obj.width !== 'number' || typeof obj.height !== 'number') {
              console.error('Invalid object format from OpenAI:', obj);
              return null;
            }
            
            // Determine color based on label
            const label = obj.label.toLowerCase();
            let color = this.OBJECT_COLORS.default;
            
            for (const category in this.OBJECT_COLORS) {
              if (label.includes(category)) {
                color = this.OBJECT_COLORS[category as keyof typeof this.OBJECT_COLORS];
                break;
              }
            }
            
            // Create detection object
            const detectedObject: DetectedObject = {
              id: randomUUID(),
              label: obj.label,
              confidence: obj.confidence,
              x: obj.x,
              y: obj.y,
              width: obj.width,
              height: obj.height,
              color,
              context: this.getContextForObject(obj.label)
            };
            
            return detectedObject;
          }).filter(Boolean) as DetectedObject[];
        }
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
      }
      
      return [];
    } catch (error) {
      console.error('Error analyzing image with OpenAI Vision:', error);
      return [];
    }
  }
  
  /**
   * Get contextual information for detected objects
   */
  private getContextForObject(label: string): string {
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
  
  // Define these constants locally within the class
  private OBJECT_COLORS = {
    'fire extinguisher': '#f44336',  // Red
    'oxygen tank': '#2196f3',        // Blue
    'toolbox': '#ffc107',            // Yellow
    'astronaut': '#4caf50',          // Green
    'person': '#4caf50',             // Green
    'default': '#ff9800'             // Orange
  };
  
  private PRIORITY_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank'];
  
  /**
   * Upload and import a custom YOLOv8 model
   */
  public importModel(modelBuffer: Buffer, modelName: string = 'yolov8s.pt'): boolean {
    return yoloBridge.importModel(modelBuffer, modelName);
  }
  
  /**
   * Get training and model statistics
   */
  public getStats() {
    return {
      ...yoloBridge.getTrainingStats(),
      priorityCategories: this.PRIORITY_CATEGORIES,
      detectionMethods: ['yolov8', 'openai-vision', 'fallback'],
      colorMap: this.OBJECT_COLORS
    };
  }
}

// Create singleton instance
export const spaceStationDetector = new SpaceStationDetector();

// Export priority categories directly
export const PRIORITY_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank'];
export const OBJECT_COLORS = {
  'fire extinguisher': '#f44336',  // Red
  'oxygen tank': '#2196f3',        // Blue
  'toolbox': '#ffc107',            // Yellow
  'astronaut': '#4caf50',          // Green
  'person': '#4caf50',             // Green
  'default': '#ff9800'             // Orange
};

export default {
  spaceStationDetector,
  PRIORITY_CATEGORIES,
  OBJECT_COLORS
};