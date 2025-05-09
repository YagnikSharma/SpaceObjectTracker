import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DetectedObject } from "./results-display";

interface FeedbackFormProps {
  detectedObjects: DetectedObject[];
}

export function FeedbackForm({ detectedObjects }: FeedbackFormProps) {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState<string>("general");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [correction, setCorrection] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [contactEmail, setContactEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText && feedbackType !== "correction") {
      toast({
        title: "Feedback Required",
        description: "Please provide some feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (feedbackType === "correction" && !correction) {
      toast({
        title: "Correction Required",
        description: "Please specify the correct label for the selected object.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare feedback data
      const feedbackData = {
        type: feedbackType,
        feedback: feedbackText,
        objectId: selectedObjectId,
        correction: correction,
        includeImage: includeImage,
        contactEmail: contactEmail || null,
        timestamp: new Date().toISOString(),
        detectedObjects: feedbackType !== "general" ? detectedObjects : null
      };
      
      // In a real application, this would submit to the server
      // Here we'll just simulate it
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success toast
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve the Syndetect system!",
        variant: "default",
      });
      
      // Reset form
      setFeedbackText("");
      setSelectedObjectId(null);
      setCorrection("");
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-[#1a1f2c]/70 backdrop-blur-md border border-[#2a3348] shadow-lg overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <CardTitle className="text-md font-semibold ml-2 text-blue-300">Model Feedback</CardTitle>
          </div>
          <CardDescription className="text-blue-300/70">
            Help improve the system by providing feedback on detection results.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="feedback-type" className="text-blue-300">Feedback Type</Label>
            <Select 
              value={feedbackType} 
              onValueChange={(value) => {
                setFeedbackType(value);
                if (value !== "correction") {
                  setSelectedObjectId(null);
                }
              }}
            >
              <SelectTrigger className="bg-[#2a3348]/50 border-[#3a4358] text-blue-200">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2c] border-[#3a4358]">
                <SelectItem value="general" className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100">General Feedback</SelectItem>
                <SelectItem value="missedObject" className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100">Missed Object</SelectItem>
                <SelectItem value="correction" className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100">Label Correction</SelectItem>
                <SelectItem value="falsePositive" className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100">False Detection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {feedbackType === "correction" && detectedObjects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="object-selection" className="text-blue-300">Select Object to Correct</Label>
              <Select 
                value={selectedObjectId || ""} 
                onValueChange={setSelectedObjectId}
              >
                <SelectTrigger className="bg-[#2a3348]/50 border-[#3a4358] text-blue-200">
                  <SelectValue placeholder="Select an object" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2c] border-[#3a4358]">
                  {detectedObjects.map(obj => (
                    <SelectItem 
                      key={obj.id} 
                      value={obj.id}
                      className="text-blue-200 focus:bg-blue-500/20 focus:text-blue-100"
                    >
                      {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {feedbackType === "correction" && selectedObjectId && (
            <div className="space-y-2">
              <Label htmlFor="correction" className="text-blue-300">Correct Label</Label>
              <Input 
                id="correction"
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                className="bg-[#2a3348]/50 border-[#3a4358] text-blue-200 focus-visible:ring-blue-500"
                placeholder="Enter the correct label for this object"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-blue-300">Your Feedback</Label>
            <Textarea 
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[100px] bg-[#2a3348]/50 border-[#3a4358] text-blue-200 focus-visible:ring-blue-500"
              placeholder="Describe your feedback, suggestions or corrections..."
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-300">Contact Email (Optional)</Label>
              <Input 
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-[#2a3348]/50 border-[#3a4358] text-blue-200 focus-visible:ring-blue-500"
                placeholder="your@email.com"
              />
              <p className="text-xs text-blue-300/60">
                We may contact you for clarification if needed.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 self-end">
              <Switch
                id="include-image"
                checked={includeImage}
                onCheckedChange={setIncludeImage}
              />
              <Label htmlFor="include-image" className="text-blue-300">Include detection image</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-blue-300/60 italic">
            Your feedback helps train our AI models.
          </div>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}