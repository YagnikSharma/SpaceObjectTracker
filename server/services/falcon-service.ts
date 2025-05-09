import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import { DetectedObject } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Categories for space station components
export const SPACE_CATEGORIES = {
  TOOLS: [
    "torque wrench",
    "power drill",
    "multimeter",
    "electronic screwdriver",
    "soldering iron",
    "wire cutters",
    "diagnostic tablet",
    "laser calibrator",
    "plasma cutter"
  ],
  GAUGES: [
    "oxygen level gauge",
    "pressure gauge",
    "temperature gauge",
    "radiation detector",
    "humidity sensor",
    "airflow meter",
    "carbon dioxide monitor",
    "electrical current meter"
  ],
  STRUCTURAL: [
    "airlock panel",
    "ventilation duct",
    "habitat module connector",
    "power distribution node",
    "control panel",
    "structural support beam",
    "solar panel mount",
    "external hatch"
  ],
  EMERGENCY: [
    "fire extinguisher",
    "emergency oxygen supply",
    "medical kit",
    "evacuation procedure display",
    "emergency beacon",
    "safety harness",
    "radiation shield",
    "emergency lighting system"
  ]
};

/**
 * Interface for synthetic image generation options
 */
export interface SyntheticImageOptions {
  category: keyof typeof SPACE_CATEGORIES | 'random';
  count: number;
}

/**
 * Interface for generated image data
 */
export interface GeneratedImage {
  url: string;
  filename: string;
  prompt: string;
}

/**
 * Generate synthetic space station component images using Falcon AI (simulated with DALL-E)
 */
export async function generateSyntheticImages(options: SyntheticImageOptions): Promise<GeneratedImage[]> {
  try {
    console.log(`Generating ${options.count} synthetic images for ${options.category}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Get components based on category
    let components: string[] = [];
    
    if (options.category === 'random') {
      // Pick components from all categories
      const allComponents = Object.values(SPACE_CATEGORIES).flat();
      components = shuffleArray(allComponents).slice(0, options.count);
    } else {
      // Get components from the specified category
      const categoryComponents = SPACE_CATEGORIES[options.category];
      // If we need more than available, allow repeats with different variations
      if (categoryComponents.length < options.count) {
        // Duplicate some components with different descriptors
        while (components.length < options.count) {
          components = components.concat(categoryComponents);
        }
        components = components.slice(0, options.count);
      } else {
        // Randomly select the requested number of components
        components = shuffleArray(categoryComponents).slice(0, options.count);
      }
    }
    
    // Generate images in parallel
    const imagePromises = components.map(component => generateSingleImage(component, options.category));
    const generatedImages = await Promise.all(imagePromises);
    
    return generatedImages;
  } catch (error) {
    console.error("Error generating synthetic images:", error);
    throw new Error(`Failed to generate synthetic images: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a single synthetic image for a space station component
 */
async function generateSingleImage(component: string, category: string): Promise<GeneratedImage> {
  try {
    // Create varied prompts for more diverse training data
    const environmentDescriptors = [
      "aboard the International Space Station",
      "in a futuristic space habitat",
      "on a Mars colony module",
      "on a lunar base",
      "in zero gravity environment",
      "in a space shuttle cockpit",
      "in a pressurized space laboratory",
      "on a deep space exploration vehicle"
    ];
    
    const lightingConditions = [
      "with emergency red lighting",
      "with standard white LED illumination",
      "with blue ambient lighting",
      "partially shadowed",
      "with overhead lighting",
      "with spotlight highlighting",
      "with dim backup lighting"
    ];
    
    const perspectiveAngles = [
      "front view",
      "top-down perspective",
      "side angle view",
      "close-up detailed view",
      "from operator's viewpoint",
      "with visible mounting hardware",
      "showing interface connections"
    ];
    
    // Pick random descriptors for variety
    const environment = environmentDescriptors[Math.floor(Math.random() * environmentDescriptors.length)];
    const lighting = lightingConditions[Math.floor(Math.random() * lightingConditions.length)];
    const perspective = perspectiveAngles[Math.floor(Math.random() * perspectiveAngles.length)];
    
    // Create a detailed prompt for the image generation
    const basePrompt = `Highly detailed photorealistic image of a ${component} ${environment}, ${lighting}, ${perspective}. Hyper-realistic, 8K, professional lighting, no text visible`;
    
    // For variety, sometimes add specific issues or conditions
    const includeIssue = Math.random() < 0.3; // 30% chance to include an issue
    let finalPrompt = basePrompt;
    
    if (includeIssue) {
      const issues = [
        "showing signs of wear",
        "with a minor malfunction indicator",
        "requiring calibration",
        "with warning light active",
        "with visible corrosion",
        "needing maintenance",
        "with error display visible"
      ];
      
      const issue = issues[Math.floor(Math.random() * issues.length)];
      finalPrompt += `, ${issue}`;
    }
    
    // Generate image using DALL-E (the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user)
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Save image to disk
    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image: No image URL returned");
    }
    
    // Download the image and save to local file
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Create a unique filename
    const timestamp = Date.now();
    const componentSlug = component.replace(/\s+/g, '_').toLowerCase();
    const filename = `falcon_synthetic_${componentSlug}_${timestamp}.png`;
    const filepath = path.join(process.cwd(), 'uploads', filename);
    
    // Save the image
    fs.writeFileSync(filepath, Buffer.from(imageBuffer));
    
    // Return image data
    return {
      url: `/uploads/${filename}`,
      filename,
      prompt: finalPrompt
    };
  } catch (error) {
    console.error(`Error generating image for ${component}:`, error);
    // Return a fallback image for demo purposes
    return {
      url: `/uploads/falcon_synthetic_fallback.png`,
      filename: "falcon_synthetic_fallback.png",
      prompt: `Synthetic image of ${component} (error: ${error instanceof Error ? error.message : String(error)})`
    };
  }
}

/**
 * Enhances YOLO detection results with space station context
 */
export function enhanceDetectionWithContext(detections: DetectedObject[]): DetectedObject[] {
  // Group objects by category
  const enhanced = detections.map(obj => {
    let context = "";
    let contextColor = "";
    
    // Determine context based on label
    if (SPACE_CATEGORIES.TOOLS.includes(obj.label as string)) {
      context = "TOOLS";
      contextColor = "#ff9800";
    } else if (SPACE_CATEGORIES.GAUGES.includes(obj.label as string)) {
      context = "GAUGES";
      contextColor = "#2196f3";
    } else if (SPACE_CATEGORIES.STRUCTURAL.includes(obj.label as string)) {
      context = "STRUCTURAL";
      contextColor = "#607d8b";
    } else if (SPACE_CATEGORIES.EMERGENCY.includes(obj.label as string)) {
      context = "EMERGENCY";
      contextColor = "#f44336";
    }
    
    return {
      ...obj,
      context,
      contextColor: contextColor || obj.color
    };
  });
  
  return enhanced;
}

/**
 * Generate component analysis using OpenAI (simulating Falcon AI)
 */
export async function generateComponentAnalysis(
  componentName: string, 
  detectedIssue: string, 
  detectedObjects: DetectedObject[] = []
): Promise<string> {
  try {
    // Create a system prompt for ASTRA assistant
    const systemPrompt = `You are ASTRA (Advanced Space Tools and Resource Assistant), an AI assistant specializing in space station systems. 
    Respond with technical but accessible information for trained astronauts about space station components, with the following format:
    
    1. Start with a brief (2-3 sentences) description of the component
    2. If an issue is detected, provide a concise troubleshooting section with 3-5 bullet points
    3. Include relevant technical specifications when appropriate
    4. Keep responses under 300 words, focused on practical information
    5. Use occasional emojis for emphasis (max 2-3)
    6. End with a concise "Recommended Action" section (1-2 sentences)
    
    Your tone should be professional, precise, and technically accurate. Focus on solutions, not problems.`;
    
    // Create a detailed prompt about the component and issue
    let userPrompt = `Provide information about the ${componentName} aboard the space station.`;
    
    if (detectedIssue) {
      userPrompt += ` The component appears to have an issue: "${detectedIssue}".`;
    }
    
    if (detectedObjects && detectedObjects.length > 0) {
      // Add context about other detected objects
      const otherObjects = detectedObjects
        .filter(obj => obj.label !== componentName)
        .map(obj => obj.label)
        .slice(0, 3); // Limit to 3 other objects for context
        
      if (otherObjects.length > 0) {
        userPrompt += ` This component was detected alongside: ${otherObjects.join(", ")}.`;
      }
    }
    
    // Use OpenAI to generate the response (the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0]?.message.content || "Analysis unavailable. Please try again.";
  } catch (error) {
    console.error("Error generating component analysis:", error);
    return `Error analyzing ${componentName}: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Helper function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}