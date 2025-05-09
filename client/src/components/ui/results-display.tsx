import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

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
  referenceLink?: string; // Link to official documentation
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
  
  // Generate and download PDF report
  const handleExportPDF = () => {
    if (!detectedObjects.length || !imageUrl) return;
    
    // Create PDF document using jsPDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Add header
    pdf.setFontSize(18);
    pdf.setTextColor(65, 105, 225); // Blue
    pdf.text("Space Station Component Detection Report", pageWidth/2, 15, { align: "center" });
    
    // Add date and time
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth/2, 22, { align: "center" });
    
    // Add image thumbnail if available
    if (imageUrl) {
      try {
        pdf.addImage(imageUrl, "JPEG", 15, 30, 180, 100);
      } catch (e) {
        console.error("Could not add image to PDF:", e);
      }
    }
    
    // Add detection summary
    pdf.setFontSize(14);
    pdf.setTextColor(65, 105, 225);
    pdf.text("Detection Summary", 15, 140);
    
    const issueCount = detectedObjects.filter(obj => obj.issue).length;
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Total components detected: ${detectedObjects.length}`, 20, 150);
    pdf.text(`Components with issues: ${issueCount}`, 20, 158);
    
    if (issueCount > 0) {
      pdf.setTextColor(220, 53, 69); // Red for issues
      pdf.text("⚠️ Action required for highlighted components", 20, 166);
      pdf.setTextColor(0, 0, 0);
    }
    
    // Add table with detection results
    pdf.setFontSize(12);
    pdf.text("Detailed Components Analysis", 15, 180);
    
    const tableData = detectedObjects.map(obj => [
      obj.label,
      `${(obj.confidence * 100).toFixed(0)}%`,
      obj.context || "N/A",
      obj.issue || "None",
    ]);
    
    const tableColumns = [
      { header: "Component", dataKey: "component" },
      { header: "Confidence", dataKey: "confidence" },
      { header: "Category", dataKey: "category" },
      { header: "Issue", dataKey: "issue" }
    ];
    
    // @ts-ignore - jspdf-autotable types are not properly recognized
    pdf.autoTable({
      startY: 185,
      head: [["Component", "Confidence", "Category", "Issue"]],
      body: tableData,
      theme: "grid",
      headStyles: { 
        fillColor: [65, 105, 225],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        3: {
          fontStyle: function(cell) {
            return cell.raw !== "None" ? 'bold' : 'normal';
          },
          textColor: function(cell) {
            return cell.raw !== "None" ? [220, 53, 69] : [0, 0, 0];
          }
        }
      }
    });
    
    // Add footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Galactic Cop - Space Station Monitoring System", pageWidth/2, pdf.internal.pageSize.getHeight() - 10, { align: "center" });
    }
    
    // Save the PDF
    pdf.save("space-station-detection-report.pdf");
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
          <div className="absolute -mt-14 z-10">
            <span className="block px-1.5 py-0.5 mb-1 text-xs rounded text-white font-medium" style={{ backgroundColor: object.color }}>
              {object.label} ({(object.confidence * 100).toFixed(0)}%)
            </span>
            {object.issue && (
              <span className="block px-1.5 py-0.5 mb-1 text-xs rounded font-medium text-white bg-red-500/90">
                ⚠️ {object.issue}
              </span>
            )}
            {object.context && (
              <span className="block px-1.5 py-0.5 text-xs rounded text-white bg-blue-700/80">
                {object.context}
              </span>
            )}
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
            Upload an image of space station components to perform advanced YOLO detection and analysis.
            The system will identify and classify tools, gauges, and structural elements with high accuracy.
          </p>
          <div className="mt-6 flex justify-center flex-wrap gap-2 text-xs text-blue-400/50 max-w-md">
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Torque Wrenches</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Power Drills</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Air Quality Monitors</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Pressure Gauges</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">✓ Panel Components</span>
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
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-blue-300">YOLO</div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Space Station YOLO Analysis</h3>
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
            The YOLO detection system encountered an error. Please try again with a different image or adjust the parameters.
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
          <h2 className="text-md font-semibold ml-2 text-blue-300">YOLO Detection Results</h2>
        </div>
        <div className="flex space-x-3">
          <button 
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-xs font-medium flex items-center transition-colors" 
            onClick={handleDownloadResults}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
          <button 
            className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-xs font-medium flex items-center transition-colors" 
            onClick={handleExportPDF}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${
              showLabels 
                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400' 
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
                className="w-full h-full object-cover"
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
            </div>
          )}
          
          {/* Detection bounding boxes and labels */}
          {detectedObjects.map(renderBoundingBox)}

          {/* Image metadata UI */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-blue-300 flex items-center space-x-3 border border-blue-500/20">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-mono">{detectedObjects.length} objects</span>
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-mono">{new Date().toISOString().split('T')[0]}</span>
              </span>
            </div>
            <div className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded-lg text-xs text-white flex items-center border border-blue-500/20">
              <span className="mr-1">YOLO</span>
              <span className="font-mono text-blue-300">v9.0</span>
            </div>
          </div>
        </div>

        <div className="text-blue-200 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Space Station Components: <span className="font-bold text-blue-300 ml-1">{detectedObjects.length}</span>
              {detectedObjects.some(obj => obj.issue) && (
                <span className="ml-3 text-xs text-white bg-red-500/80 px-2 py-0.5 rounded flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Issues detected
                </span>
              )}
            </h3>
            <div className="text-xs text-blue-300/70 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
              High confidence 
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mx-1.5"></span>
              Medium confidence
            </div>
          </div>

          {/* Reference Links */}
          {detectedObjects.some(obj => obj.referenceLink) && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                NASA Documentation References
              </h4>
              <div className="space-y-2">
                {detectedObjects.filter(obj => obj.referenceLink).map(obj => (
                  <div key={`ref-${obj.id}`} className="flex items-start text-xs">
                    <div className="h-2 w-2 rounded-full mt-1 mr-2" style={{ backgroundColor: obj.color }}></div>
                    <div>
                      <span className="text-blue-200 font-medium">{obj.label}: </span>
                      <a 
                        href={obj.referenceLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Technical documentation
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="overflow-hidden rounded-lg border border-[#2a3348]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2a3348]">
                <thead className="bg-[#1a1f2c]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Component</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Issue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3348]">
                  {detectedObjects.map((object) => (
                    <tr key={object.id} className="hover:bg-[#2a3348]/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: object.color }}></div>
                          <span className="font-medium text-blue-200">{object.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-[#2a3348] rounded-full overflow-hidden mr-2">
                            <div 
                              className={`h-full ${
                                object.confidence > 0.7 
                                  ? 'bg-gradient-to-r from-green-500 to-green-300' 
                                  : 'bg-gradient-to-r from-yellow-600 to-yellow-300'
                              }`} 
                              style={{ width: `${object.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className={object.confidence > 0.7 ? 'text-green-400' : 'text-yellow-400'}>
                            {(object.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs italic text-blue-300/70 bg-blue-500/10 px-2 py-0.5 rounded">
                          {object.context || object.originalClass || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-blue-300/70">
                          x: {object.x.toFixed(2)}, y: {object.y.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {object.issue ? (
                          <span className="text-xs text-white bg-red-500/80 px-2 py-0.5 rounded">
                            ⚠️ {object.issue}
                          </span>
                        ) : (
                          <span className="text-xs text-blue-300/70 bg-green-500/20 px-2 py-0.5 rounded">
                            ✓ No issues detected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
