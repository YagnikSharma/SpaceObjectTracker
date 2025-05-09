import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Cleanup function to stop any active streams
  const stopAllStreams = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Initialize - Check permissions and enumerate devices
  useEffect(() => {
    let mounted = true;
    
    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setCameraError(null);
        
        // First request camera access to trigger permission prompt
        const initialStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        // Once permission granted, get all camera devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        // Clean up the initial stream since we'll start a new one with selected camera
        initialStream.getTracks().forEach(track => track.stop());
        
        if (mounted) {
          if (cameras.length === 0) {
            setCameraError("No cameras detected on your device");
            setIsLoading(false);
            return;
          }
          
          setAvailableCameras(cameras);
          
          // Select the first camera by default (usually front camera on mobile)
          // On mobile, try to get the environment-facing camera instead
          let defaultCamera = cameras[0].deviceId;
          
          if (isMobile && cameras.length > 1) {
            // Try to select a rear camera on mobile devices if available
            const rearCamera = cameras.find(camera => 
              camera.label.toLowerCase().includes('back') || 
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('environment')
            );
            
            if (rearCamera) {
              defaultCamera = rearCamera.deviceId;
            }
          }
          
          setSelectedCameraId(defaultCamera);
        }
      } catch (error) {
        console.error("Camera initialization error:", error);
        
        if (mounted) {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            setPermissionDenied(true);
            toast({
              title: "Camera Access Denied",
              description: "Please allow camera access to use this feature",
              variant: "destructive"
            });
          } else {
            setCameraError("Failed to initialize camera. Please try again.");
            toast({
              title: "Camera Error",
              description: "There was a problem accessing your camera",
              variant: "destructive"
            });
          }
          setIsLoading(false);
        }
      }
    };
    
    initializeCamera();
    
    return () => {
      mounted = false;
      stopAllStreams();
    };
  }, [toast, isMobile]);

  // Start camera when selected camera changes
  useEffect(() => {
    let mounted = true;
    
    if (!selectedCameraId || permissionDenied) return;
    
    const startCamera = async () => {
      try {
        setIsLoading(true);
        
        // Stop any previous stream
        stopAllStreams();
        
        // Configure constraints based on device and selected camera
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedCameraId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        console.log('Starting camera with constraints:', constraints.video);
        
        // Get camera stream
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          newStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Store the stream for cleanup
        setStream(newStream);
        
        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          
          // Try to play the video
          videoRef.current.onloadedmetadata = async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play();
              } catch (err) {
                console.error('Error playing video:', err);
              } finally {
                if (mounted) setIsLoading(false);
              }
            }
          };
        }
      } catch (error) {
        console.error('Error starting camera:', error);
        if (mounted) {
          setCameraError(`Failed to start camera: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsLoading(false);
          
          toast({
            title: "Camera Error",
            description: "Could not start the selected camera. Please try another camera.",
            variant: "destructive"
          });
        }
      }
    };
    
    startCamera();
    
    return () => {
      mounted = false;
      // Don't stop the stream here as it will cause flicker when changing cameras
      // The cleanup will happen at the start of the next camera
    };
  }, [selectedCameraId, permissionDenied, toast]);

  // Handle camera switching
  const handleCameraChange = (cameraId: string) => {
    setSelectedCameraId(cameraId);
  };

  // Handle camera capture
  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Get canvas context and draw current video frame
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
          return;
        }
        
        // Create file from blob
        const filename = `camera-capture-${new Date().getTime()}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        
        // Pass file to handler
        onCapture(file);
        
        // Reset capture state
        setIsCapturing(false);
        setCountdown(null);
      }, 'image/jpeg', 0.92);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: "Capture Failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive"
      });
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  // Start countdown for photo capture
  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(3);
  };

  // Handle countdown logic
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capturePhoto();
    }
  }, [countdown]);

  // Handle flipping camera on mobile
  const flipCamera = () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setSelectedCameraId(availableCameras[nextIndex].deviceId);
  };

  // Handle cancellation
  const handleCancel = () => {
    stopAllStreams();
    setIsCapturing(false);
    setCountdown(null);
    onClose();
  };

  // Render permission denied message
  if (permissionDenied) {
    return (
      <Card className="bg-[#1a1f2c]/80 backdrop-blur-lg border border-red-500/30 shadow-xl overflow-hidden">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Camera Access Denied</h3>
          <p className="text-blue-200/70 mb-4">
            To use the camera feature, you need to grant camera access permission.
          </p>
          <div className="mb-6 p-4 bg-[#2a3348]/50 rounded-lg text-sm text-blue-200/80">
            <p className="font-medium mb-1">How to enable camera access:</p>
            <ol className="list-decimal list-inside text-left space-y-1">
              <li>Click the lock/site icon in your browser's address bar</li>
              <li>Find "Camera" permissions and change to "Allow"</li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
          <Button 
            onClick={handleCancel}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-400 hover:to-amber-500"
          >
            Close Camera
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render camera error message
  if (cameraError) {
    return (
      <Card className="bg-[#1a1f2c]/80 backdrop-blur-lg border border-yellow-500/30 shadow-xl overflow-hidden">
        <CardContent className="p-6 text-center">
          <div className="text-yellow-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">Camera Error</h3>
          <p className="text-blue-200/70 mb-4">
            {cameraError}
          </p>
          <Button 
            onClick={handleCancel}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-400 hover:to-amber-500"
          >
            Close Camera
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render main camera UI
  return (
    <Card className="bg-[#1a1f2c]/90 backdrop-blur-md border border-[#2a3348] shadow-xl overflow-hidden w-full">
      <CardContent className="p-0">
        <div className="relative">
          {/* Camera viewfinder */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden rounded-t-lg">
            {/* Video element */}
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
            
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Camera flip button (mobile only) */}
            {!isLoading && isMobile && availableCameras.length > 1 && (
              <Button
                onClick={flipCamera}
                size="icon"
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 border border-white/20 hover:bg-black/70 z-10"
                aria-label="Flip camera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </Button>
            )}
            
            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                <div className="text-9xl font-bold text-white drop-shadow-lg">
                  {countdown}
                </div>
              </div>
            )}
            
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Camera controls */}
          <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Camera selector (desktop only) */}
              {!isMobile && availableCameras.length > 1 && (
                <div className="w-full sm:w-64">
                  <Select value={selectedCameraId} onValueChange={handleCameraChange}>
                    <SelectTrigger className="bg-[#2a3348]/70 border-[#3a4358] text-blue-200">
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2c] border-[#3a4358]">
                      {availableCameras.map(camera => (
                        <SelectItem 
                          key={camera.deviceId} 
                          value={camera.deviceId}
                          className="text-blue-200 focus:bg-yellow-500/20 focus:text-yellow-100"
                        >
                          {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Action buttons */}
              <div className={`flex space-x-3 ${isMobile ? 'w-full justify-center' : ''}`}>
                {/* Cancel button */}
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <span className="sr-only sm:not-sr-only">Cancel</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
                
                {/* Capture button */}
                <Button 
                  onClick={startCountdown} 
                  disabled={isLoading || isCapturing}
                  className={`
                    bg-gradient-to-r from-yellow-500 to-amber-600 text-white 
                    hover:from-yellow-400 hover:to-amber-500
                    ${isMobile ? 'h-16 w-16 rounded-full p-0 flex items-center justify-center' : ''}
                  `}
                >
                  {isCapturing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="sr-only sm:not-sr-only">Capturing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-8 w-8' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="sr-only sm:not-sr-only">Capture Photo</span>
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