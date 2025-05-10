import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ImageGenerator() {
  const [selectedCategory, setSelectedCategory] = useState("TOOLS");
  const [imageCount, setImageCount] = useState("5");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  // Fetch categories for synthetic image generation
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/synthetic-categories"],
    retry: 3,
  });

  // Generate synthetic images mutation
  const { mutate: generateImages, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/generate-synthetic", {
        method: "POST",
        body: {
          category: selectedCategory,
          count: imageCount,
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/generate-synthetic"] });
      toast({
        title: "Synthetic images generated",
        description: `${data.imageCount} ${data.category.toLowerCase()} images have been generated`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating images",
        description: error.message || "Failed to generate synthetic images",
        variant: "destructive",
      });
    },
  });

  // Scan selected image with object detection
  const { mutate: scanImage, isPending: isScanning } = useMutation({
    mutationFn: async (imageUrl: string) => {
      // Get the image data by fetching it from the server
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create FormData to upload the image
      const formData = new FormData();
      formData.append("image", blob);

      // Use fetch directly for file upload
      const detectResponse = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      if (!detectResponse.ok) {
        throw new Error("Failed to process image");
      }

      return detectResponse.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/detect"] });
      toast({
        title: "Image scanned successfully",
        description: `Detected ${data.detectedObjects.length} space station components`,
      });
      // Navigate to the mission control page with the detection data
      setLocation("/mission-control");
    },
    onError: (error) => {
      toast({
        title: "Error scanning image",
        description: error.message || "Failed to scan image",
        variant: "destructive",
      });
    },
  });

  // Query to get generated images (if any)
  const { data: generatedData } = useQuery({
    queryKey: ["/api/generate-synthetic", selectedCategory],
    enabled: false, // Only enable when manually triggered
  });

  // Handle form submission
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateImages();
  };

  // Handle direct scan of an image
  const handleScanImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    scanImage(imageUrl);
  };

  // Handle image download
  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `falcon_synthetic_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error downloading image",
        description: "Failed to download the image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Falcon Synthetic Image Generator
        </h1>
        <p className="text-gray-400">
          Generate synthetic images of space station components for AI training and detection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-4 p-6 bg-[#121827] border-[#2a3348]">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category">Component Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isGenerating}
              >
                <SelectTrigger id="category" className="bg-[#1a1f2c] border-[#2a3348]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2c] border-[#2a3348]">
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : (
                    categoriesData?.categories?.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Images</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="10"
                value={imageCount}
                onChange={(e) => setImageCount(e.target.value)}
                disabled={isGenerating}
                className="bg-[#1a1f2c] border-[#2a3348]"
              />
              <p className="text-xs text-gray-400">
                Generate between 1-10 images (higher values take longer)
              </p>
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2" /> Generating Images...
                </>
              ) : (
                "Generate Synthetic Images"
              )}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">About Falcon Synthetic Images</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Falcon AI generates photorealistic synthetic images of space station components
                for training AI object detection models.
              </p>
              <p>
                These images simulate various lighting conditions, angles, and positions to
                create a robust training dataset.
              </p>
              <p>
                <span className="text-blue-400 font-medium">Use cases:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Training custom AI models</li>
                  <li>Testing object detection accuracy</li>
                  <li>Augmenting existing datasets</li>
                  <li>Simulating rare component conditions</li>
                </ul>
              </p>
            </div>
          </div>
        </Card>

        <div className="md:col-span-8 space-y-6">
          <Card className="p-6 bg-[#121827] border-[#2a3348]">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Generated Images</h2>
            
            {isGenerating ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Spinner size="lg" className="mb-4" />
                  <p className="text-gray-400">
                    Generating synthetic images with Falcon AI...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    This may take a few moments
                  </p>
                </div>
              </div>
            ) : generatedData?.imageUrls?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedData.imageUrls.map((imageUrl: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="relative group overflow-hidden rounded-lg border border-[#2a3348]">
                      <img
                        src={imageUrl}
                        alt={`Synthetic ${generatedData.category.toLowerCase()} ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadImage(imageUrl)}
                            className="bg-blue-900/70 border-blue-500/50 text-blue-200 hover:bg-blue-800"
                          >
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScanImage(imageUrl)}
                            disabled={isScanning && selectedImageUrl === imageUrl}
                            className="bg-purple-900/70 border-purple-500/50 text-purple-200 hover:bg-purple-800"
                          >
                            {isScanning && selectedImageUrl === imageUrl ? (
                              <>
                                <Spinner className="mr-1 h-3 w-3" /> Scanning...
                              </>
                            ) : (
                              "Scan"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                      {generatedData.category} {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-600 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400">
                    Select a category and click "Generate" to create synthetic images.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Images will appear here after generation.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}