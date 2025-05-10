import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "@/components/ui/results-display";

export interface FalconApiResponse {
  detectedObjects: DetectedObject[];
  imageUrl: string;
}

export const OBJECT_COLORS: Record<string, string> = {
  satellite: "#3B82F6",             // blue
  "space debris": "#F59E0B",        // amber
  "space station": "#10B981",       // green
  rocket: "#6366F1",                // indigo
  "space telescope": "#8B5CF6",     // violet
  "space shuttle": "#EC4899",       // pink
  astronaut: "#14B8A6",             // teal
  "space probe": "#06B6D4",         // cyan
  "small satellite": "#0284C7",     // light blue
  "communication satellite": "#2563EB", // blue
  default: "#EF4444",               // red
};

export async function uploadImageToFalcon(file: File, model: string = 'yolov8'): Promise<FalconApiResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('model', model);

  try {
    const response = await fetch('/api/detect', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text || response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function checkFalconApiStatus(): Promise<boolean> {
  try {
    await apiRequest('GET', '/api/status');
    return true;
  } catch (error) {
    return false;
  }
}

export interface ModelUploadResponse {
  success: boolean;
  message: string;
  modelName?: string;
  modelPath?: string;
  classes?: string[];
  error?: string;
}

export async function uploadTrainedModel(
  file: File, 
  options: { 
    modelName?: string, 
    classes?: string[] 
  } = {}
): Promise<ModelUploadResponse> {
  const formData = new FormData();
  formData.append('model', file);
  
  if (options.modelName) {
    formData.append('modelName', options.modelName);
  }
  
  if (options.classes) {
    formData.append('classes', JSON.stringify(options.classes));
  }
  
  try {
    const response = await fetch('/api/upload-model', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status}: ${text || response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to upload model',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
