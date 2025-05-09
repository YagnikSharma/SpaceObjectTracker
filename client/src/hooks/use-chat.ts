import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./use-toast";
import { getChatCompletion } from "@/lib/openai";
import { ChatMessage } from "@/components/ui/chat-interface";
import { DetectedObject } from "@/components/ui/results-display";

interface UseChatOptions {
  detectedObjects: DetectedObject[];
}

export function useChat({ detectedObjects }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: "Hello! I'm your space object detection assistant. Upload an image to get started, and I can help you analyze the results."
    }
  ]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessageId = uuidv4();
    const userMessage: ChatMessage = { id: userMessageId, role: "user", content };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);

    try {
      // Send to API and get response
      const response = await getChatCompletion(content, detectedObjects);
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: response.id || uuidv4(),
        role: "assistant",
        content: response.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get response from assistant",
        variant: "destructive"
      });
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to the server. Please try again later."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  }, [detectedObjects, toast]);

  return {
    messages,
    isLoadingResponse,
    sendMessage
  };
}
