import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema, DetectedObject } from "@shared/schema";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { generateComponentAnalysis, enhanceDetectionWithContext, generateSyntheticTrainingImages, SPACE_STATION_ELEMENTS } from "./services/falcon-service";
import yoloService, { detectSpaceStationObjects, getTrainingStatistics } from "./services/yolo-service";
import { customYOLOService, PRIORITY_CATEGORIES } from "./services/custom-yolo-service";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image file."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API status endpoint
  app.get("/api/status", async (req: Request, res: Response) => {
    try {
      res.status(200).json({ status: "ok", message: "API is operational" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "API is not available" });
    }
  });

  // Space object detection endpoint with custom YOLO model
  app.post("/api/detect", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log("Processing image with accurate object detection...");
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save the image with a unique filename
      const imageName = `space_station_scan_${randomUUID()}.jpg`;
      const imagePath = path.join(uploadsDir, imageName);
      fs.writeFileSync(imagePath, req.file.buffer);
      
      // First try our specialized custom YOLO model that focuses on space station components
      const customResult = await customYOLOService.detectObjects(imagePath);
      
      // If custom detection finds objects, use those results
      if (customResult.success && customResult.detections.length > 0) {
        console.log(`Custom YOLO model detected ${customResult.detections.length} objects`);
        
        // Store detection in database
        const detection = await storage.createDetection({
          imageUrl: `/uploads/${imageName}`,
          objects: customResult.detections,
        });
        
        return res.status(200).json({
          imageUrl: `/uploads/${imageName}`,
          detectedObjects: customResult.detections,
          detectionId: detection.id,
          source: "custom-yolo",
          stats: {
            priorityObjectsDetected: customResult.detections.length,
            trainingImagesCount: customYOLOService.getTrainingStats().imageCount
          }
        });
      }
      
      // If custom model didn't find anything, try the general YOLO model
      const detectedObjects = await detectSpaceStationObjects(req.file.buffer, 800, 600);
            
      // Log priority and human detections
      const priorityObjects = detectedObjects.filter(obj => 
        PRIORITY_CATEGORIES.some(priority => 
          obj.label.toLowerCase().includes(priority.toLowerCase())
        )
      );
      
      const humanObjects = detectedObjects.filter(obj => 
        obj.label.toLowerCase().includes('astronaut') || 
        obj.label.toLowerCase().includes('person')
      );
      
      // Add priority objects to custom YOLO training dataset
      if (priorityObjects.length > 0) {
        priorityObjects.forEach(obj => {
          console.log(`Added detection of ${obj.label} to training data. Total samples: ${customYOLOService.getTrainingStats().imageCount + 1}`);
          
          customYOLOService.addTrainingImage(imagePath, [{
            class: PRIORITY_CATEGORIES.find(cat => obj.label.toLowerCase().includes(cat)) || obj.label,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height
          }]);
        });
        
        // Try to train the model if we have enough data
        if (customYOLOService.getTrainingStats().imageCount >= 5) {
          customYOLOService.trainModel().catch(err => 
            console.error("Error training model:", err)
          );
        }
      }
      
      // Log detection results
      console.log(`YOLOv8 Detection Results:`);
      console.log(`- Total Objects: ${detectedObjects.length}`);
      console.log(`- Priority Objects: ${priorityObjects.length}`);
      console.log(`- Humans Detected: ${humanObjects.length}`);
      
      // Store detection in database
      const detection = await storage.createDetection({
        imageUrl: `/uploads/${imageName}`,
        objects: detectedObjects,
      });

      // Return detection results
      res.status(200).json({
        imageUrl: `/uploads/${imageName}`,
        detectedObjects,
        detectionId: detection.id,
        source: "yolo",
        stats: {
          priorityObjectsDetected: priorityObjects.length,
          humansDetected: humanObjects.length,
          trainingImagesCount: customYOLOService.getTrainingStats().imageCount
        }
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });
  
  // YOLOv8 training statistics endpoint
  app.get("/api/training-stats", async (req: Request, res: Response) => {
    try {
      // Get training statistics from both YOLO services
      const generalStats = getTrainingStatistics();
      const customStats = customYOLOService.getTrainingStats();
      
      res.status(200).json({
        success: true,
        statistics: {
          general: generalStats,
          custom: customStats
        },
        modelInfo: {
          generalModel: {
            name: "YOLOv8 General",
            priorityObjects: yoloService.PRIORITY_OBJECTS,
            colorMapping: {
              humans: "#4caf50", // green
              priorityObjects: "#ffc107", // yellow
              otherObjects: "#f44336" // red
            }
          },
          customModel: {
            name: "Space Station Components Detector",
            targetClasses: PRIORITY_CATEGORIES,
            isModelTrained: customStats.isModelTrained,
            colorMapping: {
              toolbox: "#FF4500", // orange-red
              "fire extinguisher": "#FF0000", // red
              "oxygen tank": "#4169E1" // royal blue
            }
          }
        }
      });
    } catch (error) {
      console.error("Error retrieving training statistics:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve training statistics" 
      });
    }
  });

  // Falcon synthetic image generator endpoint
  app.post("/api/generate-synthetic", async (req: Request, res: Response) => {
    try {
      // Validate request
      const { category, count } = req.body;
      
      // Check if category is valid
      if (!SPACE_STATION_ELEMENTS[category]) {
        return res.status(400).json({ 
          error: "Invalid category. Valid categories are: TOOLS, GAUGES, STRUCTURAL, EMERGENCY" 
        });
      }
      
      const imageCount = parseInt(count) || 5;
      if (imageCount < 1 || imageCount > 10) {
        return res.status(400).json({ error: "Count must be between 1 and 10" });
      }
      
      console.log(`Generating ${imageCount} synthetic ${category} images with Falcon AI...`);
      
      // Generate synthetic images using Falcon AI
      const imagePaths = await generateSyntheticTrainingImages(category, imageCount);
      
      // Return image URLs
      const imageUrls = imagePaths.map(p => {
        // Convert absolute path to relative URL
        const fileName = path.basename(p);
        return `/uploads/${fileName}`;
      });
      
      res.status(200).json({
        success: true,
        category,
        imageCount,
        imageUrls
      });
    } catch (error) {
      console.error("Error generating synthetic images:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate synthetic images" 
      });
    }
  });
  
  // Endpoint for retrieving available categories for Falcon generator
  app.get("/api/synthetic-categories", async (req: Request, res: Response) => {
    try {
      const categories = Object.keys(SPACE_STATION_ELEMENTS);
      res.status(200).json({
        categories
      });
    } catch (error) {
      console.error("Error retrieving categories:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve categories" 
      });
    }
  });
  
  // Export detection result as PDF
  app.get("/api/export-pdf/:detectionId", async (req: Request, res: Response) => {
    try {
      const detectionId = parseInt(req.params.detectionId);
      if (isNaN(detectionId)) {
        return res.status(400).json({ error: "Invalid detection ID" });
      }
      
      // Retrieve detection from storage
      const detection = await storage.getDetection(detectionId);
      if (!detection) {
        return res.status(404).json({ error: "Detection not found" });
      }
      
      // Generate PDF file with detection results
      const pdfFileName = `space_station_detection_${detectionId}.pdf`;
      const pdfPath = path.join(process.cwd(), 'uploads', pdfFileName);
      
      // We'll use streams to avoid loading the full file into memory
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${pdfFileName}`);
      
      // Send the PDF data directly to the response
      // Note: actual PDF generation happens in the frontend with jsPDF
      res.status(200).json({
        detectionId,
        objects: detection.objects,
        imageUrl: detection.imageUrl
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export PDF" 
      });
    }
  });
  
  // Mission control endpoint to get detection history
  app.get("/api/mission-control/history", async (req: Request, res: Response) => {
    try {
      // Get optional limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Retrieve detection history from database
      const detections = await storage.listDetections(limit);
      
      // Transform data for front-end consumption
      const formattedData = detections.map(detection => {
        const objects = detection.objects as DetectedObject[];
        
        // Get summary statistics
        const totalObjects = objects.length;
        
        // Calculate counts by category
        const categoryCounts: Record<string, number> = {};
        objects.forEach(obj => {
          const category = obj.context || "Uncategorized";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Calculate average confidence
        const averageConfidence = objects.length > 0
          ? objects.reduce((sum, obj) => sum + obj.confidence, 0) / objects.length
          : 0;
        
        // Find critical issues
        const issues = objects
          .filter(obj => obj.issue)
          .map(obj => ({
            component: obj.label,
            issue: obj.issue,
            confidence: obj.confidence
          }));
        
        return {
          id: detection.id,
          timestamp: detection.createdAt,
          imageUrl: detection.imageUrl,
          totalObjects,
          categories: categoryCounts,
          averageConfidence,
          issues,
          highestConfidenceObject: objects.length > 0 
            ? objects.reduce((prev, current) => 
                current.confidence > prev.confidence ? current : prev, objects[0])
            : null
        };
      });
      
      res.status(200).json({
        success: true,
        count: formattedData.length,
        detections: formattedData
      });
    } catch (error) {
      console.error("Error fetching detection history:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch detection history" 
      });
    }
  });
  
  // Get specific detection details for mission control
  app.get("/api/mission-control/detection/:id", async (req: Request, res: Response) => {
    try {
      const detectionId = parseInt(req.params.id);
      if (isNaN(detectionId)) {
        return res.status(400).json({ error: "Invalid detection ID" });
      }
      
      // Retrieve detection from storage
      const detection = await storage.getDetection(detectionId);
      if (!detection) {
        return res.status(404).json({ error: "Detection not found" });
      }
      
      // Get chat messages for this detection
      const chatMessages = await storage.getChatMessagesByDetection(detectionId);
      
      // Transform data for front-end consumption
      const formattedData = {
        id: detection.id,
        timestamp: detection.createdAt,
        imageUrl: detection.imageUrl,
        objects: detection.objects,
        chatHistory: chatMessages
      };
      
      res.status(200).json({
        success: true,
        detection: formattedData
      });
    } catch (error) {
      console.error("Error fetching detection details:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch detection details" 
      });
    }
  });

  // Chat completion endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = chatCompletionRequestSchema.parse(req.body);
      
      // Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Extract component information from message or detected objects
      let componentName = "";
      let detectedIssue = "";
      
      // Extract space station component name from user message
      const message = validatedData.message.toLowerCase();
      
      // Try to find component mentioned in the message
      if (message.includes("oxygen")) componentName = "oxygen level gauge";
      else if (message.includes("pressure")) componentName = "pressure gauge";
      else if (message.includes("temperature")) componentName = "temperature gauge";
      else if (message.includes("airlock")) componentName = "airlock";
      else if (message.includes("hatch")) componentName = "hatch seal";
      else if (message.includes("filter") || message.includes("air quality")) componentName = "air filtration unit";
      else if (message.includes("wrench")) componentName = "torque wrench";
      else if (message.includes("drill")) componentName = "power drill";
      
      // Try to identify issue in message
      if (message.includes("leak")) detectedIssue = "air leakage detected";
      else if (message.includes("malfunction")) detectedIssue = "control panel malfunction";
      else if (message.includes("error")) detectedIssue = "calibration error";
      else if (message.includes("reading") && message.includes("fluctuat")) detectedIssue = "fluctuating readings";
      else if (message.includes("crack")) detectedIssue = "gauge glass cracked";
      
      // If no component explicitly mentioned, try to extract from detected objects
      if (!componentName && validatedData.detectedObjects && validatedData.detectedObjects.length > 0) {
        // Find the object with highest confidence
        const highestConfidenceObj = validatedData.detectedObjects.reduce(
          (prev, current) => (current.confidence > prev.confidence ? current : prev),
          validatedData.detectedObjects[0]
        );
        
        componentName = highestConfidenceObj.label;
        
        // Use detected issue if available
        if (highestConfidenceObj.issue) {
          detectedIssue = highestConfidenceObj.issue;
        }
      }
      
      // Generate component analysis using Falcon AI
      const analysis = await generateComponentAnalysis(
        componentName,
        detectedIssue,
        validatedData.detectedObjects
      );
      
      // Generate a unique ID for the response
      const responseId = `chatcmpl-${randomUUID()}`;
      
      // Check if a detectionId was provided to save the chat message
      if (req.body.detectionId) {
        try {
          const detectionId = parseInt(req.body.detectionId);
          
          // Save user message
          await storage.createChatMessage({
            detectionId,
            role: 'user',
            content: validatedData.message
          });
          
          // Save assistant message
          await storage.createChatMessage({
            detectionId,
            role: 'assistant',
            content: analysis
          });
        } catch (dbError) {
          console.error("Error saving chat message:", dbError);
          // Continue execution even if saving fails
        }
      }
      
      res.status(200).json({
        id: responseId,
        content: analysis,
      });
    } catch (error) {
      console.error("Error generating chat completion:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate chat completion" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
