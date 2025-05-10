import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "@shared/schema";

export interface ChatCompletionResponse {
  id: string;
  content: string;
}

export async function getChatCompletion(
  message: string,
  detectedObjects: DetectedObject[]
): Promise<ChatCompletionResponse> {
  try {
    // Add a small delay to show loading state (ensures good UX)
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Make API call to backend
    const response = await apiRequest('POST', '/api/chat', {
      message,
      detectedObjects
    });
    
    // Parse response
    const data = await response.json();
    
    // Get content from OpenAI response formats
    let content = '';
    if (data.choices && data.choices.length > 0) {
      // Standard OpenAI API response format
      content = data.choices[0].message.content;
    } else if (data.content) {
      // Our simplified response format
      content = data.content;
    } else {
      throw new Error("Invalid response format from the API");
    }
    
    return {
      id: data.id || crypto.randomUUID(),
      content: content
    };
  } catch (error) {
    console.error("Chat completion error:", error);
    throw new Error(`Failed to get chat completion: ${error instanceof Error ? error.message : String(error)}`);
  }
}
