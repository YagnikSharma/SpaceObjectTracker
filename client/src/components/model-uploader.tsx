import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadTrainedModel } from "@/lib/falcon-api";
import { Loader2 } from "lucide-react";

export const MODEL_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank'];

export function ModelUploader() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState("space-station-objects-v1.pt");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a model file to upload",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const result = await uploadTrainedModel(file, {
        modelName: modelName || undefined,
        classes: MODEL_CATEGORIES
      });
      
      if (result.success) {
        toast({
          title: "Model uploaded successfully",
          description: "The trained model has been integrated into the detection system.",
          variant: "default"
        });
        
        // Reset the form
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "An error occurred during upload",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gradient">
          Import Trained YOLO Model
        </CardTitle>
        <CardDescription>
          Upload a trained YOLOv8 model to improve detection of space station components.
          <br />
          The model should be trained to detect: {MODEL_CATEGORIES.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="e.g., space-station-objects-v1.pt"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model-file">Model File (.pt)</Label>
            <Input
              ref={fileInputRef}
              id="model-file"
              type="file"
              accept=".pt,.pth,.onnx,.tflite,.h5,.keras"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: .pt, .pth, .onnx, .tflite, .h5, .keras
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Model"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}