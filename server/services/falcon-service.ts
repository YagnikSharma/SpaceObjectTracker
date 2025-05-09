import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define space station component categories for synthetic image generation
export const SPACE_CATEGORIES = {
  TOOLS: [
    "torque wrench",
    "power drill",
    "multimeter",
    "EVA toolkit",
    "air quality monitor",
    "electronic screwdriver",
    "soldering iron",
    "cable cutter",
    "laser measurement tool"
  ],
  GAUGES: [
    "pressure gauge",
    "oxygen level meter",
    "temperature sensor",
    "radiation monitor",
    "power consumption meter",
    "water recycling indicator",
    "air flow meter",
    "humidity gauge"
  ],
  STRUCTURAL: [
    "airlock panel",
    "ventilation duct",
    "habitat module connector",
    "power distribution node",
    "control panel",
    "structural support beam",
    "insulation panel",
    "cable management system"
  ],
  EMERGENCY: [
    "fire extinguisher",
    "emergency oxygen supply",
    "medical kit",
    "evacuation procedure display",
    "emergency lighting system",
    "escape pod controls",
    "emergency communication system"
  ]
};

export interface SyntheticImageOptions {
  category: keyof typeof SPACE_CATEGORIES | 'random';
  count: number;
}

export interface GeneratedImage {
  url: string;
  filename: string;
  prompt: string;
}

/**
 * Generate synthetic space station component images using Falcon AI
 */
export async function generateSyntheticImages(options: SyntheticImageOptions): Promise<GeneratedImage[]> {
  const { category, count } = options;
  const results: GeneratedImage[] = [];
  const selectedCategory = category === 'random' 
    ? Object.keys(SPACE_CATEGORIES)[Math.floor(Math.random() * Object.keys(SPACE_CATEGORIES).length)] as keyof typeof SPACE_CATEGORIES
    : category;
  
  // Ensure the uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Begin generating images
  for (let i = 0; i < count; i++) {
    try {
      // Generate a random component from the selected category
      const components = SPACE_CATEGORIES[selectedCategory];
      const component = components[Math.floor(Math.random() * components.length)];
      
      // Create a detailed prompt for realistic space station component
      const basePrompt = `A realistic, detailed image of a ${component} inside a space station. The ${component} should be clearly visible and appear as it would in a real space station environment with proper lighting. Include some context like control panels or other space station elements in the background. This should look like a photograph taken by an astronaut for maintenance purposes.`;
      
      // Add variations to make each image unique
      const variations = [
        "The item appears to be in good condition.",
        "The item shows some wear and tear from extended use.",
        "The item is mounted on a wall panel.",
        "The item is floating in microgravity.",
        "The item is being used by an astronaut (only hands visible).",
        "The item is placed next to other space tools.",
        "The item is in a storage compartment.",
        "The lighting is bright and clear.",
        "The lighting is dim with emergency lighting visible."
      ];
      
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      const prompt = `${basePrompt} ${randomVariation}`;
      
      // Use OpenAI DALL·E 3 to generate the image
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      });
      
      const imageUrl = response.data[0].url;
      
      if (imageUrl) {
        // Download the image to local storage
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.arrayBuffer();
        
        // Create a unique filename
        const filename = `${component.replace(/\\s+/g, '-')}-${uuidv4().slice(0, 8)}.png`;
        const filePath = path.join(uploadsDir, filename);
        
        // Save the file
        fs.writeFileSync(filePath, Buffer.from(buffer));
        
        // Add to results
        results.push({
          url: `/uploads/${filename}`, // URL for client access
          filename: filename,
          prompt: prompt
        });
      }
    } catch (error) {
      console.error('Error generating synthetic image:', error);
    }
  }
  
  return results;
}

// Helper function to get all categories for the frontend
export function getSyntheticCategories() {
  return {
    categories: Object.keys(SPACE_CATEGORIES)
  };
}

/**
 * Enhances YOLO detection results with space station context
 * This adds domain-specific classification to generic YOLO detections
 */
export function enhanceDetectionWithContext(detections: any[]): any[] {
  if (!detections || !detections.length) return [];
  
  // Map of COCO-SSD classes to space station component types
  const componentMapping: Record<string, string> = {
    // Tools mapping
    "scissors": "TOOLS",
    "knife": "TOOLS",
    "spoon": "TOOLS",
    "screwdriver": "TOOLS",
    "wrench": "TOOLS",
    "drill": "TOOLS",
    
    // Gauges and monitors mapping
    "clock": "GAUGES",
    "cell phone": "GAUGES",
    "computer": "GAUGES",
    "laptop": "GAUGES",
    "tv": "GAUGES",
    "monitor": "GAUGES",
    "meter": "GAUGES",
    
    // Structural elements mapping
    "door": "STRUCTURAL",
    "window": "STRUCTURAL",
    "oven": "STRUCTURAL",
    "microwave": "STRUCTURAL",
    "refrigerator": "STRUCTURAL",
    "sink": "STRUCTURAL",
    "panel": "STRUCTURAL",
    "screen": "STRUCTURAL",
    
    // Emergency equipment mapping
    "fire hydrant": "EMERGENCY",
    "fire extinguisher": "EMERGENCY",
    "oxygen tank": "EMERGENCY",
    "first aid": "EMERGENCY"
  };
  
  // Add space context to each detection
  return detections.map(detection => {
    // Get the original class from YOLO
    const originalClass = detection.class || detection.label || "";
    
    // Determine space station context
    const context = componentMapping[originalClass.toLowerCase()] || "UNKNOWN";
    
    // Add potential issues based on confidence
    let issue = null;
    if (detection.confidence < 0.7) {
      issue = "Low confidence detection - verify component";
    }
    
    // Add reference documentation link based on component type
    let referenceLink = null;
    if (context === "TOOLS") {
      referenceLink = "https://www.nasa.gov/iss/tools";
    } else if (context === "GAUGES") {
      referenceLink = "https://www.nasa.gov/iss/monitoring";
    } else if (context === "STRUCTURAL") {
      referenceLink = "https://www.nasa.gov/iss/structure";
    } else if (context === "EMERGENCY") {
      referenceLink = "https://www.nasa.gov/iss/emergency";
    }
    
    // Return enhanced detection with space station context
    return {
      ...detection,
      originalClass,
      context,
      issue,
      referenceLink
    };
  });
}