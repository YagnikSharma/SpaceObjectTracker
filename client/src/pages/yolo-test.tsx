import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  context: string;
}

interface DetectionResponse {
  imageUrl: string;
  detectedObjects: Detection[];
  detectionId: number;
  source: string;
  stats: {
    priorityObjectsDetected: number;
    humansDetected: number;
    detectionMethod: string;
  };
}

export default function YoloTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear previous detection
      setDetectionResult(null);
    }
  };
  
  const handleDetect = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/detect?model=yolo11n', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Detection failed');
      }
      
      const data = await response.json();
      setDetectionResult(data);
      console.log('Detection result:', data);
    } catch (error) {
      console.error('Error detecting objects:', error);
      alert('Error detecting objects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDetectionResult(null);
  };
  
  // Draw detection boxes when result changes
  useEffect(() => {
    if (!detectionResult || !imageRef.current || !imageWrapperRef.current) return;
    
    // Clear previous boxes
    const existingBoxes = imageWrapperRef.current.querySelectorAll('.detection-box, .detection-label');
    existingBoxes.forEach(box => box.remove());
    
    // Get image dimensions
    const imgWidth = imageRef.current.clientWidth;
    const imgHeight = imageRef.current.clientHeight;
    
    // Draw boxes and labels
    detectionResult.detectedObjects.forEach(obj => {
      if (!imageWrapperRef.current) return;
      
      // Create box
      const box = document.createElement('div');
      box.className = 'absolute border-2 bg-opacity-20 flex justify-center items-start';
      box.style.borderColor = obj.color;
      box.style.backgroundColor = `${obj.color}20`;
      
      // Calculate position and size
      const x = obj.x * imgWidth;
      const y = obj.y * imgHeight;
      const width = obj.width * imgWidth;
      const height = obj.height * imgHeight;
      
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
      
      // Create label
      const label = document.createElement('div');
      label.className = 'absolute text-xs font-bold py-1 px-2 rounded whitespace-nowrap text-white';
      label.style.backgroundColor = obj.color;
      label.textContent = `${obj.label} (${Math.round(obj.confidence * 100)}%)`;
      label.style.left = `${x}px`;
      label.style.top = `${y - 20}px`;
      
      // Add elements to the image wrapper (null check is already done at the start of the loop)
      imageWrapperRef.current.appendChild(box);
      imageWrapperRef.current.appendChild(label);
    });
  }, [detectionResult]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        YOLOv11n Space Station Object Detection
      </h1>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Detect Space Station Objects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload an image</Label>
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleDetect} 
                disabled={!selectedFile || isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {isLoading ? 'Detecting...' : 'Detect Objects'}
              </Button>
              <Button 
                onClick={handleClear}
                variant="outline"
              >
                Clear
              </Button>
            </div>
            
            {imagePreview && (
              <div className="mt-6 border rounded-md p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {detectionResult ? 'Detection Results' : 'Image Preview'}
                </h2>
                
                <div 
                  ref={imageWrapperRef}
                  className="relative inline-block mx-auto"
                >
                  <img 
                    ref={imageRef}
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-[400px] max-w-full border rounded-md"
                  />
                </div>
                
                {detectionResult && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Detected {detectionResult.detectedObjects.length} objects:
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {detectionResult.detectedObjects.map((obj, idx) => (
                        <div 
                          key={obj.id}
                          className="p-4 rounded-md shadow-sm"
                          style={{ borderLeft: `4px solid ${obj.color}` }}
                        >
                          <h4 className="font-semibold" style={{ color: obj.color }}>
                            {idx + 1}. {obj.label}
                          </h4>
                          <p className="text-sm"><span className="font-medium">Confidence:</span> {Math.round(obj.confidence * 100)}%</p>
                          <p className="text-sm"><span className="font-medium">Context:</span> {obj.context}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <p><span className="font-medium">Detection Method:</span> {detectionResult.source}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}