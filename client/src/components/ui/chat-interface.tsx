import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DetectedObject } from "./results-display";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  detectedObjects: DetectedObject[];
  onSendMessage: (message: string) => void;
}

export function ChatInterface({ messages, isLoading, detectedObjects, onSendMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card className="overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <div className="border-b border-neutral-200 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-800">AI Assistant</h2>
          <button className="text-neutral-400 hover:text-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        <p className="text-neutral-500 text-sm">Ask about detected objects or get help with analysis</p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4" id="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex items-start ${
              message.role === "user" ? "justify-end" : ""
            } space-x-2`}
          >
            <div 
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === "user" 
                  ? "bg-neutral-100 text-neutral-800" 
                  : "bg-primary-100 text-neutral-800"
              }`}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="bg-primary-100 text-neutral-800 rounded-lg p-3 max-w-[80%] flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "100ms" }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-200 p-4">
        <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Ask about the detection results..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || detectedObjects.length === 0}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim() || detectedObjects.length === 0}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-md p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-xs text-neutral-400">Powered by GPT</span>
        </div>
      </div>
    </Card>
  );
}
