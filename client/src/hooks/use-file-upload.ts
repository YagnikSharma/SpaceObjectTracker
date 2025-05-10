import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { uploadImageToFalcon, OBJECT_COLORS } from "@/lib/falcon-api";
import { DetectedObject } from "@shared/schema";

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const { toast } = useToast();

  const processImage = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file first",
        variant: "destructive",
      });
      return;
    }

    // If already processed or processing, don't process again unless it's a manual reprocess
    if (isProcessed && isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Use YOLOv8 detection (default on server)
      const response = await uploadImageToFalcon(selectedFile);
      
      setImageUrl(response.imageUrl);
      
      // The objects already have their IDs and contexts from the backend
      const processedObjects = response.detectedObjects;
      
      setDetectedObjects(processedObjects);
      setIsProcessed(true);
      
      toast({
        title: "Analysis Complete",
        description: `Detected ${processedObjects.length} objects in the image`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast({
        title: "Processing Error",
        description: "Failed to process the image with TensorFlow",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, toast, isProcessed, isUploading]);

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setImageUrl(null);
    setUploadError(null);
    setDetectedObjects([]);
    setIsProcessed(false);
  }, []);

  return {
    selectedFile,
    imageUrl,
    isUploading,
    detectedObjects,
    uploadError,
    isProcessed,
    setSelectedFile,
    setIsProcessed,
    processImage,
    resetUpload
  };
}
