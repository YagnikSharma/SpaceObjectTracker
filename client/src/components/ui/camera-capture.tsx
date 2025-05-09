import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  // Get list of available cameras
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        
        setAvailableCameras(cameras);
        if (cameras.length > 0) {
          setSelectedCamera(cameras[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting camera devices:", error);
      }
    };

    getAvailableCameras();
  }, []);

  // Start camera stream when component mounts or camera changes
  useEffect(() => {
    if (!selectedCamera) return;

    const startCamera = async () => {
      try {
        // Stop any existing stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
        }

        setIsCameraReady(false);
        
        // Start new stream with selected camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        setCameraStream(stream);
        
        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Mark camera as ready when video can play
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    // Cleanup function to stop camera stream when component unmounts or camera changes
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera]);

  // Handle countdown for capture
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      captureImage();
      setCountdown(null);
    }
  }, [countdown]);

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
  };

  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(3); // Start 3 second countdown
  };

  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Create a file from the blob
      const timestamp = new Date().getTime();
      const file = new File([blob], `camera_capture_${timestamp}.jpg`, { type: 'image/jpeg' });
      
      // Send the captured image file back
      onCapture(file);
      
      // Reset state
      setIsCapturing(false);
    }, 'image/jpeg', 0.95);
  };

  const cancelCapture = () => {
    setIsCapturing(false);
    setCountdown(null);
    onClose();
  };

  return (
    <Card className="bg-[#1a1f2c]/90 backdrop-blur-md border border-[#2a3348] shadow-xl overflow-hidden w-full">
      <CardContent className="p-0">
        <div className="relative">
          {/* Camera feed */}
          <div className="relative overflow-hidden rounded-t-lg aspect-video flex items-center justify-center bg-[#0a0e17]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Canvas for capturing (hidden) */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-9xl font-bold text-white">{countdown}</div>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="p-4 bg-gradient-to-t from-[#0a0e17] to-transparent absolute bottom-0 left-0 right-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {availableCameras.length > 0 && (
                <div className="w-full sm:w-64">
                  <Select value={selectedCamera} onValueChange={handleCameraChange}>
                    <SelectTrigger className="bg-[#2a3348]/80 border-[#3a4358] text-blue-200">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2c] border-[#3a4358]">
                      {availableCameras.map(camera => (
                        <SelectItem 
                          key={camera.deviceId} 
                          value={camera.deviceId}
                          className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100"
                        >
                          {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={cancelCapture}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={startCountdown} 
                  disabled={!isCameraReady || isCapturing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                >
                  {isCapturing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Capturing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Capture Image</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}