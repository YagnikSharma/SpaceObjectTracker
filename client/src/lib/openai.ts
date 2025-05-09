import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "@/components/ui/results-display";

export interface ChatCompletionResponse {
  id: string;
  content: string;
}

export async function getChatCompletion(
  message: string,
  detectedObjects: DetectedObject[]
): Promise<ChatCompletionResponse> {
  try {
    const response = await apiRequest('POST', '/api/chat', {
      message,
      detectedObjects
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to get chat completion: ${error instanceof Error ? error.message : String(error)}`);
  }
}
