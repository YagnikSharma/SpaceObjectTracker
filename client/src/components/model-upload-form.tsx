import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const PRIORITY_CATEGORIES = ['toolbox', 'fire extinguisher', 'oxygen tank'];

export function ModelUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modelName, setModelName] = useState('custom-space-objects.pt');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's a pytorch model file (.pt or .pth)
      if (!selectedFile.name.endsWith('.pt') && !selectedFile.name.endsWith('.pth')) {
        setError('Please upload a valid PyTorch model file (.pt or .pth)');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Auto-set model name based on file name
      setModelName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a model file to upload');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('model', file);
      formData.append('modelName', modelName);
      formData.append('classes', JSON.stringify(PRIORITY_CATEGORIES));
      
      const response = await fetch('/api/upload-model', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload model');
      }
      
      setSuccess(true);
      console.log('Model uploaded successfully:', result);
    } catch (err) {
      console.error('Error uploading model:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setModelName('custom-space-objects.pt');
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border dark:border-blue-800/50 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <CardTitle className="text-xl">Upload Trained Model</CardTitle>
        <CardDescription className="text-blue-100">
          Upload your AI model trained for space object detection
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {/* File upload area */}
          <div className="border-2 border-dashed dark:border-blue-700/50 border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
               onClick={() => document.getElementById('model-file-input')?.click()}>
            <Upload className="mx-auto h-8 w-8 mb-2 text-blue-500" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Click to select or drop model file (.pt)'}
            </p>
            {file && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            <input 
              id="model-file-input"
              type="file" 
              accept=".pt,.pth"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {/* Model name input */}
          <div className="space-y-2">
            <label htmlFor="model-name" className="text-sm font-medium">
              Model Name
            </label>
            <Input 
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Enter model name"
              className="dark:bg-blue-950/20"
            />
          </div>
          
          {/* Object classes info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Target Object Classes</h4>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_CATEGORIES.map((category) => (
                <span key={category} className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-800 dark:text-blue-200">
                  {category}
                </span>
              ))}
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/30">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Success message */}
          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800/30">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Model uploaded successfully! The system will now use your custom model for object detection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t dark:border-blue-800/30 pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="dark:border-blue-800 dark:text-blue-300"
          >
            Reset
          </Button>
          
          <Button 
            type="submit"
            disabled={!file || loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload Model
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}