import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface MapSource {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  agency: string;
}

export default function GalacticMap() {
  const [mapSources, setMapSources] = useState<MapSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulating fetching NASA map data
    const nasaMaps: MapSource[] = [
      {
        id: 1,
        title: "Webb's First Deep Field",
        description: "NASA's James Webb Space Telescope has produced the deepest and sharpest infrared image of the distant universe to date. Known as Webb's First Deep Field, this image of galaxy cluster SMACS 0723 is overflowing with detail.",
        imageUrl: "https://www.nasa.gov/wp-content/uploads/2022/07/main_image_deep_field_smacs0723-5mb.jpg",
        link: "https://science.nasa.gov/missions/webb/webbs-first-images/",
        agency: "NASA/ESA/CSA/STScI"
      },
      {
        id: 2,
        title: "Pillars of Creation",
        description: "NASA's James Webb Space Telescope has captured a lush, highly detailed landscape – the iconic Pillars of Creation – where new stars are forming within dense clouds of gas and dust.",
        imageUrl: "https://stsci-opo.org/STScI-01GFKQRGABKJ6JZ9FKHQGW3YZVS.png",
        link: "https://science.nasa.gov/missions/webb/nasa-james-webb-space-telescope-just-revealed-universe-whole-new-light/",
        agency: "NASA/ESA/CSA/STScI"
      },
      {
        id: 3,
        title: "Hubble eXtreme Deep Field",
        description: "The Hubble eXtreme Deep Field (XDF) is an image of a small area of space in the center of the Hubble Ultra Deep Field, combining data from Hubble programs from 2002 to 2012.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1214a.jpg",
        link: "https://esahubble.org/images/heic1214a/",
        agency: "NASA/ESA/STScI"
      },
      {
        id: 4,
        title: "SKA Observatory Radio Telescope Map",
        description: "The Square Kilometre Array (SKA) is an intergovernmental radio telescope project being built in Australia and South Africa. When complete, it will be the world's largest radio telescope.",
        imageUrl: "https://www.skao.int/sites/default/files/styles/slider/public/2021-04/SKA-Low%20-%20night%20-%20SKAO.jpg",
        link: "https://www.skao.int/en",
        agency: "SKAO"
      },
      {
        id: 5,
        title: "NASA's Fermi Gamma-ray Space Telescope Sky Map",
        description: "This view from NASA's Fermi Gamma-ray Space Telescope is the deepest and best-resolved portrait of the gamma-ray sky to date.",
        imageUrl: "https://www.nasa.gov/wp-content/uploads/2013/10/635809main_fermi_5-year_sky.jpg",
        link: "https://www.nasa.gov/mission/fermi-gamma-ray-space-telescope/",
        agency: "NASA/DOE/Fermi LAT Collaboration"
      },
      {
        id: 6,
        title: "Planck Cosmic Microwave Background",
        description: "The most detailed map ever created of the cosmic microwave background – the relic radiation from the Big Bang.",
        imageUrl: "https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2013/03/planck_cmb/12583930-4-eng-GB/Planck_CMB.jpg",
        link: "https://www.esa.int/Science_Exploration/Space_Science/Planck",
        agency: "ESA/Planck Collaboration"
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setMapSources(nasaMaps);
      setIsLoading(false);
    }, 800);
  }, []);

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
                    <p className="text-xs text-blue-300/80">Galactic Map Explorer</p>
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
                <a className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                  Mission Control
                </a>
              </Link>
              <Link href="/galactic-map">
                <a className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
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
            <h2 className="text-2xl font-bold text-white mb-2">Galactic Map Reference</h2>
            <p className="text-blue-300/70">
              Explore various astronomical maps used by NASA and other space agencies to navigate and understand our universe
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-300">Loading galactic maps...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mapSources.map((map) => (
              <motion.div
                key={map.id}
                className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] overflow-hidden hover:border-blue-500/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: map.id * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={map.imageUrl} 
                    alt={map.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] to-transparent opacity-90"></div>
                  <div className="absolute bottom-2 left-3 right-3 text-xs text-blue-300/70">
                    <span className="bg-blue-900/50 px-2 py-1 rounded-md border border-blue-500/20">
                      {map.agency}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-blue-300 mb-2">{map.title}</h3>
                  <p className="text-blue-200/70 text-sm line-clamp-3 mb-3">
                    {map.description}
                  </p>
                  <a 
                    href={map.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                  >
                    <span>View Source</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          className="mt-12 bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-medium text-blue-300 mb-4">
            About NASA's Astronomical Maps and Resources
          </h3>
          <p className="text-blue-200/70 mb-4">
            NASA and various space agencies deploy advanced telescopes and sensors to map our universe across different spectrums - from radio waves to gamma rays. These maps help scientists understand the composition, history, and future of our cosmos.
          </p>
          <p className="text-blue-200/70 mb-4">
            The images and data displayed here are sourced from official NASA, ESA, and other space agency repositories. These maps represent different aspects of the universe, from the cosmic microwave background radiation (the oldest light in the universe) to detailed galaxy surveys.
          </p>
          <div className="flex items-center justify-center mt-6">
            <a 
              href="https://science.nasa.gov/astrophysics/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 transition-all hover:from-blue-500 hover:to-purple-500"
            >
              Explore More NASA Resources
            </a>
          </div>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}