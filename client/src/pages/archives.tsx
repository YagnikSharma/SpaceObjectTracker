import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface HubbleImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  captureDate: string;
  category: string;
}

export default function StellarArchives() {
  const [hubbleImages, setHubbleImages] = useState<HubbleImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    // NASA Hubble images data
    const hubbleData: HubbleImage[] = [
      {
        id: 1,
        title: "Hubble's View of the Horsehead Nebula",
        description: "This Hubble image captures the Horsehead Nebula (Barnard 33), a dark nebula in the constellation Orion. The nebula is estimated to be around 1,500 light-years from Earth.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1307a.jpg",
        captureDate: "2013-04-19",
        category: "nebula"
      },
      {
        id: 2,
        title: "The Veil Nebula",
        description: "The Veil Nebula, a supernova remnant in the constellation Cygnus, is the visible structure of a small portion of the Cygnus Loop. The entire loop covers about 3 degrees of the sky, corresponding to about 6 times the diameter of the full Moon.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1520a.jpg",
        captureDate: "2015-09-24",
        category: "nebula"
      },
      {
        id: 3,
        title: "The Eagle Nebula's Pillars of Creation",
        description: "The famous Pillars of Creation image shows towering columns of gas and dust in the Eagle Nebula (M16). These columns, or pillars, are where new stars are forming. The pillars are bathed in the scorching ultraviolet light from a cluster of young stars located just outside the frame.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1501a.jpg",
        captureDate: "2015-01-05",
        category: "nebula"
      },
      {
        id: 4,
        title: "The Bubble Nebula",
        description: "The Bubble Nebula (NGC 7635) is a cloud of gas and dust illuminated by the brilliant star within it. The star is much larger and more massive than our Sun, and near the end of its life it creates a stellar wind, which forms the bubble.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1608a.jpg",
        captureDate: "2016-04-21",
        category: "nebula"
      },
      {
        id: 5,
        title: "Messier 104 (The Sombrero Galaxy)",
        description: "The Sombrero Galaxy (M104) is a lenticular galaxy in the constellation Virgo. It has a bright nucleus, an unusually large central bulge, and a prominent dust lane in its inclined disk.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/opo0328a.jpg",
        captureDate: "2003-06-28",
        category: "galaxy"
      },
      {
        id: 6,
        title: "Whirlpool Galaxy (M51)",
        description: "The Whirlpool Galaxy, also known as Messier 51a, is an interacting grand-design spiral galaxy with a Seyfert 2 active galactic nucleus. It lies in the constellation Canes Venatici, and was the first galaxy to be classified as a spiral galaxy.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/potw1912a.jpg",
        captureDate: "2019-03-25",
        category: "galaxy"
      },
      {
        id: 7,
        title: "The Carina Nebula",
        description: "The Carina Nebula is a large, complex area of bright and dark nebulosity in the constellation Carina, and is located in the Carina–Sagittarius Arm. The nebula is approximately 8,500 light-years from Earth.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic0707a.jpg",
        captureDate: "2007-04-24",
        category: "nebula"
      },
      {
        id: 8,
        title: "Jupiter and Europa",
        description: "This image of Jupiter and its moon Europa was captured by the Hubble Space Telescope. Europa is thought to have a subsurface ocean of liquid water, making it a prime candidate for the search for extraterrestrial life in our Solar System.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1410a.jpg",
        captureDate: "2014-04-03",
        category: "planet"
      },
      {
        id: 9,
        title: "Saturn and Its Rings",
        description: "The Hubble Space Telescope captured this stunning image of Saturn and its rings. Saturn is the second-largest planet in our Solar System, after Jupiter, and is a gas giant composed mainly of hydrogen and helium.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/potw2031a.jpg",
        captureDate: "2020-07-27",
        category: "planet"
      },
      {
        id: 10,
        title: "Webb's First Deep Field",
        description: "NASA's James Webb Space Telescope has produced the deepest and sharpest infrared image of the distant universe to date. Known as Webb's First Deep Field, this image of galaxy cluster SMACS 0723 is overflowing with detail.",
        imageUrl: "https://stsci-opo.org/STScI-01G8H49Z5K1HGKVT64AYZEG8DY.png",
        captureDate: "2022-07-11",
        category: "webb"
      },
      {
        id: 11,
        title: "Webb's Pillars of Creation",
        description: "The James Webb Space Telescope captured this lush, highly detailed landscape – the iconic Pillars of Creation – where new stars are forming within dense clouds of gas and dust.",
        imageUrl: "https://stsci-opo.org/STScI-01GK2KMYS2JYST8YW2KTQY3ZXT.png",
        captureDate: "2022-10-19",
        category: "webb"
      },
      {
        id: 12,
        title: "Webb's Southern Ring Nebula",
        description: "The Southern Ring Nebula is a planetary nebula – an expanding cloud of gas surrounding a dying star. Webb revealed previously hidden details in this colorful display.",
        imageUrl: "https://stsci-opo.org/STScI-01G8H15NQKF8HKXESJYGPJ6H7A.png",
        captureDate: "2022-07-12",
        category: "webb"
      },
      {
        id: 13,
        title: "Webb's Carina Nebula",
        description: "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula.",
        imageUrl: "https://stsci-opo.org/STScI-01G77PB54JD1D218PG476W6D7M.png",
        captureDate: "2022-07-12",
        category: "webb"
      },
      {
        id: 14,
        title: "Webb's Stephan's Quintet",
        description: "Webb captured this group of five galaxies that appear close to each other in the sky: two in the middle of merging, with the others distorted by their gravitational interactions.",
        imageUrl: "https://stsci-opo.org/STScI-01G8H1B5GTFJCYYAC42T3NACEH.png",
        captureDate: "2022-07-12",
        category: "webb"
      },
      {
        id: 15,
        title: "Andromeda Galaxy",
        description: "The Andromeda Galaxy, also known as Messier 31, is a spiral galaxy approximately 2.5 million light-years from Earth. It is the nearest major galaxy to the Milky Way and is visible to the naked eye on moonless nights.",
        imageUrl: "https://esahubble.org/media/archives/images/screen/heic1502a.jpg",
        captureDate: "2015-01-20",
        category: "galaxy"
      },
      {
        id: 16,
        title: "Webb's Cartwheel Galaxy",
        description: "Webb's powerful infrared vision captured this detailed image of the Cartwheel and two smaller companion galaxies against a backdrop of many other galaxies.",
        imageUrl: "https://stsci-opo.org/STScI-01G97DZCC51T4H1YV4J9BHR78H.png",
        captureDate: "2022-08-02",
        category: "webb"
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setHubbleImages(hubbleData);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredImages = selectedCategory === 'all'
    ? hubbleImages
    : hubbleImages.filter((image) => image.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const categories = [
    { id: 'all', name: 'All Images' },
    { id: 'nebula', name: 'Nebulae' },
    { id: 'galaxy', name: 'Galaxies' },
    { id: 'planet', name: 'Planets' },
    { id: 'webb', name: 'James Webb Telescope' }
  ];

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
              <Link href="/home" className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Syndetect
                  </h1>
                  <p className="text-xs text-blue-300/80">Stellar Archives</p>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden md:flex space-x-6">
              <Link href="/home" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Home
              </Link>
              <Link href="/detection-hub" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Detection Hub
              </Link>
              <Link href="/mission-control" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Mission Control
              </Link>
              <Link href="/galactic-map" className="px-3 py-2 rounded-lg text-blue-300/80 hover:text-blue-300 hover:bg-blue-600/20 transition-colors">
                Galactic Map
              </Link>
              <Link href="/archives" className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Stellar Archives
              </Link>
            </nav>
            
            {/* System status indicator */}
            <span className="text-xs px-2.5 py-1 rounded-full flex items-center bg-green-500/20 text-green-400 border border-green-500/30">
              <span className="w-2 h-2 rounded-full mr-1.5 bg-green-400"></span>
              System Online
            </span>
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
            <h2 className="text-2xl font-bold text-white mb-2">NASA Space Telescope Archives</h2>
            <p className="text-blue-300/70">
              Explore the wonders of space through stunning images captured by the Hubble and James Webb Space Telescopes
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-4 flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-blue-300/70 hover:bg-[#2a3348]/70 hover:text-blue-300'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-blue-300">Loading space telescope images...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <motion.div
                key={image.id}
                className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] overflow-hidden hover:border-blue-500/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: image.id * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform hover:scale-110 duration-700"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-medium bg-blue-500/70 text-white px-2.5 py-1 rounded-full">
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-blue-300/70 mb-1">
                    Captured on {formatDate(image.captureDate)}
                  </div>
                  <h3 className="text-lg font-medium text-blue-300 mb-2">{image.title}</h3>
                  <p className="text-blue-200/70 text-sm line-clamp-3">
                    {image.description}
                  </p>
                  <button className="mt-4 px-4 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors">
                    View Full Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          className="mt-12 bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-xl font-medium text-blue-300 mb-3">
            About NASA's Space Telescopes
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div>
              <h4 className="text-lg text-blue-400 font-medium mb-2">Hubble Space Telescope</h4>
              <p className="text-blue-200/70 mb-4 text-sm">
                The Hubble Space Telescope was launched into low Earth orbit in 1990 and remains in operation. 
                It's one of the largest and most versatile space telescopes, renowned for its stunning imagery of distant stars, 
                galaxies, and nebulae, as well as its crucial role in astronomical research.
              </p>
              <div className="flex justify-center mt-4">
                <a 
                  href="https://hubblesite.org/images/gallery" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                >
                  Explore Hubble Gallery
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg text-blue-400 font-medium mb-2">James Webb Space Telescope</h4>
              <p className="text-blue-200/70 mb-4 text-sm">
                The James Webb Space Telescope (JWST) was launched on December 25, 2021, and is the largest optical telescope in space.
                Operating primarily in the infrared spectrum, it allows astronomers to observe distant objects too old, distant, or faint for the Hubble Space Telescope.
                JWST is expected to enable a broad range of scientific investigations across fields of astronomy and cosmology.
              </p>
              <div className="flex justify-center mt-4">
                <a 
                  href="https://webbtelescope.org/resource-gallery/images" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                >
                  Explore Webb Gallery
                </a>
              </div>
            </div>
          </div>
          <p className="text-blue-200/70 max-w-4xl mx-auto mt-6">
            All images displayed in this archive are sourced from NASA, the European Space Agency (ESA), and their partners, 
            representing some of the most spectacular cosmic views captured throughout these missions.
          </p>
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