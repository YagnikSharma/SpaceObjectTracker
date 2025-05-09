import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onProcessImage: () => void;
  isLoading: boolean;
  isProcessed: boolean;
  setIsProcessed: (processed: boolean) => void;
}

export function FileUploader({ onFileSelect, onProcessImage, isLoading, isProcessed, setIsProcessed }: FileUploaderProps) {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Process image automatically when a file is selected
  useEffect(() => {
    if (currentFile && !isLoading && !isProcessed) {
      // Mark that we're processing this file
      setIsProcessed(true);
      
      // Slight delay to let the UI update first
      const timer = setTimeout(() => {
        onProcessImage();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentFile, isLoading, isProcessed, onProcessImage, setIsProcessed]);
  
  // Reset processing flag when file changes
  useEffect(() => {
    if (!currentFile) {
      setIsProcessed(false);
    }
  }, [currentFile, setIsProcessed]);

  const validateFile = (file: File): boolean => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or TIFF image",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!validateFile(file)) return;

    setCurrentFile(file);
    onFileSelect(file);
    // Note: No need to call onProcessImage() here as the useEffect will handle it
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!validateFile(file)) return;

      setCurrentFile(file);
      onFileSelect(file);
      // Note: No need to call onProcessImage() here as the useEffect will handle it
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelUpload = () => {
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (sizeInBytes: number): string => {
    return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {!currentFile ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
              : 'border-[#2a3348] hover:border-blue-400/50 hover:bg-[#2a3348]/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-blue-300 mb-2">Upload Space Image for Analysis</h3>
          <p className="text-blue-200/70 mb-3">Drag and drop your astronomical image for YOLO detection</p>
          <p className="text-blue-200/50 text-sm mb-6">Supports: JPG, PNG, TIFF (max 10MB)</p>
          
          <button 
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium 
                     shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all
                     hover:from-blue-500 hover:to-purple-500"
          >
            Select Image File
          </button>
          
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png,image/tiff" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="bg-[#1a1f2c]/70 backdrop-blur-sm border border-[#2a3348] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-300">{currentFile.name}</p>
                <p className="text-xs text-blue-300/60">{formatFileSize(currentFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isLoading && (
                <button 
                  className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
                  onClick={handleCancelUpload}
                  disabled={isLoading}
                  aria-label="Cancel upload"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {isLoading ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/30 rounded-lg">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-300">Processing with YOLO...</span>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsProcessed(false);
                    onProcessImage();
                  }} 
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium 
                         shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 transition-all
                         hover:from-blue-500 hover:to-purple-500 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Scan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
