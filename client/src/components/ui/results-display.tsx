import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSpeech } from "@/hooks/use-speech";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  originalClass?: string; // Original COCO-SSD detection class
  context?: string; // Space station context category (TOOLS, GAUGES, etc.)
  issue?: string; // Detected issue with the component
}

export interface ResultsDisplayProps {
  isLoading: boolean;
  imageUrl: string | null;
  detectedObjects: DetectedObject[];
  error: string | null;
  onRetry: () => void;
}

export function ResultsDisplay({ isLoading, imageUrl, detectedObjects, error, onRetry }: ResultsDisplayProps) {
  const [showLabels, setShowLabels] = useState(true);
  const { supported, speaking, speakResults, stopSpeaking } = useSpeech();

  // Generate and download JSON of detection results
  const handleDownloadResults = () => {
    if (!detectedObjects.length) return;
    
    const resultsJson = JSON.stringify({
      timestamp: new Date().toISOString(),
      detectedObjects: detectedObjects.map(obj => ({
        ...obj,
        confidence: Math.round(obj.confidence * 1000) / 1000 // Round to 3 decimal places
      }))
    }, null, 2);
    
    const blob = new Blob([resultsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.href = url;
    downloadAnchorNode.download = `syndetect-results-${new Date().getTime()}.json`;
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const handleExportPDF = () => {
    if (!detectedObjects.length || !imageUrl) {
      console.log("No objects or imageUrl available for PDF export");
      return;
    }
    
    try {
      // Create a new jsPDF instance with more conservative settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add header
      doc.setFillColor(20, 30, 50);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("SYNDETECT - Space Station Monitoring Report", 105, 10, { align: 'center' });
      
      // Add date and time
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const now = new Date();
      doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 105, 15, { align: 'center' });
      
      // Simple PDF without image processing to avoid corruption
      // Add detection summary sections directly
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 60, 100);
      doc.text("Detection Summary", 15, 45);
      
      // Add summary text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      
      const criticalIssues = detectedObjects.filter(obj => obj.issue);
      const highConfidence = detectedObjects.filter(obj => obj.confidence > 0.7).length;
      
      const percentHighConf = detectedObjects.length ? Math.round(highConfidence/detectedObjects.length*100) : 0;
      
      const summaryTexts = [
        `Total objects detected: ${detectedObjects.length}`,
        `High confidence detections: ${highConfidence} (${percentHighConf}%)`,
        `Objects with issues: ${criticalIssues.length}`,
        `Detection method: Vision API`,
      ];
      
      let yPos = 55;
      summaryTexts.forEach(text => {
        doc.text(text, 15, yPos);
        yPos += 6;
      });
      
      // Create table of detections
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 60, 100);
      doc.text("Detected Components", 15, 85);
      
      const tableColumn = ["Component", "Confidence", "Category", "Issue"];
      const tableRows: Array<[string, string, string, string]> = [];
      
      detectedObjects.forEach(obj => {
        const confidencePercent = Math.round(obj.confidence * 100) + '%';
        tableRows.push([
          obj.label,
          confidencePercent,
          obj.context || "Uncategorized",
          obj.issue || "None"
        ]);
      });
      
      // Add table with autoTable plugin
      try {
        (doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 90,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 2 },
          headStyles: { fillColor: [60, 90, 150], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 50 }, // Component
            1: { cellWidth: 25, halign: 'center' }, // Confidence
            2: { cellWidth: 40 }, // Category
            3: { cellWidth: 'auto' } // Issue
          },
          alternateRowStyles: { fillColor: [240, 245, 255] },
          rowStyles: { minCellHeight: 10 }
        });
        
        // Add footer after table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text("This report was automatically generated by the Syndetect Space Station Monitoring System.", 105, finalY, { align: 'center' });
      } catch (tableError) {
        console.error("Failed to create table in PDF:", tableError);
        
        // Basic fallback if autoTable fails
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Detection Results:", 15, 90);
        
        let resultY = 100;
        detectedObjects.forEach(obj => {
          doc.text(`${obj.label} - ${Math.round(obj.confidence * 100)}% confidence`, 20, resultY);
          resultY += 7;
        });
      }
      
      // Save the PDF
      try {
        doc.save("syndetect-report.pdf");
        console.log("PDF exported successfully");
      } catch (saveError) {
        console.error("Failed to save PDF:", saveError);
        alert("Failed to export PDF. Please try again.");
      }
      
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("PDF export failed. Please try again.");
    }
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
          <div className="absolute top-0 left-0 z-10 -translate-y-7 -translate-x-1">
            <div className="inline-flex flex-col items-start">
              <span className="px-1.5 py-0.5 mb-1 text-xs rounded text-white font-medium whitespace-nowrap shadow-md" style={{ backgroundColor: object.color }}>
                {object.label} ({(object.confidence * 100).toFixed(0)}%)
              </span>
              {object.issue && (
                <span className="px-1.5 py-0.5 mb-1 text-xs rounded font-medium text-white bg-red-500/90 whitespace-nowrap shadow-md">
                  ⚠️ {object.issue}
                </span>
              )}
              {object.context && (
                <span className="px-1.5 py-0.5 text-xs rounded text-white bg-blue-700/80 whitespace-nowrap shadow-md">
                  {object.context}
                </span>
              )}
            </div>
          </div>
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
      <div className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            Space Station Monitoring Ready
          </h3>
          <p className="text-blue-300/60 max-w-md text-sm">
            Upload an image of space station components to perform advanced Vision API detection and analysis.
            The system will identify and classify tools, gauges, and structural elements with high accuracy.
          </p>
          <div className="mt-6 flex justify-center flex-wrap gap-2 text-xs text-blue-400/50 max-w-md">
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Toolboxes</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Fire Extinguishers</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Oxygen Tanks</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Pressure Gauges</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Astronauts</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-300">API</div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Space Station Object Analysis</h3>
          <p className="text-blue-300/70 text-center max-w-md">Scanning image for tools, gauges, panel components, and potential structural issues</p>
          <div className="mt-4 w-64 h-2 bg-[#2a3348] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-red-500/30 shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-red-400 mb-3">Detection System Error</h3>
          <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg font-mono text-sm text-red-300/80">
            {error}
          </div>
          <p className="text-blue-300/60 max-w-md text-sm mb-4">
            The detection system encountered an error. Please try again with a different image or adjust the parameters.
          </p>
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white font-medium 
                     shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all
                     hover:from-red-500 hover:to-orange-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset and Try Again
          </button>
        </div>
      </div>
    );
  }

  // Results state
  return (
    <div className="bg-[#1a1f2c]/70 backdrop-blur-md rounded-xl border border-[#2a3348] shadow-lg overflow-hidden">
      <div className="border-b border-[#2a3348] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <h2 className="text-md font-semibold ml-2 text-blue-300">Vision API Detection Results</h2>
        </div>
        <div className="flex space-x-3">
          {supported && (
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${
                speaking 
                  ? 'bg-green-500/30 text-green-400' 
                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
              }`}
              onClick={() => speaking ? stopSpeaking() : speakResults(detectedObjects)}
              disabled={!detectedObjects.length}
              title={speaking ? "Stop Speaking" : "Speak Detection Results"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {speaking ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
              {speaking ? 'Stop' : 'Speak Results'}
            </button>
          )}
          
          <button 
            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-xs font-medium flex items-center transition-colors"
            onClick={handleExportPDF}
            disabled={!detectedObjects.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          
          <button 
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-xs font-medium flex items-center transition-colors" 
            onClick={handleDownloadResults}
            disabled={!detectedObjects.length}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
          
          <button 
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${
              showLabels 
                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400' 
                : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
            }`}
            onClick={() => setShowLabels(!showLabels)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative mb-6 bg-black/30 rounded-lg overflow-hidden border border-[#2a3348]/50" style={{height: "340px"}}>
          {imageUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={imageUrl}
                alt="Processed space image with detected objects"
                className="w-full h-full object-contain"
              />
              {/* Add a subtle grid overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              ></div>
              
              {/* Render bounding boxes for detected objects */}
              {detectedObjects.map(renderBoundingBox)}

              {/* Image metadata UI */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                <div className="px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-blue-300 flex items-center space-x-3 border border-blue-500/20">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date().toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs flex items-center space-x-3 border border-blue-500/20">
                  <span className="flex items-center space-x-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="font-medium text-blue-300">
                      Space Station Components: <span className="font-bold text-blue-300 ml-1">{detectedObjects.length}</span>
                    </span>
                  </span>
                  <span className="hidden md:flex items-center space-x-2 mr-1">
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-400">High confidence</span>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-yellow-400">Medium confidence</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Object list */}
        {detectedObjects.length > 0 && (
          <div className="mt-2 bg-[#151922] rounded-lg border border-[#2a3348]/70 overflow-hidden">
            <div className="px-4 py-3 bg-[#1e2330] text-blue-300 text-xs font-medium flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Component List</span>
              </div>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-blue-300 text-xs">
                {detectedObjects.length} object{detectedObjects.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#1a1f2c] text-xs font-medium text-blue-300 border-b border-[#2a3348]">
                    <th className="px-4 py-2 text-left">COMPONENT</th>
                    <th className="px-4 py-2 text-center">CONFIDENCE</th>
                    <th className="px-4 py-2 text-left">CATEGORY</th>
                    <th className="px-4 py-2 text-left">LOCATION</th>
                    <th className="px-4 py-2 text-left">ISSUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3348]/50">
                  {detectedObjects.map(obj => (
                    <tr key={obj.id} className="hover:bg-[#1a1f2c]/50 transition-colors text-xs">
                      <td className="px-4 py-2.5 flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: obj.color }}></div>
                        <span className="font-medium text-blue-100">{obj.label}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={getConfidenceClass(obj.confidence)}>
                          {Math.round(obj.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-blue-300">
                        {obj.context || "Uncategorized"}
                      </td>
                      <td className="px-4 py-2.5 text-blue-300/80 font-mono">
                        x: {obj.x.toFixed(2)}, y: {obj.y.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5">
                        {obj.issue ? (
                          <span className="flex items-center space-x-1 text-orange-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{obj.issue}</span>
                          </span>
                        ) : (
                          <span className="text-green-400/80 flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>No issues detected</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}