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
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-neutral-800">Upload Space Image</h2>
        {!currentFile ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:bg-neutral-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-neutral-600 mb-3">Drag and drop your space image here</p>
            <p className="text-neutral-500 text-sm mb-4">Supports: JPG, PNG, TIFF (max 10MB)</p>
            <Button>Browse Files</Button>
            <input 
              type="file" 
              className="hidden" 
              accept="image/jpeg,image/png,image/tiff" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-neutral-700">{currentFile.name}</p>
                  <p className="text-xs text-neutral-500">{formatFileSize(currentFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isLoading && (
                  <button 
                    className="text-neutral-500 hover:text-neutral-700"
                    onClick={handleCancelUpload}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {isLoading ? (
                  <div className="flex items-center space-x-2 text-primary-600">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing image...</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      setIsProcessed(false);
                      onProcessImage();
                    }} 
                    disabled={isLoading}
                  >
                    Reprocess Image
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
