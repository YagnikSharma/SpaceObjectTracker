import OpenAI from "openai";
import { DetectedObject } from "@shared/schema";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || ""
});

// Interface for chat completion response
interface ChatCompletionResponse {
  id: string;
  content: string;
}

/**
 * Generate a chat completion based on user message and detected objects
 * @param message User message
 * @param detectedObjects Array of detected space objects
 * @returns Chat completion response
 */
export async function generateChatCompletion(
  message: string,
  detectedObjects: DetectedObject[]
): Promise<ChatCompletionResponse> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    // Create a system message with information about detected objects
    const objectsSummary = detectedObjects.map(obj => 
      `- ${obj.label} (confidence: ${(obj.confidence * 100).toFixed(0)}%, location: x=${obj.x.toFixed(2)}, y=${obj.y.toFixed(2)}, dimensions: w=${obj.width.toFixed(2)}, h=${obj.height.toFixed(2)})`
    ).join('\n');

    const systemMessage = `You are a helpful assistant specializing in space object detection and analysis. 
The user has uploaded an image that has been analyzed, and the following objects were detected:

${objectsSummary}

Provide detailed, accurate information about these space objects based on the user's questions. 
Your responses should be informative and educational, focusing on the detected objects and their characteristics.
If asked about an object that wasn't detected, politely inform the user that such object was not found in the image.`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemMessage 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
    });

    return {
      id: response.id,
      content: response.choices[0].message.content || "I couldn't generate a response at this time."
    };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error(`Failed to generate chat completion: ${error instanceof Error ? error.message : String(error)}`);
  }
}
