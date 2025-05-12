import { useLocation } from "wouter";

export function StarryBackground() {
  const [location] = useLocation();
  
  // Don't show the background on the landing page
  if (location === "/") {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
      {/* Dark space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#04101c] to-[#0a2a43]"></div>
      
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/60 via-[#0a2a43]/40 to-[#000000]/90"></div>
    </div>
  );
}