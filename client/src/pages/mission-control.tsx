import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { DetectedObject } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

// Advanced type definitions for our API responses
interface DetectionSummary {
  id: number;
  timestamp: string;
  imageUrl: string;
  totalObjects: number;
  categories: Record<string, number>;
  averageConfidence: number;
  issues: {
    component: string;
    issue: string;
    confidence: number;
  }[];
  highestConfidenceObject: DetectedObject | null;
}

interface DetectionHistoryResponse {
  success: boolean;
  count: number;
  detections: DetectionSummary[];
}

interface DetailedDetection {
  id: number;
  timestamp: string;
  imageUrl: string;
  objects: DetectedObject[];
  chatHistory: {
    id: number;
    detectionId: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }[];
}

interface DetectionDetailResponse {
  success: boolean;
  detection: DetailedDetection;
}

export default function MissionControl() {
  const [location, setLocation] = useLocation();
  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Fetch detection history from the database
  const { 
    data: historyData, 
    isLoading: isHistoryLoading,
    error: historyError 
  } = useQuery<DetectionHistoryResponse>({ 
    queryKey: ['/api/mission-control/history'],
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Fetch detailed detection data when a detection is selected
  const { 
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError
  } = useQuery<DetectionDetailResponse>({
    queryKey: [`/api/mission-control/detection/${selectedDetectionId}`],
    enabled: !!selectedDetectionId,
  });
  
  // Handle errors
  useEffect(() => {
    if (historyError) {
      console.error("History error:", historyError);
      toast({
        title: "Error loading detection history",
        description: "Failed to load detection data from the server",
        variant: "destructive"
      });
    }
    
    if (detailError) {
      console.error("Detail error:", detailError);
      toast({
        title: "Error loading detection details",
        description: "Failed to load the detailed detection information",
        variant: "destructive"
      });
    }
  }, [historyError, detailError, toast]);
  
  // Format the detection history data
  const detectionHistory = historyData?.detections || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex flex-col text-white relative overflow-hidden">
      {/* Background with stars effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0e17]"></div>
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 5 + 5}s infinite ${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <header className="relative z-10 bg-[#1a1f2c]/70 backdrop-blur-md border-b border-[#2a3348] shadow-lg">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Syndetect
                  </h1>
                  <p className="text-xs text-blue-300/80">Mission Control Center</p>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Detection Hub
              </Link>
              <Link href="/mission-control" className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Mission Control
              </Link>
              <Link href="/galactic-map" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Galactic Map
              </Link>
              <Link href="/archives" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Stellar Archives
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Mission Control</h2>
            <p className="text-blue-300/70">
              Track your space detection history and mission statistics
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-blue-300 font-medium">Total Scans</h3>
              <span className="p-2 bg-blue-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {isHistoryLoading ? '-' : detectionHistory.length}
              </span>
              <div className="flex items-center mt-2 text-xs text-blue-300/60">
                <span className="bg-green-500/20 text-green-500 rounded-full px-1.5 py-0.5 mr-1.5">+2</span>
                <span>from last week</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-blue-300 font-medium">Objects Detected</h3>
              <span className="p-2 bg-purple-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {isHistoryLoading ? '-' : detectionHistory.reduce((sum, det) => sum + det.totalObjects, 0)}
              </span>
              <div className="flex items-center mt-2 text-xs text-blue-300/60">
                <span className="bg-green-500/20 text-green-500 rounded-full px-1.5 py-0.5 mr-1.5">+9</span>
                <span>from last week</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-blue-300 font-medium">Detection Accuracy</h3>
              <span className="p-2 bg-cyan-500/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {isHistoryLoading ? '-' : detectionHistory.length > 0 
                  ? `${Math.round(detectionHistory.reduce((sum, det) => sum + det.averageConfidence, 0) / detectionHistory.length * 100)}%` 
                  : '0%'}
              </span>
              <div className="flex items-center mt-2 text-xs text-blue-300/60">
                <span className="bg-green-500/20 text-green-500 rounded-full px-1.5 py-0.5 mr-1.5">+5%</span>
                <span>improvement</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-4 border-b border-[#2a3348] flex justify-between items-center">
            <h3 className="text-lg font-medium text-blue-300">Detection History</h3>
            <button className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors">
              View All
            </button>
          </div>

          {isHistoryLoading ? (
            <div className="p-8 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300/70">Loading detection history...</p>
            </div>
          ) : detectionHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-300 mb-2">No Detections Found</h3>
              <p className="text-blue-300/70 mb-4">
                Start capturing space station images to build your detection history.
              </p>
              <Button
                onClick={() => setLocation('/')}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
              >
                Start New Detection
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#151a25]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Objects
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3348]/30">
                  {detectionHistory.map((detection) => (
                    <tr key={detection.id} className="hover:bg-[#2a3348]/10 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 rounded-lg bg-[#2a3348]/50 overflow-hidden">
                          <div 
                            className="w-full h-full bg-cover bg-center" 
                            style={{ 
                              backgroundImage: `url(${detection.imageUrl})`,
                              filter: 'brightness(0.9)' 
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-300">
                        {formatDate(detection.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs rounded-lg bg-yellow-500/20 text-yellow-300">
                          {detection.totalObjects} objects
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(detection.categories).map(([category, count]) => (
                            <span 
                              key={category} 
                              className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-300"
                              title={`${category}: ${count} objects`}
                            >
                              {category} ({count})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-[#2a3348] rounded-full mr-2">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full" 
                              style={{ width: `${detection.averageConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-blue-300">{Math.round(detection.averageConfidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-300 hover:text-yellow-200"
                              onClick={() => setSelectedDetectionId(detection.id)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[900px] bg-[#1a1f2c] border-[#2a3348] text-blue-100">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-blue-100">
                                Detection #{detection.id} - {formatDate(detection.timestamp)}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {isDetailLoading ? (
                              <div className="py-10 flex flex-col items-center">
                                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-blue-300/70">Loading detection details...</p>
                              </div>
                            ) : detailData?.detection ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Detection image */}
                                <div className="bg-black/40 rounded-lg overflow-hidden">
                                  <img 
                                    src={detailData.detection.imageUrl} 
                                    alt={`Detection #${detailData.detection.id}`} 
                                    className="w-full h-auto object-contain"
                                  />
                                </div>
                                
                                {/* Detection details */}
                                <div className="space-y-4">
                                  <div className="bg-[#242b3d]/50 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-300 mb-2">Objects Detected</h4>
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                                      {detailData.detection.objects.map((obj, index) => (
                                        <div key={index} className="flex justify-between items-center bg-[#2a3348]/50 rounded p-2">
                                          <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: obj.color || '#3b82f6' }}></span>
                                            <span>{obj.label}</span>
                                          </div>
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                            {Math.round(obj.confidence * 100)}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {detailData.detection.chatHistory.length > 0 && (
                                    <div className="bg-[#242b3d]/50 rounded-lg p-4">
                                      <h4 className="font-medium text-yellow-300 mb-2">Analysis History</h4>
                                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                        {detailData.detection.chatHistory.map((msg) => (
                                          <div 
                                            key={msg.id} 
                                            className={`p-3 rounded-lg text-sm ${
                                              msg.role === 'user' 
                                                ? 'bg-blue-600/20 text-blue-100' 
                                                : 'bg-yellow-500/10 text-yellow-100'
                                            }`}
                                          >
                                            <div className="font-semibold mb-1">
                                              {msg.role === 'user' ? 'You' : 'ASTROSCAN Assistant'}:
                                            </div>
                                            <div>{msg.content}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => window.open(`/api/export-pdf/${detailData.detection.id}`, '_blank')}
                                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Export PDF
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-300"
                                      onClick={() => {
                                        setLocation(`/?detectionId=${detailData.detection.id}`);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      Chat with ASTROSCAN
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-8 text-center">
                                <p className="text-red-400">Failed to load detection details</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="relative z-10 bg-[#1a1f2c]/70 backdrop-blur-md border-t border-[#2a3348] py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-blue-300/70 mb-4 sm:mb-0 flex items-center">
            <span className="mr-2">🚀</span>
            <p className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              POWERED BY SYNDETECT AI
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/mission-control" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">👨‍🚀</span> Mission Control
            </Link>
            <Link href="/galactic-map" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">🌌</span> Galactic Map
            </Link>
            <Link href="/archives" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">📚</span> Stellar Archives
            </Link>
          </div>
        </div>
      </footer>

      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}