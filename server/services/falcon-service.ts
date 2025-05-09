import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { DetectedObject } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Space station specific tools and components
const SPACE_STATION_ELEMENTS = {
  TOOLS: [
    "EVA toolkit", "torque wrench", "power drill", "multimeter", 
    "air quality monitor", "electronic screwdriver", "pressure gauge", 
    "soldering iron", "wire cutters", "oxygen analyzer"
  ],
  GAUGES: [
    "oxygen level gauge", "pressure gauge", "temperature gauge", 
    "radiation detector", "humidity sensor", "air flow meter",
    "carbon dioxide monitor", "power consumption meter", "battery level indicator"
  ],
  STRUCTURAL: [
    "airlock", "hatch seal", "window panel", "solar panel connector", 
    "air filtration unit", "water recycling system", "electrical panel", 
    "communication module", "life support system", "thermal control unit"
  ],
  EMERGENCY: [
    "emergency oxygen supply", "fire extinguisher", "emergency exit sign", 
    "first aid kit", "emergency communication device", "handrail", 
    "safety tether anchor", "emergency lighting", "evacuation procedure panel"
  ]
};

// Maps for detected issues and solutions
const COMMON_ISSUES: Record<string, string[]> = {
  "oxygen level gauge": [
    "reading below acceptable range",
    "fluctuating readings",
    "display malfunction",
    "calibration error"
  ],
  "pressure gauge": [
    "pressure drop detected",
    "unstable pressure readings",
    "gauge glass cracked",
    "pressure exceeding normal levels"
  ],
  "temperature gauge": [
    "temperature spike detected",
    "sensor failure",
    "inconsistent readings",
    "below operational threshold"
  ],
  "airlock": [
    "seal deterioration",
    "pressure equalization failure",
    "control panel malfunction",
    "emergency override failure"
  ],
  "hatch seal": [
    "micrometeor damage",
    "seal decompression",
    "thermal expansion issues",
    "air leakage detected"
  ],
  "air filtration unit": [
    "filter saturation",
    "reduced flow efficiency",
    "contaminant detection",
    "power supply interruption"
  ]
};

// Educational resources and reference links
const REFERENCE_LINKS: Record<string, string> = {
  "EVA toolkit": "https://www.nasa.gov/spacewalk/tools/",
  "oxygen level gauge": "https://www.nasa.gov/feature/goddard/2019/life-support-system",
  "pressure gauge": "https://www.nasa.gov/feature/facts-and-figures-international-space-station-environmental-control-and-life-support-system",
  "air filtration unit": "https://www.nasa.gov/feature/technologies-for-air-revitalization",
  "airlock": "https://www.nasa.gov/feature/space-station-airlock",
  "hatch seal": "https://www.nasa.gov/feature/facts-figures-iss-spacecraft-structures",
  "life support system": "https://www.nasa.gov/feature/nasa-selects-new-technologies-for-development-for-deep-space-exploration",
  "solar panel": "https://www.nasa.gov/feature/goddard/2017/technique-for-handling-electricity-on-silicon-chips",
  "thermal control unit": "https://www.nasa.gov/feature/thermal-vacuum-testing-completed-on-deep-space-atomic-clock",
  "radiation detector": "https://www.nasa.gov/feature/goddard/2019/nasa-s-radiation-challenge-for-artemis"
};

/**
 * Uses OpenAI's API to generate a detailed analysis of a space station component
 * with bullet points and emergency information
 */
export async function generateComponentAnalysis(
  component: string, 
  detectedIssue?: string,
  detectedObjects?: DetectedObject[]
): Promise<string> {
  try {
    // If no specific component is mentioned, base response on detected objects
    if (!component && detectedObjects && detectedObjects.length > 0) {
      // Find most relevant space station components in detected objects
      const relevantComponents = detectedObjects
        .map(obj => obj.label)
        .filter(label => {
          return Object.values(SPACE_STATION_ELEMENTS).some(category => 
            category.some(item => label.toLowerCase().includes(item.toLowerCase()))
          );
        });
      
      if (relevantComponents.length > 0) {
        component = relevantComponents[0];
      } else {
        // Default to a generic space station component from the list
        const allComponents = [
          ...SPACE_STATION_ELEMENTS.TOOLS,
          ...SPACE_STATION_ELEMENTS.GAUGES,
          ...SPACE_STATION_ELEMENTS.STRUCTURAL,
          ...SPACE_STATION_ELEMENTS.EMERGENCY
        ];
        component = allComponents[Math.floor(Math.random() * allComponents.length)];
      }
    }

    // Determine if component has common issues
    let issue = detectedIssue;
    if (!issue && component) {
      const componentLower = component.toLowerCase();
      for (const [key, issues] of Object.entries(COMMON_ISSUES)) {
        if (componentLower.includes(key)) {
          issue = issues[Math.floor(Math.random() * issues.length)];
          break;
        }
      }
    }

    // Find any matching reference links
    let referenceLink = "";
    if (component) {
      const componentLower = component.toLowerCase();
      for (const [key, link] of Object.entries(REFERENCE_LINKS)) {
        if (componentLower.includes(key)) {
          referenceLink = link;
          break;
        }
      }
    }

    // Generate a prompt for the model based on this information
    const prompt = `You are ASTRA (Advanced Space Tools and Resource Assistant), onboard a space station.
    
Generate a concise technical analysis for the space station component: "${component}" ${issue ? `with a detected issue: "${issue}"` : ""}.

Your analysis must:
1. Start with a brief component overview (max 1 sentence)
2. List 3-4 key technical specifications in bullet points with emoji indicators
3. ${issue ? `Provide a structured emergency response protocol for the "${issue}" issue` : "List potential common issues to monitor"}
4. Include a short maintenance reminder
${referenceLink ? `5. Reference NASA documentation: ${referenceLink}` : ""}

Format your response with bullet points, technical specifications, and use appropriate emojis for each point. Keep the entire response under 300 words and highly technical yet accessible for trained astronauts.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are ASTRA (Advanced Space Tools and Resource Assistant), a technical support AI for astronauts on a space station." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating component analysis:", error);
    return `⚠️ Error analyzing ${component || "component"}.\n\n• Please try again or contact mission control.\n• Current diagnostics unavailable.\n• System status: limited functionality`;
  }
}

/**
 * Simulates generating synthetic training images for space station tools and gauges
 * In a real application, this would connect to Falcon AI to generate these images
 */
export async function generateSyntheticTrainingImages(
  category: keyof typeof SPACE_STATION_ELEMENTS, 
  count: number = 5
): Promise<string[]> {
  // In a real implementation, this would use Falcon AI to generate synthetic images
  // For now, we'll simulate this by returning paths to placeholder images
  
  const imagesDir = path.join(process.cwd(), 'uploads');
  
  // Ensure the directory exists
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // For demonstration, just create synthetic image paths
  const imagePaths: string[] = [];
  const items = SPACE_STATION_ELEMENTS[category];

  for (let i = 0; i < count; i++) {
    const selectedItem = items[Math.floor(Math.random() * items.length)];
    const imagePath = path.join(imagesDir, `synthetic_${category.toLowerCase()}_${selectedItem.replace(/\s+/g, '_')}_${i}.jpg`);
    
    // In a real implementation, we would save the Falcon AI-generated image
    // For now, just log that we would generate this image
    console.log(`Would generate synthetic training image: ${imagePath}`);
    
    imagePaths.push(imagePath);
  }
  
  return imagePaths;
}

/**
 * Falcon integration to enhance detected objects with space station context
 */
export function enhanceDetectionWithContext(
  detectedObjects: DetectedObject[]
): DetectedObject[] {
  // Add space station specific context to detected objects
  return detectedObjects.map(obj => {
    // Add space station specific information based on the object type
    let enhancedObj = { ...obj };
    
    // Check if the object matches any of our space station categories
    for (const [category, items] of Object.entries(SPACE_STATION_ELEMENTS)) {
      for (const item of items) {
        if (obj.label.toLowerCase().includes(item.toLowerCase())) {
          enhancedObj.context = category;
          
          // Find matching keys for issues
          const matchingIssueKey = Object.keys(COMMON_ISSUES).find(key => 
            item.toLowerCase().includes(key.toLowerCase())
          );
          
          if (matchingIssueKey && COMMON_ISSUES[matchingIssueKey]) {
            const issues = COMMON_ISSUES[matchingIssueKey];
            const randomIssue = issues[Math.floor(Math.random() * issues.length)];
            enhancedObj.issue = randomIssue;
          }
          
          // Find matching keys for references
          const matchingRefKey = Object.keys(REFERENCE_LINKS).find(key => 
            item.toLowerCase().includes(key.toLowerCase())
          );
          
          if (matchingRefKey && REFERENCE_LINKS[matchingRefKey]) {
            enhancedObj.referenceLink = REFERENCE_LINKS[matchingRefKey];
          }
          
          break;
        }
      }
    }
    
    return enhancedObj;
  });
}

// Export SPACE_STATION_ELEMENTS directly
export { SPACE_STATION_ELEMENTS };

export default {
  generateComponentAnalysis,
  generateSyntheticTrainingImages,
  enhanceDetectionWithContext,
  SPACE_STATION_ELEMENTS
};