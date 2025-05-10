import { DetectedObject } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Function to enhance detected objects with contextual information
export async function enhanceObjectsWithContext(
  detectedObjects: DetectedObject[]
): Promise<DetectedObject[]> {
  return Promise.all(
    detectedObjects.map(async (obj) => {
      // If already has context, return as-is
      if (obj.context) return obj;
      
      // Basic context based on object label
      let context = "";
      let issue = "";
      
      switch (obj.label.toLowerCase()) {
        case "toolbox":
          context = "Maintenance equipment";
          break;
        case "oxygen tank":
          context = "Life support equipment";
          break;
        case "fire extinguisher":
          context = "Critical safety equipment";
          break;
        default:
          context = "Space station component";
      }
      
      // Generate additional context if confidence is low
      if (obj.confidence < 0.6) {
        issue = `Low confidence detection (${Math.round(obj.confidence * 100)}%). Verification recommended.`;
      }
      
      // Return enhanced object
      return {
        ...obj,
        context,
        issue: issue || obj.issue
      };
    })
  );
}

// Generate a component analysis using OpenAI if available
export async function generateComponentAnalysis(
  componentName: string,
  detectedIssue: string = "",
  detectedObjects: DetectedObject[] = []
): Promise<string> {
  // Basic analysis if OpenAI is not available
  if (!openai) {
    console.log("OpenAI API key not available, using basic component analysis");
    
    if (componentName.includes("fire extinguisher")) {
      return "Critical safety equipment. Used to extinguish fires in zero gravity environments. Regular inspection required.";
    } else if (componentName.includes("oxygen tank")) {
      return "Essential life support component. Provides breathable oxygen to the station. Monitor pressure levels regularly.";
    } else if (componentName.includes("toolbox")) {
      return "Contains tools for station maintenance and repairs. Inventory should be checked regularly to ensure all tools are accounted for.";
    } else {
      return "Space station component. Function unknown. Recommend further analysis by qualified personnel.";
    }
  }
  
  try {
    // Generate prompt for OpenAI
    const prompt = `
Provide a brief technical analysis (2-3 sentences) of the following space station component:
Component: ${componentName}
${detectedIssue ? `Detected issue: ${detectedIssue}` : ""}

Include:
1. Its primary function on the space station
2. Safety considerations
3. Maintenance requirements
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are ASTROSCAN, a technical assistant for space station equipment. Provide concise, technical analyses of space station components."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });
    
    return completion.choices[0].message.content || "Analysis unavailable.";
  } catch (error) {
    console.error("Error generating component analysis:", error);
    return "Analysis unavailable due to technical issues. Please try again later.";
  }
}