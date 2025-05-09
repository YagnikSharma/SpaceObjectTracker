import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MODEL_CATEGORIES, ModelUploader } from "@/components/model-uploader";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, InfoIcon } from "lucide-react";

interface ModelStats {
  general: {
    totalSamples: number;
    modelAccuracy: number;
    lastTrained: string;
  };
  custom: {
    imageCount: number;
    labelCount: number;
    classDistribution: Record<string, number>;
    isModelTrained: boolean;
    targetClasses: string[];
  };
}

export default function ModelManager() {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/training-stats");
        if (response && response.statistics) {
          setStats(response.statistics);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError("Failed to load model statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Model Manager</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detection Model Status</CardTitle>
            <CardDescription>
              Current status of detection models for space station components
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : stats ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Custom Space Station Components Model</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={stats.custom.isModelTrained ? "text-green-500" : "text-amber-500"}>
                        {stats.custom.isModelTrained ? "Trained" : "Not Trained"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Training Images:</span>
                      <span>{stats.custom.imageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Labels:</span>
                      <span>{stats.custom.labelCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Target Classes:</span>
                      <div className="flex gap-1">
                        {MODEL_CATEGORIES.map((category) => (
                          <span 
                            key={category}
                            className="px-2 py-0.5 bg-primary/10 rounded-full text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {!stats.custom.isModelTrained && stats.custom.imageCount < 5 && (
                      <Alert className="mt-4">
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Training Required</AlertTitle>
                        <AlertDescription>
                          {5 - stats.custom.imageCount} more training images needed before model training can begin.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">General Object Detection Model</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-500">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Training Samples:</span>
                      <span>{stats.general.totalSamples}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Accuracy:</span>
                      <span>{(stats.general.modelAccuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <ModelUploader />
      </div>
    </div>
  );
}