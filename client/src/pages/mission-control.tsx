import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface Detection {
  id: number;
  imageUrl: string;
  timestamp: string;
  objectCount: number;
  highestConfidence: number;
}

export default function MissionControl() {
  const [detectionHistory, setDetectionHistory] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, we would fetch this from the backend
    // Here we're simulating data for the UI demonstration
    const mockHistory: Detection[] = [
      {
        id: 1,
        imageUrl: '/uploads/sample-space-1.jpg',
        timestamp: '2025-05-09T04:32:18Z',
        objectCount: 3,
        highestConfidence: 0.92
      },
      {
        id: 2,
        imageUrl: '/uploads/sample-space-2.jpg',
        timestamp: '2025-05-08T14:27:43Z',
        objectCount: 5,
        highestConfidence: 0.88
      },
      {
        id: 3,
        imageUrl: '/uploads/sample-space-3.jpg',
        timestamp: '2025-05-07T09:15:11Z',
        objectCount: 2,
        highestConfidence: 0.76
      },
      {
        id: 4,
        imageUrl: '/uploads/sample-space-4.jpg',
        timestamp: '2025-05-06T22:04:37Z',
        objectCount: 7,
        highestConfidence: 0.94
      },
      {
        id: 5,
        imageUrl: '/uploads/sample-space-5.jpg',
        timestamp: '2025-05-05T11:51:09Z',
        objectCount: 4,
        highestConfidence: 0.85
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setDetectionHistory(mockHistory);
      setIsLoading(false);
    }, 800);
  }, []);

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
              <Link href="/">
                <a className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Galactic Cop
                    </h1>
                    <p className="text-xs text-blue-300/80">Mission Control Center</p>
                  </div>
                </a>
              </Link>
            </motion.div>

            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <a className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                  Detection Hub
                </a>
              </Link>
              <Link href="/mission-control">
                <a className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Mission Control
                </a>
              </Link>
              <Link href="/galactic-map">
                <a className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                  Galactic Map
                </a>
              </Link>
              <Link href="/archives">
                <a className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                  Stellar Archives
                </a>
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
                {isLoading ? '-' : detectionHistory.length}
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
                {isLoading ? '-' : detectionHistory.reduce((sum, det) => sum + det.objectCount, 0)}
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
                {isLoading ? '-' : '87%'}
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

          {isLoading ? (
            <div className="p-8 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-300/70">Loading detection history...</p>
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
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Action
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
                              filter: 'hue-rotate(140deg) brightness(0.9)' 
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-300">
                        {formatDate(detection.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-300">
                          {detection.objectCount} objects
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-[#2a3348] rounded-full mr-2">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                              style={{ width: `${detection.highestConfidence * 100}%` }}
                            />
                          </div>
                          <span className="text-blue-300">{Math.round(detection.highestConfidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors">
                          View
                        </button>
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
              POWERED BY TECH TITANS
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">👨‍🚀</span> Mission Control
            </a>
            <a href="#" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">🛡️</span> Privacy
            </a>
            <a href="#" className="text-blue-300/70 hover:text-blue-300 transition-colors text-sm flex items-center">
              <span className="mr-1">📜</span> Terms
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}