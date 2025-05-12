import { useState, useEffect, useRef } from 'react';

interface SatellitePlayerProps {
  className?: string;
}

export function SatellitePlayer({ className }: SatellitePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(err => {
        setError('Failed to autoplay video feed');
        console.error('Autoplay failed:', err);
      });
    };
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load satellite feed');
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-blue-400 text-sm">Loading satellite feed...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay
      >
        <source src="/satellite-feed.webm" type="video/webm" />
        <source src="/satellite-feed.mp4" type="video/mp4" />
        <source src="/satellite-feed.ogv" type="video/ogg" />
        Your browser doesn't support HTML5 video playback.
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
            FORMAT: AUTO
          </div>
        </div>
        
        {/* Scanning overlay effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-full">
            <div className="w-full h-[2px] bg-blue-400/30 absolute animate-scan"></div>
          </div>
        </div>
      </div>
    </div>
  );
}