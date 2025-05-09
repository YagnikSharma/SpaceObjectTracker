import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface ResultsDisplayProps {
  isLoading: boolean;
  imageUrl: string | null;
  detectedObjects: DetectedObject[];
  error: string | null;
  onRetry: () => void;
}

export function ResultsDisplay({ isLoading, imageUrl, detectedObjects, error, onRetry }: ResultsDisplayProps) {
  const [showLabels, setShowLabels] = useState(true);

  const handleDownloadResults = () => {
    if (!detectedObjects.length) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detectedObjects, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "detection-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const renderBoundingBox = (object: DetectedObject) => {
    const style = {
      top: `${object.y * 100}%`,
      left: `${object.x * 100}%`,
      width: `${object.width * 100}%`,
      height: `${object.height * 100}%`,
      borderColor: object.color,
      color: object.color,
    };

    return (
      <div 
        key={object.id} 
        className="bounding-box absolute border-2 pointer-events-none" 
        style={style}
      >
        {showLabels && (
          <span className="absolute -mt-6 px-1 text-xs rounded text-white" style={{ backgroundColor: object.color }}>
            {object.label} ({(object.confidence * 100).toFixed(0)}%)
          </span>
        )}
      </div>
    );
  };

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-700 font-medium";
    if (confidence >= 0.7) return "text-blue-700 font-medium";
    return "text-yellow-700 font-medium";
  };

  // Empty state
  if (!isLoading && !imageUrl && !error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">No Results Yet</h3>
          <p className="text-neutral-500 max-w-md">Upload a space image to detect satellites, debris, and other space objects using Falcon API.</p>
        </div>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600 text-center">Analyzing image with Falcon API...</p>
          <p className="text-neutral-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-700 mb-2">Processing Error</h3>
          <p className="text-neutral-500 max-w-md">{error}</p>
          <Button className="mt-4" onClick={onRetry}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // Results state
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-neutral-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-800">Detection Results</h2>
        <div className="flex space-x-2">
          <button 
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center" 
            onClick={handleDownloadResults}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neutral-500 hover:text-neutral-700 text-sm font-medium flex items-center"
            onClick={() => setShowLabels(!showLabels)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="relative mb-6 bg-neutral-100 rounded-lg overflow-hidden" style={{height: "320px"}}>
          {imageUrl && <img 
            src={imageUrl}
            alt="Processed space image with detected objects"
            className="w-full h-full object-cover"
          />}
          {detectedObjects.map(renderBoundingBox)}
        </div>

        <div className="text-sm">
          <h3 className="font-medium text-neutral-700 mb-2">
            Objects Detected: <span className="font-semibold text-primary-700">{detectedObjects.length}</span>
          </h3>
          <div className="overflow-x-auto bg-neutral-50 rounded-lg border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Object</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Size</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {detectedObjects.map((object) => (
                  <tr key={object.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: object.color }}></div>
                        <span className="font-medium text-neutral-700">{object.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={getConfidenceClass(object.confidence)}>
                        {(object.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-neutral-600 text-xs">
                        x: {object.x.toFixed(2)}, y: {object.y.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-neutral-600 text-xs">
                        w: {object.width.toFixed(2)}, h: {object.height.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
