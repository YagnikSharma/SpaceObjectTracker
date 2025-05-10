import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "./use-toast";
import { getChatCompletion } from "@/lib/openai";
import { ChatMessage } from "@/components/ui/chat-interface";
import { DetectedObject } from "@shared/schema";

interface UseChatOptions {
  detectedObjects: DetectedObject[];
}

export function useChat({ detectedObjects }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: "Hello! I'm ASTROSCAN, your space station analysis assistant. Upload an image to get started, and I can help you identify components and provide technical information."
    }
  ]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const { toast } = useToast();

  // When detected objects change, add a helpful message if objects are found
  useEffect(() => {
    if (detectedObjects.length > 0 && messages.length === 1) {
      // If objects were detected and we only have the welcome message, add a helpful prompt
      const objectLabels = detectedObjects.map(obj => obj.label);
      const uniqueObjectTypes = Array.from(new Set(objectLabels));
      
      let detectionMessage = "I've detected ";
      
      if (uniqueObjectTypes.length === 1) {
        detectionMessage += `a ${uniqueObjectTypes[0]} in your image.`;
      } else if (uniqueObjectTypes.length > 1) {
        const lastType = uniqueObjectTypes.pop();
        detectionMessage += `${uniqueObjectTypes.join(', ')} and ${lastType} in your image.`;
      } else {
        detectionMessage += "several objects in your image.";
      }
      
      const detectionTip = " You can ask me about maintenance procedures, technical specifications, or emergency protocols for these components.";
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: detectionMessage + detectionTip
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [detectedObjects, messages.length]);

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
        content: response.content || "I'm currently experiencing some technical difficulties. Please try again in a moment."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to get response from assistant",
        variant: "destructive"
      });
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to my knowledge database. Please try again later."
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
