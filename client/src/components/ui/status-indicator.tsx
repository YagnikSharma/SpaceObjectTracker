import React from 'react';

interface StatusIndicatorProps {
  isOnline?: boolean;
  text?: string;
}

export function StatusIndicator({ 
  isOnline = true, 
  text = isOnline ? 'System Online' : 'System Offline' 
}: StatusIndicatorProps) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full flex items-center ${
      isOnline 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
      {text}
    </span>
  );
}