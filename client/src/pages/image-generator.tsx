import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";

export default function ImageGenerator() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("TOOLS");
  const [imageCount, setImageCount] = useState<string>("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    imageUrls?: Array<{ url: string, prompt: string, filename: string }>,
    category?: string,
    imageCount?: number
  }>({});

  // Fetch available categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch available synthetic image categories
  const fetchCategories = async () => {
    try {
      const response = await apiRequest("GET", "/api/synthetic-categories");
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Failed to fetch categories",
        description: "Could not retrieve synthetic image categories",
        variant: "destructive",
      });
    }
  };

  // Handle generate images form submission
  const handleGenerateImages = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      
      // Clear previous results
      setGeneratedData({});

      // Call API to generate synthetic images
      const response = await apiRequest("POST", "/api/generate-synthetic", {
        category: selectedCategory,
        count: imageCount
      });

      // Update UI with results
      setGeneratedData({
        imageUrls: response.imageUrls,
        category: response.category,
        imageCount: response.imageCount
      });

      toast({
        title: "Images Generated Successfully",
        description: `Generated ${response.imageCount} synthetic space station ${response.category.toLowerCase()} images`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating images:", error);
      toast({
        title: "Image Generation Failed",
        description: "Could not generate synthetic images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Send generated image to detection page
  const handleScanImage = (imageUrl: string) => {
    // Extract the relative URL (remove domain if any)
    const relativeUrl = imageUrl.startsWith('http') 
      ? new URL(imageUrl).pathname
      : imageUrl;
      
    // Create a custom event to pass the image URL to the detection page
    const event = new CustomEvent('scanGeneratedImage', { 
      detail: { imageUrl: relativeUrl } 
    });
    window.dispatchEvent(event);
    
    // Show toast notification
    toast({
      title: "Image Selected for Scanning",
      description: "Redirecting to detection page...",
      variant: "default",
    });
    
    // Navigate to home page for detection
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex flex-col text-white relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <ReactPlayer 
          url="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
          playing
          loop
          muted
          width="100%"
          height="100%"
          style={{ objectFit: 'cover' }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/60 via-[#0a0e17]/40 to-[#0a0e17]/90"></div>
      </div>

      {/* Floating Space Station UI Element */}
      <motion.div 
        className="absolute top-20 right-10 h-32 w-32 hidden lg:block z-10 pointer-events-none"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, 2, 0, -2, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-4xl">🖼️</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="flex-grow relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Page Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Falcon Synthetic Image Generator
            </h1>
            <p className="text-blue-300/70 mt-2 max-w-2xl mx-auto">
              Generate realistic synthetic images of space station components to train YOLO 11 object detection models.
            </p>
          </div>

          {/* Generator Controls */}
          <Card className="bg-[#1a1f2c]/70 backdrop-blur-md border border-[#2a3348] p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-semibold text-blue-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generation Parameters
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Component Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full bg-[#0f1623] border-[#2a3348]">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2c] border-[#2a3348]">
                        <SelectItem value="random" className="text-blue-300 hover:bg-blue-500/10">
                          Random (Mixed Categories)
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="text-blue-300 hover:bg-blue-500/10">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="count">Number of Images (1-5)</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="5"
                      value={imageCount}
                      onChange={(e) => setImageCount(e.target.value)}
                      className="bg-[#0f1623] border-[#2a3348]"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleGenerateImages}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Generating Images...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Generate Images
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-semibold text-blue-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </h2>
                
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-sm">
                  <ol className="list-decimal list-inside space-y-2 text-blue-200">
                    <li>Select a component category or choose "Random"</li>
                    <li>Specify how many images you want to generate (1-5)</li>
                    <li>Click "Generate Images" to create synthetic training data</li>
                    <li>Generated images will appear below for download</li>
                    <li>Use "Scan Now" to analyze an image with YOLO detection</li>
                  </ol>
                </div>
                
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 text-sm">
                  <p className="font-semibold text-purple-300 mb-2">About Falcon Synthetic Generation:</p>
                  <p className="text-blue-200">
                    Falcon AI creates photorealistic images of space station components with varying 
                    backgrounds, orientations, and lighting conditions. These synthetic images are used 
                    to train YOLO 11 object detection models for improved accuracy in real-world space 
                    station environments.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Generated Images Results */}
          {generatedData.imageUrls && generatedData.imageUrls.length > 0 && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold text-blue-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Generated {generatedData.category} Images
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedData.imageUrls.map((image, index) => (
                  <Card key={index} className="bg-[#1a1f2c]/70 backdrop-blur-md border border-[#2a3348] overflow-hidden">
                    <div className="aspect-square relative overflow-hidden bg-black/20">
                      <img 
                        src={image.url} 
                        alt={`Synthetic ${generatedData.category} image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                          {generatedData.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-blue-200 line-clamp-2">
                        {image.prompt}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-xs border-blue-500/30 hover:bg-blue-500/10"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </Button>
                        
                        <Button 
                          size="sm"
                          className="flex-1 text-xs bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                          onClick={() => handleScanImage(image.url)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Scan Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Link href="/">
                  <Button variant="outline" className="border-blue-500/30 hover:bg-blue-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return to Detection
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
          
          {/* No Results State */}
          {isGenerating === false && (!generatedData.imageUrls || generatedData.imageUrls.length === 0) && (
            <div className="bg-[#1a1f2c]/70 backdrop-blur-md border border-[#2a3348] p-8 rounded-xl shadow-lg text-center">
              <div className="mx-auto w-16 h-16 mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">No Images Generated Yet</h3>
              <p className="text-blue-200/70 max-w-md mx-auto mb-4">
                Configure your generation parameters above and click "Generate Images" to create synthetic space station component images.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#1a1f2c]/70 backdrop-blur-md border-t border-[#2a3348] mt-8">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <p className="text-sm text-blue-300/70">
              Synthetic data generated by Falcon AI for YOLO 11 training
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="text-sm text-blue-300/70 hover:text-blue-300 transition-colors">
              Home
            </Link>
            <span className="text-blue-300/50">|</span>
            <Link href="/archives" className="text-sm text-blue-300/70 hover:text-blue-300 transition-colors">
              Archives
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}