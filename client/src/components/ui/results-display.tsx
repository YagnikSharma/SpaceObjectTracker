import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OBJECT_COLORS } from '@/lib/falcon-api';
import { DetectedObject } from '@shared/schema';
import { motion } from 'framer-motion';

interface ResultsDisplayProps {
  isLoading: boolean;
  imageUrl: string | null;
  detectedObjects: DetectedObject[];
  error: string | null;
  onRetry: () => void;
}

export function ResultsDisplay({
  isLoading,
  imageUrl,
  detectedObjects,
  error,
  onRetry
}: ResultsDisplayProps) {
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [showAllLabels, setShowAllLabels] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Draw the detected objects on the canvas
  useEffect(() => {
    if (!imageUrl || isLoading || !detectedObjects.length) return;
    
    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    if (!canvas || !image || !image.complete) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the bounding boxes with precise labels
    detectedObjects.forEach(obj => {
      const { x, y, width, height } = obj;
      const color = obj.color || OBJECT_COLORS[obj.label.toLowerCase()] || OBJECT_COLORS.default;
      
      // Calculate actual pixel coordinates
      const boxX = x * image.width;
      const boxY = y * image.height;
      const boxWidth = width * image.width;
      const boxHeight = height * image.height;
      
      // Draw rectangle with more pronounced border
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.setLineDash([]);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Add subtle highlight effect
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX - 2, boxY - 2, boxWidth + 4, boxHeight + 4);
      ctx.setLineDash([]);
      
      // Draw background for text
      if (showAllLabels || selectedObject?.id === obj.id) {
        const displayText = obj.label;
        const confidenceText = `${Math.round(obj.confidence * 100)}%`;
        
        // Measure text width for background
        ctx.font = 'bold 14px Arial';
        const labelWidth = ctx.measureText(displayText).width;
        ctx.font = '10px Arial';
        const confidenceWidth = ctx.measureText(confidenceText).width;
        const totalTextWidth = Math.max(labelWidth, confidenceWidth) + 16;
        
        // Draw the text background with rounded corners
        const padding = 5;
        const textX = boxX;
        const textY = Math.max(boxY - 40, 10); // Ensure label is visible even if box is at top edge
        const textHeight = 35;
        
        // Create background for label
        ctx.fillStyle = color + 'E6'; // More opaque color
        ctx.beginPath();
        ctx.roundRect(
          textX - 1, 
          textY, 
          totalTextWidth, 
          textHeight, 
          [5]
        );
        ctx.fill();
        
        // Add subtle border around label background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(displayText, textX + padding, textY + 15);
        
        // Draw confidence with smaller font
        ctx.font = '11px Arial';
        ctx.fillText(confidenceText, textX + padding, textY + 30);
      }
    });
  }, [imageUrl, detectedObjects, isLoading, selectedObject, showAllLabels]);
  
  // If there's an error, show the error message
  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-md border border-border shadow-lg overflow-hidden mt-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-destructive">Processing Error</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="destructive" onClick={onRetry}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If there's no image yet, don't render
  if (!imageUrl && !isLoading) {
    return null;
  }
  
  return (
    <Card className="bg-card/80 backdrop-blur-md border border-border shadow-lg overflow-hidden mt-4">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h2 className="text-md font-semibold ml-2 text-primary dark:text-blue-300">
              {isLoading ? 'Processing Image...' : 'Space Station Detection'}
            </h2>
          </div>
          {!isLoading && detectedObjects.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllLabels(!showAllLabels)}
              className="text-xs px-2 py-1 h-8"
            >
              {showAllLabels ? 'Hide Labels' : 'Show All Labels'}
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-0 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse">
              Analyzing space station image using TensorFlow AI...
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Original image */}
            <img 
              ref={imageRef}
              src={imageUrl!} 
              alt="Analyzed space image" 
              className="w-full h-auto" 
              onLoad={() => {
                // Redraw canvas when image loads
                if (canvasRef.current && imageRef.current) {
                  canvasRef.current.width = imageRef.current.width;
                  canvasRef.current.height = imageRef.current.height;
                }
              }}
            />
            
            {/* Canvas overlay for drawing bounding boxes */}
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {/* Objects not found message - as a footer instead of overlay */}
            {!detectedObjects.length && imageUrl && (
              <div className="mt-4 p-4 border-t border-border">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">No Target Objects Detected</h3>
                        <p className="text-xs text-muted-foreground">
                          No fire extinguishers, oxygen tanks, or toolboxes were found in this image.
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={onRetry} className="ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Choose Another Image
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Object details panel */}
      {!isLoading && detectedObjects.length > 0 && (
        <div className="border-t border-border p-4">
          <h3 className="text-sm font-semibold mb-3">Detected Space Objects:</h3>
          <div className="grid gap-2 max-h-40 overflow-y-auto pr-2">
            {detectedObjects.map(obj => (
              <div 
                key={obj.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedObject?.id === obj.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-background hover:bg-primary/5 border-border'
                }`}
                onClick={() => setSelectedObject(selectedObject?.id === obj.id ? null : obj)}
              >
                <div className="flex items-start">
                  <div 
                    className="w-3 h-3 mt-1 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: obj.color || OBJECT_COLORS[obj.label.toLowerCase()] || OBJECT_COLORS.default }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{obj.label}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </div>
                    
                    {obj.context && (
                      <p className="text-xs text-muted-foreground mt-1">{obj.context}</p>
                    )}
                    
                    {obj.issue && (
                      <p className="text-xs text-destructive mt-1">{obj.issue}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}