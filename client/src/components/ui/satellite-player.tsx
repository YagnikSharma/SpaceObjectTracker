import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SatellitePlayerProps {
  className?: string;
}

export function SatellitePlayer({ className = "" }: SatellitePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<string | null>(null);
  
  // Define video sources in different formats
  const videoFormats = [
    {
      type: "video/mp4",
      src: "/satellite-feed.mp4"
    },
    {
      type: "video/webm",
      src: "/satellite-feed.webm"
    },
    {
      type: "video/ogg",
      src: "/satellite-feed.ogv"
    },
    {
      type: "video/x-matroska",
      src: "/satellite-feed.mkv"
    }
  ];
  
  useEffect(() => {
    // Attempt to detect the best supported format
    const video = document.createElement('video');
    
    for (const format of videoFormats) {
      if (video.canPlayType(format.type)) {
        setCurrentFormat(format.src);
        break;
      }
    }
    
    // Cleanup
    return () => {
      video.remove();
    };
  }, []);
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-blue-300/80">Loading satellite feed...</p>
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full relative"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onLoadedData={() => setIsLoaded(true)}
        >
          {videoFormats.map((format, index) => (
            <source key={index} src={format.src} type={format.type} />
          ))}
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay with technical HUD elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full p-2 flex items-center justify-between text-xs text-blue-300 bg-gradient-to-b from-black/80 to-transparent">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1"></span>
              LIVE FEED
            </span>
            <span className="font-mono">SAT-ID: KOS-0994</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          
          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent text-xs text-blue-300 font-mono">
            <div className="flex justify-between">
              <span>LAT: 28.4° N</span>
              <span>LONG: 80.6° W</span>
              <span>ALT: 408 KM</span>
              <span>V: 27,600 KM/H</span>
            </div>
            
            {/* Format indicator */}
            <div className="mt-1 text-right text-[10px] text-blue-400/70">
              FORMAT: {currentFormat?.split('.').pop()?.toUpperCase() || 'AUTO'}
            </div>
          </div>
          
          {/* Scanning overlay effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-full">
              <div className="w-full h-[2px] bg-blue-400/30 absolute animate-scan"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}