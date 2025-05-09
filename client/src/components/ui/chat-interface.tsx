import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DetectedObject } from "./results-display";

// Helper function to format space station responses with bulletpoints and links
function formatSpaceStationResponse(text: string): string {
  if (!text) return "";
  
  // Convert URLs to actual links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let formattedText = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors">$1</a>');
  
  // Add classes to bullet points for better styling
  formattedText = formattedText.replace(/^(•|⚠️|🛠️|🔧|🛑|⚙️|📊|🧰|🔩|🧲|🔌|🔋|📡|🚨|⚡) (.*)/gm, 
    '<div class="flex"><span class="mr-2 text-xl">$1</span><span class="flex-1">$2</span></div>');
    
  // Add specific styling for bullet point sections
  formattedText = formattedText.replace(/^## (.*)/gm, '<h3 class="text-lg font-semibold text-blue-300 mt-3 mb-2">$1</h3>');
  formattedText = formattedText.replace(/^# (.*)/gm, '<h2 class="text-xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-3">$1</h2>');
  
  // Style NASA documentation references
  formattedText = formattedText.replace(/NASA documentation:/gi, 
    '<span class="block mt-3 text-sm font-medium text-blue-400">NASA Documentation:</span>');
  
  // Handle emergency protocols with special styling
  formattedText = formattedText.replace(/EMERGENCY PROTOCOL:/gi, 
    '<div class="mt-3 mb-2 text-red-400 font-bold">⚠️ EMERGENCY PROTOCOL:</div>');
  
  // Add top spacing to sections that start with the word "Technical" to keep specifications grouped
  formattedText = formattedText.replace(/(Technical Specifications:)/g, 
    '<div class="mt-3 font-medium text-blue-300">$1</div>');
  
  return formattedText;
}

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
  fullView?: boolean;
}

export function ChatInterface({ messages, isLoading, detectedObjects, onSendMessage, fullView = false }: ChatInterfaceProps) {
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat message area with space theme */}
      <div 
        className={`flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400/30 scrollbar-track-transparent p-4 space-y-4 ${
          fullView ? 'min-h-[500px]' : ''
        }`} 
        id="chat-messages"
      >
        {/* Welcome message if no messages exist */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-300 mb-2">
                {fullView ? 'ASTROSCAN - Space Station Analysis Assistant' : 'Space Station Assistant'}
              </h3>
              <p className="dark:text-blue-200/60 text-yellow-700/80 text-sm max-w-md">
                "Hello! I'm Astroscan, your AI assistant for space station analysis. Upload an image, and I'll help you detect flaws and spot what needs fixing — fast and smart."
              </p>
            </div>

            {detectedObjects.length > 0 ? (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-300 text-sm">
                <p className="font-semibold mb-1">Suggested questions:</p>
                <ul className="text-left list-disc list-inside space-y-1 text-blue-300/80">
                  <li>Tell me about this {detectedObjects[0].label} and how to maintain it</li>
                  <li>What's the emergency protocol for a damaged {detectedObjects[0].label}?</li>
                  {detectedObjects[0].issue ? (
                    <li>How do I fix the "{detectedObjects[0].issue}" issue?</li>
                  ) : (
                    <li>What are common issues with a {detectedObjects[0].label}?</li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="text-blue-300/50 text-sm italic">
                Waiting for image analysis...
              </div>
            )}
          </div>
        )}

        {/* Actual chat messages */}
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex items-start ${
              message.role === "user" ? "justify-end" : "justify-start"
            } space-x-2`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
            )}
            
            <div 
              className={`rounded-xl px-4 py-3 max-w-[85%] ${
                message.role === "user" 
                  ? "bg-blue-600/20 border border-blue-500/30 text-blue-200" 
                  : "bg-gradient-to-br from-[#1a1f2c]/80 to-[#242B3E]/80 border border-blue-500/20 text-blue-100"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="space-station-response">
                  <div 
                    className="whitespace-pre-wrap space-y-2"
                    dangerouslySetInnerHTML={{ 
                      __html: formatSpaceStationResponse(message.content) 
                    }} 
                  />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="bg-gradient-to-br from-[#1a1f2c]/80 to-[#242B3E]/80 border border-blue-500/20 text-blue-300 rounded-xl px-4 py-3 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input area with space theme */}
      <div className="p-4 border-t border-[#2a3348]">
        <form className="flex items-center space-x-3" onSubmit={handleSubmit}>
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={detectedObjects.length === 0 
                ? "Upload a space station image to start the conversation..." 
                : `Ask about the detected ${detectedObjects[0]?.label || "components"}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || detectedObjects.length === 0}
              className={`w-full py-2.5 px-4 pr-10 bg-[#1a1f2c]/60 border border-[#2a3348] hover:border-blue-500/30 focus:border-blue-500/50 focus:ring-0 focus:outline-none rounded-lg transition-colors placeholder-blue-300/50 text-blue-200 ${
                detectedObjects.length === 0 ? 'cursor-not-allowed opacity-60' : ''
              }`}
            />
            {detectedObjects.length === 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || detectedObjects.length === 0}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${
              isLoading || !input.trim() || detectedObjects.length === 0
                ? 'bg-blue-500/20 text-blue-400/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        
        {/* No powered by text */}
      </div>
    </div>
  );
}
