import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "@/components/ui/results-display";

export interface FalconApiResponse {
  detectedObjects: DetectedObject[];
  imageUrl: string;
}

export const OBJECT_COLORS: Record<string, string> = {
  satellite: "#3B82F6", // blue
  debris: "#F59E0B",    // amber
  station: "#10B981",   // green
  rocket: "#6366F1",    // indigo
  telescope: "#8B5CF6", // violet
  default: "#EF4444",   // red
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
