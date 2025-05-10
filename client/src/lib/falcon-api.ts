import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "@shared/schema";

export interface FalconApiResponse {
  detectedObjects: DetectedObject[];
  imageUrl: string;
  detectionId: number;
  source: string;
  stats: {
    objectsDetected: number;
    priorityObjectsDetected: number;
    detectionMethod: string;
  };
}

export const OBJECT_COLORS: Record<string, string> = {
  'toolbox': '#ffc107',         // yellow
  'oxygen tank': '#2196f3',     // blue
  'fire extinguisher': '#f44336', // red
  default: "#EF4444",           // red
};

export async function uploadImageToFalcon(file: File): Promise<FalconApiResponse> {
  const formData = new FormData();
  formData.append('image', file);

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