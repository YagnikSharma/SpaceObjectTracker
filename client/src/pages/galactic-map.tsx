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
        imageUrl: "https://stsci-opo.org/STScI-01G8H49Z5K1HGKVT64AYZEG8DY.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01GK2KMYS2JYST8YW2KTQY3ZXT.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01G77PB54JD1D218PG476W6D7M.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01G8H15NQKF8HKXESJYGPJ6H7A.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01G7DDBW1BQYSDNJHJGQCP8ZTZ.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01G8H1B5GTFJCYYAC42T3NACEH.png",
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
        imageUrl: "https://stsci-opo.org/STScI-01G97DZCC51T4H1YV4J9BHR78H.png",
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
                  <p className="text-xs text-blue-300/80">Galactic Map Explorer</p>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Detection Hub
              </Link>
              <Link href="/mission-control" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Mission Control
              </Link>
              <Link href="/galactic-map" className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
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