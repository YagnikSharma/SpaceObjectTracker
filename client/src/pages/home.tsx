import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/ui/file-uploader";
import { ResultsDisplay, DetectedObject } from "@/components/ui/results-display";
import { ChatInterface, ChatMessage } from "@/components/ui/chat-interface";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useChat } from "@/hooks/use-chat";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();
  const [isApiConnected, setIsApiConnected] = useState(true);
  
  // File upload state and handlers
  const { 
    selectedFile, 
    imageUrl, 
    isUploading, 
    detectedObjects, 
    uploadError,
    isProcessed,
    setSelectedFile,
    setIsProcessed,
    processImage, 
    resetUpload
  } = useFileUpload();

  // Chat state and handlers
  const { 
    messages, 
    isLoadingResponse, 
    sendMessage 
  } = useChat({ detectedObjects });

  // Check API status on load
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await apiRequest('GET', '/api/status');
        setIsApiConnected(true);
      } catch (error) {
        setIsApiConnected(false);
        toast({
          title: "API Connection Issue",
          description: "Could not connect to the Falcon API. Some features may be limited.",
          variant: "destructive",
        });
      }
    };
    
    checkApiStatus();
  }, [toast]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-800 text-white shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl font-semibold">Space Object Detection</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${isApiConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full px-2 py-1 hidden sm:inline-block`}>
              {isApiConnected ? 'API Connected' : 'API Disconnected'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Upload & Results */}
        <div className="w-full lg:w-7/12 space-y-6">
          <FileUploader 
            onFileSelect={setSelectedFile} 
            onProcessImage={processImage}
            isLoading={isUploading}
            isProcessed={isProcessed}
            setIsProcessed={setIsProcessed}
          />
          
          <ResultsDisplay 
            isLoading={isUploading}
            imageUrl={imageUrl}
            detectedObjects={detectedObjects}
            error={uploadError}
            onRetry={resetUpload}
          />
        </div>
        
        {/* Right Panel - Chat Interface */}
        <div className="w-full lg:w-5/12">
          <ChatInterface 
            messages={messages}
            isLoading={isLoadingResponse}
            detectedObjects={detectedObjects}
            onSendMessage={sendMessage}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-neutral-400 mb-4 sm:mb-0">
            <p>Space Object Detection powered by Falcon API</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Help</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
