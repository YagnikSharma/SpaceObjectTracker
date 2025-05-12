import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SyndetectLogo from "@/assets/syndetect-logo.jpg";

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Set loaded after a short delay to trigger animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col">
      {/* Video Background */}
      <div className="fixed inset-0 z-0 w-full h-screen">
        {/* Static background fallback */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d18] via-[#111827] to-[#0a101e]"></div>
        
        {/* Star background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-[10%] w-1 h-1 bg-blue-100 rounded-full"></div>
          <div className="absolute top-20 left-[25%] w-1.5 h-1.5 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[15%] left-[40%] w-1 h-1 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[40%] left-[10%] w-2 h-2 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[75%] left-[20%] w-1 h-1 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[30%] left-[80%] w-1.5 h-1.5 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[65%] left-[85%] w-1 h-1 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[10%] left-[75%] w-2 h-2 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[50%] left-[60%] w-1 h-1 bg-blue-100 rounded-full"></div>
          <div className="absolute top-[85%] left-[50%] w-1.5 h-1.5 bg-blue-100 rounded-full"></div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-7xl w-full mx-auto">
          <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-4"
              >
                <div className="inline-block mb-6 w-40 h-40 relative">
                  <img 
                    src={SyndetectLogo} 
                    alt="Syndetect Logo" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold mb-6"
              >
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Syndetect
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-xl md:text-2xl text-blue-300/80 max-w-3xl mx-auto mb-10"
              >
                Advanced space station equipment monitoring system powered by artificial intelligence
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <Link href="/home">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 rounded-lg text-lg font-medium">
                    Launch Detection System
                  </Button>
                </Link>
              </motion.div>
            </section>
            
            {/* Features Section */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<span className="text-4xl">🧰</span>}
                color="from-yellow-400 to-orange-500"
                title="Toolbox Detection"
                description="Instantly identify and track toolboxes in the space station environment with precision targeting."
              />
              
              <FeatureCard 
                icon={<span className="text-4xl">🧯</span>}
                color="from-red-400 to-red-600"
                title="Fire Extinguisher Monitoring"
                description="Critical safety equipment detection ensures fire extinguishers are always precisely located."
              />
              
              <FeatureCard 
                icon={<span className="text-4xl">💨</span>}
                color="from-blue-400 to-cyan-500"
                title="Oxygen Tank Tracking"
                description="Never lose track of oxygen tanks with our advanced visual recognition system."
              />
            </motion.section>
            
            {/* Mission Statement */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Our Mission
              </h2>
              
              <p className="text-lg text-blue-300/80 max-w-4xl mx-auto">
                Syndetect was designed to enhance astronaut safety and efficiency by providing
                real-time object detection for critical equipment. With our AI-powered ASTROSCAN assistant,
                astronauts can quickly locate vital tools and receive immediate guidance for any detected issues.
              </p>
            </motion.section>
            
            {/* Space Station Animation */}
            <div className="relative h-32 md:h-40">
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  x: ['-100%', '100%'],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="relative h-full flex items-center">
                  <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                  <span className="text-6xl">🛰️</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-md py-6 border-t border-blue-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-400/70 text-sm">
              © {new Date().getFullYear()} Syndetect Space Systems
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/home">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20">
                  Detection System
                </Button>
              </Link>
              <Link href="/mission-control">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20">
                  Mission Control
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, color, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card/30 backdrop-blur-md border border-blue-900/30 p-6 rounded-xl overflow-hidden relative hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-500/50 group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
      
      <div className="relative">
        <div className="mb-4 flex justify-center">
          <div className={`bg-gradient-to-r ${color} p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center text-blue-100">{title}</h3>
        <p className="text-blue-300/80 text-center">{description}</p>
      </div>
    </Card>
  );
}