import React, { useState, useEffect } from 'react';
import { ModelUploadForm } from '../components/model-upload-form';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface TrainingStats {
  imageCount: number;
  labelCount: number;
  classDistribution: Record<string, number>;
  isModelTrained: boolean;
  targetClasses: string[];
}

export default function ModelManagement() {
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch training stats
    const fetchTrainingStats = async () => {
      try {
        const response = await fetch('/api/training-stats');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch training stats');
        }
        
        setTrainingStats(data);
      } catch (err) {
        console.error('Error fetching training stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrainingStats();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-[#0a0e17] flex flex-col text-foreground dark:text-white relative overflow-hidden">
      {/* Background with stars effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-background dark:bg-[#0a0e17]"></div>
        {/* Stars */}
        {[...Array(100)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-primary-foreground dark:bg-white"
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

      <header className="relative z-10 dark:bg-[#1a1f2c]/70 bg-card/70 backdrop-blur-md dark:border-[#2a3348] border-border border-b shadow-lg">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r dark:from-blue-500 dark:to-purple-600 from-blue-400 to-blue-600 p-2 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r dark:from-blue-400 dark:to-purple-500 from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Syndetect
                  </h1>
                  <p className="text-xs dark:text-blue-300/80 text-blue-700/90">Model Management</p>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="px-3 py-2 rounded-lg dark:text-blue-300/80 text-blue-700/80 hover:text-blue-300 dark:hover:bg-blue-600/20 hover:bg-blue-500/20 transition-colors">
                Detection Hub
              </Link>
              <Link href="/mission-control" className="px-3 py-2 rounded-lg dark:text-blue-300/80 text-blue-700/80 hover:text-blue-300 dark:hover:bg-blue-600/20 hover:bg-blue-500/20 transition-colors">
                Mission Control
              </Link>
              <Link href="/galactic-map" className="px-3 py-2 rounded-lg dark:text-blue-300/80 text-blue-700/80 hover:text-blue-300 dark:hover:bg-blue-600/20 hover:bg-blue-500/20 transition-colors">
                Galactic Map
              </Link>
              <Link href="/model-management" className="px-3 py-2 rounded-lg dark:bg-blue-500/20 bg-blue-500/20 dark:text-blue-300 text-blue-700 dark:border-blue-500/30 border-blue-500/30 border">
                Model Management
              </Link>
            </nav>
            
            {/* Theme toggle button */}
            <div className="dark:bg-blue-500/30 bg-blue-500/30 p-1.5 rounded-lg border dark:border-blue-400/50 border-blue-500/50">
              <button
                onClick={() => {
                  const html = document.documentElement;
                  const isDark = html.classList.contains('dark');
                  if (isDark) {
                    // Switch to light mode
                    html.classList.remove('dark');
                    localStorage.setItem('syndetect-theme', 'light');
                  } else {
                    // Switch to dark mode
                    html.classList.add('dark');
                    localStorage.setItem('syndetect-theme', 'dark');
                  }
                }}
                className="flex items-center justify-center w-8 h-8 rounded-md dark:hover:bg-blue-600/20 hover:bg-blue-600/20 dark:text-white text-blue-800"
                aria-label="Toggle theme"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block dark:hidden">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              </button>
            </div>
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
            <h2 className="text-2xl font-bold dark:text-white text-blue-700 mb-2">AI Model Management</h2>
            <p className="dark:text-blue-300/70 text-blue-700/80">
              Upload your custom trained YOLOv8 model for space object detection
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Model Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ModelUploadForm />
          </motion.div>

          {/* Training Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="dark:bg-[#1a1f2c]/70 bg-card/70 backdrop-blur-md rounded-xl dark:border-[#2a3348] border-border border p-6"
          >
            <h3 className="text-xl font-medium dark:text-blue-300 text-blue-700 mb-4">
              Model Status
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 dark:border-blue-600 border-blue-600 dark:border-t-transparent border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 dark:text-blue-300 text-blue-700">Loading model status...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">Error: {error}</p>
              </div>
            ) : trainingStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Model Status</p>
                    <div className="mt-2 flex items-center">
                      <div className={`w-3 h-3 rounded-full ${trainingStats.isModelTrained ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
                      <p className="text-lg font-semibold dark:text-white">
                        {trainingStats.isModelTrained ? 'Active' : 'Not Loaded'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Training Images</p>
                    <p className="text-lg font-semibold dark:text-white mt-2">
                      {trainingStats.imageCount}
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">Target Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {trainingStats.targetClasses.map((className) => (
                      <div key={className} className="px-3 py-1 bg-blue-600/20 dark:bg-blue-800/40 rounded-full text-sm">
                        <span className="text-blue-800 dark:text-blue-300">{className}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {Object.keys(trainingStats.classDistribution).length > 0 && (
                  <div className="bg-blue-500/10 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-3">Training Distribution</p>
                    <div className="space-y-2">
                      {Object.entries(trainingStats.classDistribution).map(([className, count]) => (
                        <div key={className} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="dark:text-blue-200">{className}</span>
                            <span className="dark:text-blue-300 font-semibold">{count}</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (count / trainingStats.labelCount) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    <strong>Instructions:</strong> Upload your trained YOLOv8 model file (.pt format) to integrate it with the Syndetect system. Ensure your model is trained to detect toolbox, fire extinguisher, and oxygen tank objects.
                  </p>
                </div>
              </div>
            ) : (
              <p className="dark:text-gray-400 text-gray-500">No model data available</p>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 dark:bg-[#1a1f2c]/70 bg-card/70 backdrop-blur-md dark:border-[#2a3348] border-border border-t py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm dark:text-blue-300/70 text-blue-700/70 mb-4 sm:mb-0 flex items-center">
            <span className="mr-2">🚀</span>
            <p className="font-semibold bg-gradient-to-r dark:from-blue-400 dark:to-purple-500 from-blue-500 to-blue-600 bg-clip-text text-transparent">
              POWERED BY SYNDETECT AI
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/mission-control" className="dark:text-blue-300/70 text-blue-700/70 dark:hover:text-blue-300 hover:text-blue-700 transition-colors text-sm flex items-center">
              <span className="mr-1">🛰️</span> Mission Control
            </Link>
            <Link href="/galactic-map" className="dark:text-blue-300/70 text-blue-700/70 dark:hover:text-blue-300 hover:text-blue-700 transition-colors text-sm flex items-center">
              <span className="mr-1">🪐</span> Galactic Map
            </Link>
            <Link href="/model-management" className="dark:text-blue-300/70 text-blue-700/70 dark:hover:text-blue-300 hover:text-blue-700 transition-colors text-sm flex items-center">
              <span className="mr-1">🧠</span> Model Management
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