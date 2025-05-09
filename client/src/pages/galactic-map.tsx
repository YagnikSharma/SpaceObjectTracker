import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface MapSource {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  agency: string;
  facts?: string[];
  scientificData?: {
    wavelength?: string;
    distance?: string;
    discoveryDate?: string;
    size?: string;
  };
}

export default function GalacticMap() {
  const [mapSources, setMapSources] = useState<MapSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState<MapSource | null>(null);
  const [detailPosition, setDetailPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // NASA and space agencies map data
    const nasaMaps: MapSource[] = [
      {
        id: 1,
        title: "Webb's First Deep Field",
        description: "NASA's James Webb Space Telescope has produced the deepest and sharpest infrared image of the distant universe to date. Known as Webb's First Deep Field, this image of galaxy cluster SMACS 0723 is overflowing with detail.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-first-deep-field-smacs-0723.png",
        link: "https://science.nasa.gov/missions/webb/webbs-first-images/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "This image covers a patch of sky approximately the size of a grain of sand held at arm's length.",
          "The combined mass of this galaxy cluster acts as a gravitational lens, magnifying much more distant galaxies behind it.",
          "Some of the galaxies shown are seen as they were more than 13 billion years ago, shortly after the Big Bang."
        ],
        scientificData: {
          wavelength: "Infrared",
          distance: "4.6 billion light-years (cluster)",
          discoveryDate: "July 12, 2022",
          size: "Approximately 2 arcminutes"
        }
      },
      {
        id: 2,
        title: "Pillars of Creation",
        description: "NASA's James Webb Space Telescope has captured a lush, highly detailed landscape – the iconic Pillars of Creation – where new stars are forming within dense clouds of gas and dust.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-pillars-of-creation.png",
        link: "https://science.nasa.gov/missions/webb/nasa-james-webb-space-telescope-just-revealed-universe-whole-new-light/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "The pillars are actually columns of cool interstellar gas and dust that are incubators for new stars.",
          "The tallest pillar in this image is about 4 light-years long, roughly the distance from our Sun to the next nearest star.",
          "The reddish lava-like areas are ejections from stars that are still forming."
        ],
        scientificData: {
          wavelength: "Near and mid-infrared",
          distance: "6,500 light-years",
          discoveryDate: "October 19, 2022 (Webb), First imaged by Hubble in 1995",
          size: "Approximately 5-light-years tall"
        }
      },
      {
        id: 3,
        title: "Hubble eXtreme Deep Field",
        description: "The Hubble eXtreme Deep Field (XDF) is an image of a small area of space in the center of the Hubble Ultra Deep Field, combining data from Hubble programs from 2002 to 2012.",
        imageUrl: "https://cdn.spacetelescope.org/archives/images/screen/heic1214a.jpg",
        link: "https://esahubble.org/images/heic1214a/",
        agency: "NASA/ESA/STScI",
        facts: [
          "This image contains approximately 5,500 galaxies.",
          "The faintest galaxies are one ten-billionth the brightness of what the human eye can see.",
          "This represents a view of the universe that reaches back about 13.2 billion years."
        ],
        scientificData: {
          wavelength: "Ultraviolet, visible, and near-infrared",
          distance: "13.2 billion light-years (farthest objects)",
          discoveryDate: "September 25, 2012",
          size: "2.3 arcminutes"
        }
      },
      {
        id: 4,
        title: "Carina Nebula by Webb Telescope",
        description: "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-carina-nebula.png",
        link: "https://science.nasa.gov/missions/webb/nasas-webb-delivers-deepest-infrared-image-universe-yet/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "The 'mountains' in this image are actually the edge of a nearby stellar nursery called NGC 3324.",
          "The tallest 'peaks' in this image are about 7 light-years high.",
          "This nebula appears to be a gigantic gaseous cavity with the appearance of a cliff-like structure."
        ],
        scientificData: {
          wavelength: "Near-infrared",
          distance: "7,600 light-years",
          discoveryDate: "July 12, 2022",
          size: "Approximately 8 light-years wide (visible portion)"
        }
      },
      {
        id: 5,
        title: "Southern Ring Nebula",
        description: "The Southern Ring Nebula is a planetary nebula – an expanding cloud of gas surrounding a dying star. Webb revealed previously hidden details in this colorful display.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-southern-ring-nebula.png",
        link: "https://science.nasa.gov/missions/webb/webbs-first-images/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "This nebula is nearly half a light-year in diameter.",
          "Webb's observations revealed for the first time that the star that created this nebula was part of a binary system.",
          "The gases expelled by the dying star form concentric layers that record its periodic ejections."
        ],
        scientificData: {
          wavelength: "Near and mid-infrared",
          distance: "2,000 light-years",
          discoveryDate: "July 12, 2022 (Webb image)",
          size: "0.4 light-years in diameter"
        }
      },
      {
        id: 6,
        title: "Planck Cosmic Microwave Background",
        description: "The most detailed map ever created of the cosmic microwave background – the relic radiation from the Big Bang.",
        imageUrl: "https://cdn.sci.esa.int/documents/36233/36291/1567214818447-Planck_CMB_2018_1237.jpg",
        link: "https://www.esa.int/Science_Exploration/Space_Science/Planck",
        agency: "ESA/Planck Collaboration",
        facts: [
          "This map shows temperature fluctuations that correspond to regions of slightly different densities in the early universe.",
          "These tiny fluctuations in temperature were imprinted on the sky when the universe was just 380,000 years old.",
          "The patterns in this map led to the formation of galaxies."
        ],
        scientificData: {
          wavelength: "Microwave",
          distance: "13.8 billion light-years (edge of observable universe)",
          discoveryDate: "March 21, 2013 (final map in 2018)",
          size: "Full sky survey"
        }
      },
      {
        id: 7,
        title: "WASP-96 b Atmospheric Spectrum",
        description: "Webb's detailed observation of this hot, puffy exoplanet revealed the presence of specific gas molecules based on tiny decreases in the brightness of precise colors of light.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-wasp-96b-spectrum.png",
        link: "https://science.nasa.gov/missions/webb/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "WASP-96 b is a gas giant planet that orbits a Sun-like star about 1,150 light-years away.",
          "This spectrum revealed the unambiguous signature of water, evidence of clouds, and haze in the atmosphere.",
          "The planet is much puffier than any in our solar system, with a diameter 1.2 times Jupiter's but less than half its mass."
        ],
        scientificData: {
          wavelength: "Near-infrared spectroscopy",
          distance: "1,150 light-years",
          discoveryDate: "July 12, 2022 (Webb observation)",
          size: "Approximately 1.2x Jupiter diameter"
        }
      },
      {
        id: 8,
        title: "Stephan's Quintet",
        description: "Webb captured this group of five galaxies that appear close to each other in the sky: two in the middle of merging, with the others distorted by their gravitational interactions.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/09/webb-stephans-quintet.png",
        link: "https://science.nasa.gov/missions/webb/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "This compact group of galaxies was discovered in 1877, the first compact galaxy group ever discovered.",
          "Four of the five galaxies are locked in a cosmic dance of repeated close encounters.",
          "The image reveals never-before-seen details of how interacting galaxies trigger star formation in each other."
        ],
        scientificData: {
          wavelength: "Near and mid-infrared",
          distance: "290 million light-years",
          discoveryDate: "July 12, 2022 (Webb image)",
          size: "Approximately 500,000 light-years across"
        }
      },
      {
        id: 9,
        title: "Cartwheel Galaxy",
        description: "Webb's powerful infrared vision captured this detailed image of the Cartwheel and two smaller companion galaxies against a backdrop of many other galaxies.",
        imageUrl: "https://science.nasa.gov/wp-content/uploads/2023/10/webb-cartwheel-galaxy-miri-nircam-4500.png",
        link: "https://www.nasa.gov/image-feature/goddard/2022/nasas-webb-captures-cartwheel-galaxys-cosmic-dance/",
        agency: "NASA/ESA/CSA/STScI",
        facts: [
          "The Cartwheel Galaxy got its shape from a high-speed collision with another smaller galaxy about 400 million years ago.",
          "The collision caused two ring-like structures to expand outward from the galaxy's center like ripples in a pond.",
          "The outer ring has been expanding for about 440 million years and contains many star-forming regions."
        ],
        scientificData: {
          wavelength: "Near and mid-infrared",
          distance: "500 million light-years",
          discoveryDate: "August 2, 2022 (Webb image)",
          size: "Approximately 150,000 light-years in diameter"
        }
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setMapSources(nasaMaps);
      setIsLoading(false);
    }, 800);
  }, []);

  // Handle clicking on a map card
  const handleMapClick = (map: MapSource, event: React.MouseEvent) => {
    // Set the selected map data
    setSelectedMap(map);
    
    // Calculate position for the detail window
    // Try to keep it in the viewport by checking mouse position
    const x = event.clientX;
    const y = event.clientY;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // If click is on the right side of the screen, show popup to the left
    // If click is on the bottom half of the screen, show popup above
    const posX = x > viewportWidth / 2 ? x - 400 : x + 50;
    const posY = y > viewportHeight / 2 ? y - 300 : y + 50;
    
    setDetailPosition({ x: posX, y: posY });
  };

  // Close the detail window
  const closeDetail = () => {
    setSelectedMap(null);
  };

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
      
      {/* Floating Detail Window */}
      <AnimatePresence>
        {selectedMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed z-50 w-96 backdrop-blur-md rounded-xl border shadow-lg overflow-hidden"
            style={{ 
              left: `${detailPosition.x}px`, 
              top: `${detailPosition.y}px`,
              transformOrigin: "center center"
            }}
          >
            <div className="dark:bg-[#1a1f2c]/90 bg-card/90 backdrop-blur-md border dark:border-[#2a3348] border-border">
              <div className="p-4 border-b dark:border-[#2a3348] border-border flex justify-between items-center">
                <h3 className="text-lg font-medium dark:text-blue-300 text-blue-600">{selectedMap.title}</h3>
                <button 
                  onClick={closeDetail}
                  className="w-6 h-6 rounded-full dark:bg-blue-900/50 bg-yellow-500/20 flex items-center justify-center dark:hover:bg-blue-900/80 hover:bg-yellow-500/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img 
                    src={selectedMap.imageUrl} 
                    alt={selectedMap.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {selectedMap.scientificData && (
                  <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                    {selectedMap.scientificData.wavelength && (
                      <div className="dark:bg-blue-900/20 bg-yellow-500/10 p-2 rounded-md">
                        <span className="dark:text-blue-300 text-blue-700 font-medium">Wavelength:</span>
                        <p className="dark:text-blue-100/80 text-foreground/80">{selectedMap.scientificData.wavelength}</p>
                      </div>
                    )}
                    {selectedMap.scientificData.distance && (
                      <div className="dark:bg-blue-900/20 bg-blue-500/10 p-2 rounded-md">
                        <span className="dark:text-blue-300 text-blue-700 font-medium">Distance:</span>
                        <p className="dark:text-blue-100/80 text-foreground/80">{selectedMap.scientificData.distance}</p>
                      </div>
                    )}
                    {selectedMap.scientificData.discoveryDate && (
                      <div className="dark:bg-blue-900/20 bg-blue-500/10 p-2 rounded-md">
                        <span className="dark:text-blue-300 text-blue-700 font-medium">Discovered:</span>
                        <p className="dark:text-blue-100/80 text-foreground/80">{selectedMap.scientificData.discoveryDate}</p>
                      </div>
                    )}
                    {selectedMap.scientificData.size && (
                      <div className="dark:bg-blue-900/20 bg-blue-500/10 p-2 rounded-md">
                        <span className="dark:text-blue-300 text-blue-700 font-medium">Size:</span>
                        <p className="dark:text-blue-100/80 text-foreground/80">{selectedMap.scientificData.size}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedMap.facts && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium dark:text-blue-300 text-blue-700 mb-2">Fascinating Facts</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm dark:text-blue-100/80 text-foreground/80">
                      {selectedMap.facts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-center mt-2">
                  <a 
                    href={selectedMap.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 dark:bg-blue-500/20 bg-blue-500/20 dark:hover:bg-blue-500/30 hover:bg-blue-500/30 rounded-lg dark:text-blue-300 text-blue-700 transition-colors inline-flex items-center"
                  >
                    <span>View on {selectedMap.agency.split('/')[0]}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <p className="text-xs dark:text-blue-300/80 text-blue-700/90">Galactic Map Explorer</p>
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
              <Link href="/galactic-map" className="px-3 py-2 rounded-lg dark:bg-blue-500/20 bg-blue-500/20 dark:text-blue-300 text-blue-700 dark:border-blue-500/30 border-blue-500/30 border">
                Galactic Map
              </Link>
              <Link href="/archives" className="px-3 py-2 rounded-lg dark:text-blue-300/80 text-blue-700/80 hover:text-blue-300 dark:hover:bg-blue-600/20 hover:bg-blue-500/20 transition-colors">
                Stellar Archives
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
            <h2 className="text-2xl font-bold dark:text-white text-blue-700 mb-2">Galactic Map Reference</h2>
            <p className="dark:text-blue-300/70 text-blue-700/80">
              Explore various astronomical maps used by NASA and other space agencies to navigate and understand our universe
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 dark:border-blue-600 border-blue-600 dark:border-t-transparent border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 dark:text-blue-300 text-blue-700">Loading galactic maps...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mapSources.map((map) => (
              <motion.div
                key={map.id}
                className="dark:bg-[#1a1f2c]/70 bg-card/70 backdrop-blur-md rounded-xl dark:border-[#2a3348] border-border border overflow-hidden dark:hover:border-blue-500/50 hover:border-blue-500/50 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: map.id * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={(e) => handleMapClick(map, e)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={map.imageUrl} 
                    alt={map.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t dark:from-[#0a0e17] from-background to-transparent opacity-90"></div>
                  <div className="absolute bottom-2 left-3 right-3 text-xs">
                    <span className="dark:bg-blue-900/50 bg-blue-500/20 px-2 py-1 rounded-md dark:border-blue-500/20 border-blue-500/30 border dark:text-blue-300/70 text-blue-700/90">
                      {map.agency}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium dark:text-blue-300 text-blue-700 mb-2">{map.title}</h3>
                  <p className="dark:text-blue-200/70 text-foreground/80 text-sm line-clamp-3 mb-3">
                    {map.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <a 
                      href={map.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm dark:bg-blue-500/20 bg-blue-500/20 dark:hover:bg-blue-500/30 hover:bg-blue-500/30 rounded-lg dark:text-blue-300 text-blue-700 transition-colors"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering card click
                    >
                      <span>Source</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    <button 
                      className="px-3 py-1.5 text-sm dark:bg-blue-500/20 bg-blue-500/20 dark:hover:bg-blue-500/30 hover:bg-blue-500/30 rounded-lg dark:text-blue-300 text-blue-700 transition-colors inline-flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMapClick(map, e);
                      }}
                    >
                      <span>Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          className="mt-12 dark:bg-[#1a1f2c]/70 bg-card/70 backdrop-blur-md rounded-xl dark:border-[#2a3348] border-border border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-medium dark:text-blue-300 text-blue-700 mb-4">
            About NASA's Astronomical Maps and Resources
          </h3>
          <p className="dark:text-blue-200/70 text-foreground/80 mb-4">
            NASA and various space agencies deploy advanced telescopes and sensors to map our universe across different spectrums - from radio waves to gamma rays. These maps help scientists understand the composition, history, and future of our cosmos.
          </p>
          <p className="dark:text-blue-200/70 text-foreground/80 mb-4">
            The images and data displayed here are sourced from official NASA, ESA, and other space agency repositories. These maps represent different aspects of the universe, from the cosmic microwave background radiation (the oldest light in the universe) to detailed galaxy surveys.
          </p>
          <div className="flex items-center justify-center mt-6">
            <a 
              href="https://science.nasa.gov/astrophysics/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 from-blue-500 to-blue-600 rounded-lg text-white font-medium shadow-lg dark:shadow-blue-500/10 shadow-blue-500/10 hover:shadow-blue-500/30 dark:hover:shadow-blue-500/30 transition-all dark:hover:from-blue-500 dark:hover:to-purple-500 hover:from-blue-400 hover:to-blue-700"
            >
              Explore More NASA Resources
            </a>
          </div>
        </motion.div>
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
            <Link href="/archives" className="dark:text-blue-300/70 text-blue-700/70 dark:hover:text-blue-300 hover:text-blue-700 transition-colors text-sm flex items-center">
              <span className="mr-1">🔭</span> Stellar Archives
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
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}