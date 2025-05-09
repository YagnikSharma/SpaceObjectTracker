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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt");
  const { toast } = useToast();

  // Check camera permissions and get available cameras
  useEffect(() => {
    const checkPermissionsAndGetCameras = async () => {
      try {
        // First, check if we have camera permission already by requesting a stream
        // This will prompt for permission if it hasn't been granted yet
        const initialStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        // Permission granted
        setPermissionStatus("granted");
        
        // Stop the initial stream since we'll start a new one with the selected camera
        initialStream.getTracks().forEach(track => track.stop());
        
        // Now get the list of cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        
        if (cameras.length === 0) {
          toast({
            title: "No cameras detected",
            description: "We couldn't find any cameras connected to your device.",
            variant: "destructive",
          });
          return;
        }
        
        setAvailableCameras(cameras);
        // Set the first camera as selected if it has a deviceId
        if (cameras.length > 0) {
          const firstCamera = cameras[0];
          // Use a fallback ID if deviceId is empty
          setSelectedCamera(firstCamera.deviceId || `camera-${0}`);
        }
      } catch (error) {
        console.error("Error during camera setup:", error);
        
        // Handle permission denied
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setPermissionStatus("denied");
          toast({
            title: "Camera access denied",
            description: "You need to allow camera access to use this feature. Please check your browser settings.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Camera error",
            description: "There was a problem accessing your camera. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    checkPermissionsAndGetCameras();
    
    // Clean up any streams when component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  // Start camera stream when selected camera changes
  useEffect(() => {
    if (!selectedCamera || permissionStatus !== "granted") return;

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
            facingMode: "environment", // Prefer rear camera on mobile
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
        toast({
          title: "Camera error",
          description: "There was a problem accessing the selected camera. Please try another one or refresh the page.",
          variant: "destructive",
        });
      }
    };

    startCamera();

    // Cleanup function to stop camera stream when component unmounts or camera changes
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCamera, permissionStatus, toast]);

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

  // Permission error message component
  const PermissionErrorMessage = () => (
    <div className="p-8 text-center">
      <div className="text-red-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-red-400 mb-2">Camera Access Denied</h3>
      <p className="text-blue-200/70 mb-4">
        The app needs permission to access your camera to capture images. Please check your browser settings
        and refresh the page to try again.
      </p>
      <div className="mb-6 p-4 bg-[#2a3348]/50 rounded-lg text-sm text-blue-200/80">
        <p className="font-medium mb-1">How to enable camera access:</p>
        <ol className="list-decimal list-inside text-left space-y-1">
          <li>Click on the lock or site settings icon in your browser's address bar</li>
          <li>Find "Camera" permissions and change it to "Allow"</li>
          <li>Refresh the page to try again</li>
        </ol>
      </div>
      <Button 
        variant="outline" 
        onClick={cancelCapture}
        className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
      >
        Cancel
      </Button>
    </div>
  );

  // Error with available cameras
  const NoCamerasMessage = () => (
    <div className="p-8 text-center">
      <div className="text-yellow-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-yellow-400 mb-2">No Cameras Detected</h3>
      <p className="text-blue-200/70 mb-4">
        We couldn't find any cameras connected to your device. Please make sure you have at least one camera connected
        and refresh the page.
      </p>
      <Button 
        variant="outline" 
        onClick={cancelCapture}
        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300"
      >
        Cancel
      </Button>
    </div>
  );

  // Camera interface component
  const CameraInterface = () => (
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
        
        {!isCameraReady && permissionStatus === "granted" && (
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
                      value={camera.deviceId || `camera-${availableCameras.indexOf(camera)}`}
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
  );

  const renderContent = () => {
    if (permissionStatus === "denied") {
      return <PermissionErrorMessage />;
    } else if (permissionStatus === "granted" && availableCameras.length === 0) {
      return <NoCamerasMessage />;
    } else {
      return <CameraInterface />;
    }
  };

  return (
    <Card className="bg-[#1a1f2c]/90 backdrop-blur-md border border-[#2a3348] shadow-xl overflow-hidden w-full">
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}