import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema, DetectedObject } from "@shared/schema";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { generateComponentAnalysis, enhanceDetectionWithContext, generateSyntheticTrainingImages, SPACE_STATION_ELEMENTS } from "./services/falcon-service";
import { spaceStationDetector, PRIORITY_CATEGORIES } from "./services/space-station-detector";
import { spaceStationDetectorV2 } from "./services/space-station-detector-v2";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { yolov5IntegratedBridge } from './services/yolov5-integrated-bridge';

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
  
  // Simple detection endpoint (GET method) for testing all detector models
  app.get("/api/detect", async (req: Request, res: Response) => {
    try {
      const imagePath = req.query.imagePath as string;
      
      if (!imagePath) {
        return res.status(400).json({ error: "No image path provided" });
      }
      
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image file not found" });
      }
      
      console.log(`Processing image at path: ${imagePath}`);
      
      // Check which model to use
      const modelType = req.query.model as string || 'yolov8';
      
      if (modelType === 'yolo11n') {
        console.log("Using YOLOv11n detector model...");
        // Process with the YOLOv11n detector
        const result = await spaceStationDetectorV2.processImage(imagePath);
        
        res.status(200).json({
          success: true,
          detections: result.detectedObjects,
          detectionMethod: 'yolo11n',
          count: result.detectedObjects.length
        });
      } else if (modelType === 'yolov5') {
        console.log("Using YOLOv5 detector model...");
        // Process with the YOLOv5 detector
        const result = await yolov5IntegratedBridge.detectObjects(imagePath);
        
        // Transform detections to match our format
        const detectedObjects = result.detections.map(d => ({
          id: d.id,
          label: d.label,
          confidence: d.confidence,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          color: d.color,
          context: d.context
        }));
        
        res.status(200).json({
          success: true,
          detections: detectedObjects,
          detectionMethod: 'yolov5',
          count: detectedObjects.length
        });
      } else {
        // Default to YOLOv8 detector
        console.log("Using YOLOv8 detector model...");
        const result = await spaceStationDetector.detectObjectsFromPath(imagePath);
        
        res.status(200).json({
          success: true,
          detections: result.detectedObjects,
          detectionMethod: result.detectionMethod,
          count: result.detectedObjects.length
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });

  // Space object detection endpoint with multiple model support
  app.post("/api/detect", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Check which model to use
      const modelType = (req.query.model as string) || (req.body.model as string) || 'yolov8';
      
      // Save the uploaded image to disk first (all detectors need this)
      const filename = `space_station_scan_${randomUUID().substring(0, 8)}.jpg`;
      const filePath = path.join('uploads', filename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      if (modelType === 'yolo11n') {
        console.log("Processing image with YOLOv11n space station detector...");
        
        // Process with the YOLOv11n detector
        const result = await spaceStationDetectorV2.processImage(filePath);
        
        // Count priority objects - all objects are considered priority in yolo11n
        const priorityObjects = result.detectedObjects;
        
        // Count human objects (none in this specialized detector)
        const humanObjects = [];
        
        // Store detection in database
        const detection = await storage.createDetection({
          imageUrl: result.imageUrl,
          objects: result.detectedObjects,
        });
        
        // Return detection results
        res.status(200).json({
          imageUrl: result.imageUrl,
          detectedObjects: result.detectedObjects,
          detectionId: detection.id,
          source: 'yolo11n',
          stats: {
            priorityObjectsDetected: priorityObjects.length,
            humansDetected: 0,
            detectionMethod: 'yolo11n'
          }
        });
      } else if (modelType === 'yolov5') {
        console.log("Processing image with YOLOv5 space station detector...");
        
        // Process with YOLOv5 detector
        const result = await yolov5IntegratedBridge.detectObjects(filePath);
        
        // Transform the detections to match our format
        const detectedObjects = result.detections.map(d => ({
          id: d.id,
          label: d.label,
          confidence: d.confidence,
          x: d.x,
          y: d.y,
          width: d.width,
          height: d.height,
          color: d.color,
          context: d.context
        }));
        
        // All objects in YOLOv5 detector are priority for space station
        const priorityObjects = detectedObjects;
        
        // Count human objects (none in this specialized detector)
        const humanObjects = [];
        
        // Generate image URL
        const imageUrl = `/uploads/${filename}`;
        
        // Store detection in database
        const detection = await storage.createDetection({
          imageUrl: imageUrl,
          objects: detectedObjects,
        });
        
        // Log detection results
        console.log(`YOLOv5 Space Station Detection Results:`);
        console.log(`- Total Objects: ${detectedObjects.length}`);
        console.log(`- Priority Objects: ${priorityObjects.length}`);
        console.log(`- Humans Detected: ${humanObjects.length}`);
        console.log(`- Detection Method: 'yolov5'`);
        
        // Return detection results
        res.status(200).json({
          imageUrl: imageUrl,
          detectedObjects: detectedObjects,
          detectionId: detection.id,
          source: 'yolov5',
          stats: {
            priorityObjectsDetected: priorityObjects.length,
            humansDetected: 0,
            detectionMethod: 'yolov5'
          }
        });
      } else {
        // Default to YOLOv8
        console.log(`Processing image with YOLOv8 space station detector (model: ${modelType})...`);
        
        // Detect objects using our comprehensive detector
        // This will use YOLOv8 under the hood
        const result = await spaceStationDetector.detectObjectsFromPath(filePath);
        
        // Count priority objects
        const priorityObjects = result.detectedObjects.filter(obj => 
          PRIORITY_CATEGORIES.some(category => 
            obj.label.toLowerCase().includes(category.toLowerCase())
          )
        );
        
        // Count human objects
        const humanObjects = result.detectedObjects.filter(obj => 
          obj.label.toLowerCase().includes('astronaut') || 
          obj.label.toLowerCase().includes('person')
        );
        
        // Log detection results
        console.log(`Space Station Detection Results:`);
        console.log(`- Total Objects: ${result.detectedObjects.length}`);
        console.log(`- Priority Objects: ${priorityObjects.length}`);
        console.log(`- Humans Detected: ${humanObjects.length}`);
        console.log(`- Detection Method: ${result.detectionMethod}`);
        
        // Generate image URL
        const imageUrl = `/uploads/${filename}`;
        
        // Store detection in database
        const detection = await storage.createDetection({
          imageUrl: imageUrl,
          objects: result.detectedObjects,
        });
        
        // Return detection results
        res.status(200).json({
          imageUrl: imageUrl,
          detectedObjects: result.detectedObjects,
          detectionId: detection.id,
          source: result.detectionMethod,
          stats: {
            priorityObjectsDetected: priorityObjects.length,
            humansDetected: humanObjects.length,
            detectionMethod: result.detectionMethod
          }
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });
  
  // Model training statistics endpoint
  app.get("/api/training-stats", async (req: Request, res: Response) => {
    try {
      // Check which model to get statistics for
      const modelType = req.query.model as string || 'yolov8';
      
      if (modelType === 'yolo11n') {
        // Return yolo11n model info
        res.status(200).json({
          success: true,
          statistics: {
            totalSamples: 3, // Fixed sample count for the 3 object types
            objectCounts: {
              'toolbox': 1,
              'fire extinguisher': 1,
              'oxygen tank': 1
            },
            modelLoaded: true,
            modelPath: 'models/yolo11n.pt'
          },
          modelInfo: {
            name: "Space Station Object Detector (YOLOv11n)",
            priorityCategories: ['toolbox', 'fire extinguisher', 'oxygen tank'],
            colorMap: {
              'fire extinguisher': '#f44336',  // Red
              'oxygen tank': '#2196f3',        // Blue
              'toolbox': '#ffc107',            // Yellow
            },
            detectionMethods: ['yolo11n']
          }
        });
      } else if (modelType === 'yolov5') {
        // Return yolov5 model info
        res.status(200).json({
          success: true,
          statistics: {
            totalSamples: 3, // Fixed sample count for the 3 object types
            objectCounts: {
              'toolbox': 1,
              'fire extinguisher': 1,
              'oxygen tank': 1
            },
            modelLoaded: true,
            modelPath: 'yolov5/weights/yolov5s.pt'
          },
          modelInfo: {
            name: "Space Station Object Detector (YOLOv5)",
            priorityCategories: ['toolbox', 'fire extinguisher', 'oxygen tank'],
            colorMap: {
              'fire extinguisher': '#f44336',  // Red
              'oxygen tank': '#2196f3',        // Blue
              'toolbox': '#ffc107',            // Yellow
            },
            detectionMethods: ['yolov5']
          }
        });
      } else {
        // Get training statistics for original model
        const stats = spaceStationDetector.getStats();
        
        res.status(200).json({
          success: true,
          statistics: {
            totalSamples: stats.totalSamples,
            objectCounts: stats.objectCounts,
            modelLoaded: stats.modelLoaded,
            modelPath: stats.modelPath
          },
          modelInfo: {
            name: "Space Station Object Detector (YOLOv8)",
            priorityCategories: stats.priorityCategories,
            colorMap: stats.colorMap,
            detectionMethods: stats.detectionMethods
          }
        });
      }
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

  // Upload custom YOLOv8 model endpoint
  app.post("/api/upload-model", upload.single("model"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No model file provided" });
      }
      
      console.log(`Uploading custom model: ${req.file.originalname}`);
      
      // Get original filename or use default
      const originalFilename = req.file.originalname || 'custom_model.pt';
      const modelName = path.basename(originalFilename);
      
      // Import model using the space station detector
      const success = spaceStationDetector.importModel(req.file.buffer, modelName);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to import model" });
      }
      
      res.status(200).json({
        success: true,
        message: `Model ${modelName} imported successfully`,
        modelInfo: spaceStationDetector.getStats()
      });
    } catch (error) {
      console.error("Error uploading model:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to upload model" 
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
