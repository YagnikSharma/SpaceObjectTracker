import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/ui/file-uploader";
import { ResultsDisplay } from "@/components/ui/results-display";
import { DetectedObject } from "@shared/schema";
import { ChatInterface, ChatMessage } from "@/components/ui/chat-interface";
import { FeedbackForm } from "@/components/ui/feedback-form";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useChat } from "@/hooks/use-chat";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { SatellitePlayer } from "@/components/ui/satellite-player";
import SyndetectLogo from "@/assets/syndetect-logo.jpg";

// Navigation links
const NAV_LINKS = [
  { name: "Home", href: "/", icon: "" },
  { name: "Detection Hub", href: "/detection-hub", icon: "" },
  { name: "Mission Control", href: "/mission-control", icon: "" },
  { name: "Galactic Map", href: "/galactic-map", icon: "" },
  { name: "Stellar Archives", href: "/archives", icon: "" }
];

export default function Home() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("detection"); // detection, analysis, or feedback
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
    <div className="min-h-screen bg-background flex flex-col text-foreground relative overflow-hidden">
      {/* Static Background with Stars */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        {/* Dark space gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d18] via-[#111827] to-[#0a101e]"></div>
        
        {/* Star background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-5 left-[5%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-15 left-[15%] w-1.5 h-1.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-[10%] left-[30%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
          <div className="absolute top-[25%] left-[8%] w-2 h-2 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '7s' }}></div>
          <div className="absolute top-[50%] left-[12%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '4.5s' }}></div>
          <div className="absolute top-[20%] left-[75%] w-1.5 h-1.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '5.5s' }}></div>
          <div className="absolute top-[45%] left-[80%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '6.5s' }}></div>
          <div className="absolute top-[8%] left-[65%] w-2 h-2 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '3.5s' }}></div>
          <div className="absolute top-[35%] left-[55%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
          <div className="absolute top-[65%] left-[40%] w-1.5 h-1.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-[75%] left-[70%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-[85%] left-[25%] w-1.5 h-1.5 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '5s' }}></div>
          <div className="absolute top-[90%] left-[60%] w-1 h-1 bg-blue-100 rounded-full animate-pulse" style={{ animationDuration: '7s' }}></div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/60 via-[#0a0e17]/40 to-[#0a0e17]/90"></div>
      </div>

      {/* Floating Space Station UI Element */}
      <motion.div 
        className="absolute top-20 right-10 h-32 w-32 hidden lg:block z-10 pointer-events-none"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, 2, 0, -2, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-4xl">🛰️</span>
          </div>
        </div>
      </motion.div>

      {/* Header with glass effect */}
      <header className="relative z-10 bg-card/70 backdrop-blur-md border-b border-border shadow-lg">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 relative rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(59,130,246,0.25)]">
                <img 
                  src={SyndetectLogo} 
                  alt="Syndetect Logo" 
                  className="w-full h-full object-contain antialiased transform scale-95" 
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Syndetect
                </h1>
                <p className="text-xs text-blue-300/80">Space Station Monitoring System</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                    location === link.href 
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                      : 'hover:bg-[#2a3348]/70 hover:text-blue-300'
                  }`}
                >
                  {link.icon && <span>{link.icon}</span>}
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Status, Theme Toggle, and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <span className={`text-xs px-2.5 py-1 rounded-full flex items-center ${
                isApiConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${isApiConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isApiConnected ? 'System Online' : 'System Offline'}
              </span>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden bg-card/80 p-2 rounded-lg hover:bg-muted/90 transition-colors border border-border"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="flex flex-col space-y-1 pb-2">
                  {NAV_LINKS.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={`px-4 py-3 rounded-lg flex items-center space-x-3 ${
                        location === link.href 
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' 
                          : 'hover:bg-[#2a3348]/70 hover:text-blue-300'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon && <span className="text-xl">{link.icon}</span>}
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content with Floating Islands */}
      <main className="flex-grow relative z-10">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {/* Content Tabs */}
          <div className="flex mb-6 bg-card/50 backdrop-blur-md rounded-xl p-1 border border-border/50 w-full sm:w-auto overflow-x-auto">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'detection' 
                  ? 'bg-primary text-primary-foreground dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('detection')}
            >
              Object Detection
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'analysis' 
                  ? 'bg-primary text-primary-foreground dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              AI Analysis
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'feedback' 
                  ? 'bg-primary text-primary-foreground dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('feedback')}
            >
              Model Feedback
            </button>
          </div>

          {/* Floating Islands Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {activeTab === 'detection' && (
              <>
                {/* Left Island - Upload & Results */}
                <motion.div 
                  className="w-full lg:w-7/12 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  key="detection-left"
                >
                  <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h2 className="text-md font-semibold ml-2 text-primary dark:text-blue-300">Detection Control Center</h2>
                      </div>
                    </div>
                    <div className="p-4">
                      <FileUploader 
                        onFileSelect={setSelectedFile} 
                        onProcessImage={processImage}
                        isLoading={isUploading}
                        isProcessed={isProcessed}
                        setIsProcessed={setIsProcessed}
                      />
                    </div>
                  </div>
                  
                  <ResultsDisplay 
                    isLoading={isUploading}
                    imageUrl={imageUrl}
                    detectedObjects={detectedObjects}
                    error={uploadError}
                    onRetry={resetUpload}
                  />
                </motion.div>
                
                {/* Right Island - Chat Interface */}
                <motion.div 
                  className="w-full lg:w-5/12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  key="detection-right"
                >
                  <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg h-full overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <h2 className="text-md font-semibold ml-2 text-primary dark:text-blue-300">ASTROSCAN - Space Analysis Assistant</h2>
                      </div>
                    </div>
                    <ChatInterface 
                      messages={messages}
                      isLoading={isLoadingResponse}
                      detectedObjects={detectedObjects}
                      onSendMessage={sendMessage}
                    />
                  </div>
                </motion.div>
              </>
            )}
            
            {activeTab === 'analysis' && (
              <motion.div 
                className="w-full space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                key="analysis"
              >
                <div className="bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <h2 className="text-md font-semibold ml-2 text-primary dark:text-blue-300">Advanced Space Station Analysis</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Satellite Feed Player */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-blue-500/30 overflow-hidden">
                      <div className="p-3 border-b border-blue-500/30 bg-blue-500/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: "300ms" }}></div>
                          <h3 className="text-sm font-medium text-blue-300">LIVE SATELLITE FEED (4 FORMATS)</h3>
                        </div>
                      </div>
                      <div className="h-[200px] md:h-[300px]">
                        <SatellitePlayer className="w-full h-full" />
                      </div>
                    </div>
                    
                    <ChatInterface 
                      messages={messages}
                      isLoading={isLoadingResponse}
                      detectedObjects={detectedObjects}
                      onSendMessage={sendMessage}
                      fullView={true}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'feedback' && (
              <motion.div 
                className="w-full space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                key="feedback"
              >
                <FeedbackForm detectedObjects={detectedObjects} />
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer with glass effect */}
      <footer className="relative z-10 bg-card/70 backdrop-blur-md border-t border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0 flex items-center">
            <span className="mr-2">🚀</span>
            <p className="font-semibold bg-gradient-to-r from-primary to-primary/70 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
              POWERED BY SYNDETECT AI
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/mission-control" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center">
              <span className="mr-1">🛰️</span> Mission Control
            </Link>
            <Link href="/galactic-map" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center">
              <span className="mr-1">🪐</span> Galactic Map
            </Link>
            <Link href="/archives" className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center">
              <span className="mr-1">🔭</span> Stellar Archives
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary dark:bg-blue-400 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{ 
              y: [null, Math.random() * 100 + "%"],
              opacity: [null, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.3]
            }}
            transition={{ 
              duration: Math.random() * 20 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ 
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              boxShadow: "0 0 3px 1px rgba(100, 200, 255, 0.2)" // Subtle glow for particles
            }}
          />
        ))}
      </div>
    </div>
  );
}