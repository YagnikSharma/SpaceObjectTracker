import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema, DetectedObject } from "@shared/schema";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { generateComponentAnalysis, enhanceDetectionWithContext, generateSyntheticTrainingImages, SPACE_STATION_ELEMENTS } from "./services/falcon-service";
import { spaceStationDetector, PRIORITY_CATEGORIES } from "./services/space-station-detector";
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

  // Space object detection endpoint with YOLOv8 model
  app.post("/api/detect", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log("Processing image with YOLOv8 space station detector...");
      
      // Detect objects using our comprehensive detector
      const result = await spaceStationDetector.detectObjectsInImage(
        req.file.buffer, 
        req.file.originalname || 'unknown.jpg'
      );
      
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
        source: result.detectionMethod,
        stats: {
          priorityObjectsDetected: priorityObjects.length,
          humansDetected: humanObjects.length,
          detectionMethod: result.detectionMethod
        }
      });
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
      // Get training statistics
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
      
      // Map paths to URLs
      const imageUrls = imagePaths.map(p => {
        const relativePath = p.replace(process.cwd(), '');
        return `/${relativePath.startsWith('/') ? relativePath.substring(1) : relativePath}`;
      });
      
      res.status(200).json({
        success: true,
        category,
        imageCount,
        imageUrls,
        message: `Generated ${imageCount} synthetic ${category} images`
      });
    } catch (error) {
      console.error("Error generating synthetic images:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate synthetic images" 
      });
    }
  });
  
  // Get synthetic image categories endpoint
  app.get("/api/synthetic-categories", async (req: Request, res: Response) => {
    try {
      // Return available categories
      res.status(200).json({
        success: true,
        categories: Object.keys(SPACE_STATION_ELEMENTS),
        examples: {
          TOOLS: SPACE_STATION_ELEMENTS.TOOLS.slice(0, 3),
          GAUGES: SPACE_STATION_ELEMENTS.GAUGES.slice(0, 3),
          STRUCTURAL: SPACE_STATION_ELEMENTS.STRUCTURAL.slice(0, 3),
          EMERGENCY: SPACE_STATION_ELEMENTS.EMERGENCY.slice(0, 3)
        }
      });
    } catch (error) {
      console.error("Error retrieving synthetic categories:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve synthetic categories" 
      });
    }
  });
  
  // Generate PDF report endpoint
  app.get("/api/export-pdf/:detectionId", async (req: Request, res: Response) => {
    try {
      const { detectionId } = req.params;
      
      // Check if detectionId is valid
      const detection = await storage.getDetection(parseInt(detectionId));
      if (!detection) {
        return res.status(404).json({ error: "Detection not found" });
      }
      
      // Create PDF filename
      const pdfFilename = `space_detection_report_${detectionId}.pdf`;
      const pdfPath = path.join(process.cwd(), 'uploads', pdfFilename);
      
      // Generate PDF (imported from client-side in a real implementation)
      // Here we're just creating a simple file for demonstration
      const content = `SPACE STATION DETECTION REPORT #${detectionId}\n\n` +
                      `Date: ${new Date().toISOString()}\n` +
                      `Image: ${detection.imageUrl}\n` +
                      `Objects Detected: ${detection.objects.length}\n\n` +
                      `DETECTED OBJECTS:\n` +
                      detection.objects.map(obj => 
                        `- ${obj.label} (Confidence: ${(obj.confidence * 100).toFixed(1)}%)\n  ${obj.context || 'No context'}`
                      ).join('\n\n');
      
      fs.writeFileSync(pdfPath, content);
      
      // Send file
      res.download(pdfPath, pdfFilename, (err) => {
        if (err) {
          console.error("Error sending PDF:", err);
        }
        
        // Delete file after sending
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate PDF" 
      });
    }
  });
  
  // Mission control history endpoint
  app.get("/api/mission-control/history", async (req: Request, res: Response) => {
    try {
      // Get detection history from storage
      const detections = await storage.listDetections(10);
      
      // Format response
      const history = detections.map(detection => ({
        id: detection.id,
        timestamp: detection.createdAt,
        imageUrl: detection.imageUrl,
        objectCount: detection.objects.length,
        priorityObjects: detection.objects.filter(obj => 
          PRIORITY_CATEGORIES.some(category => 
            obj.label.toLowerCase().includes(category.toLowerCase())
          )
        ).length
      }));
      
      res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error("Error retrieving history:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve history" 
      });
    }
  });
  
  // Mission control detection details endpoint
  app.get("/api/mission-control/detection/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get detection from storage
      const detection = await storage.getDetection(parseInt(id));
      if (!detection) {
        return res.status(404).json({ error: "Detection not found" });
      }
      
      // Get chat messages for this detection
      const chatMessages = await storage.getChatMessagesByDetection(detection.id);
      
      res.status(200).json({
        success: true,
        detection,
        chatMessages
      });
    } catch (error) {
      console.error("Error retrieving detection details:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to retrieve detection details" 
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
      
      // Import model
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
  
  // AI Chat endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      // Validate request
      const { message, detectionId } = chatCompletionRequestSchema.parse(req.body);
      
      // Get detection from storage
      const detection = await storage.getDetection(detectionId);
      if (!detection) {
        return res.status(404).json({ error: "Detection not found" });
      }
      
      // Create a contextual prompt based on the detection
      let contextPrompt = `You are FALCON, an AI assistant for space station operations. `;
      contextPrompt += `The user is looking at an image with ${detection.objects.length} objects detected: `;
      
      // Add detected objects to context
      detection.objects.forEach(obj => {
        contextPrompt += `${obj.label} (confidence: ${(obj.confidence * 100).toFixed(1)}%), `;
      });
      
      contextPrompt += `\n\nUser question: ${message}`;
      
      // Use OpenAI for chat response
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `You are FALCON, an AI assistant for space station operations.
            You provide concise, helpful information about space station components, safety procedures, and maintenance tasks.
            Base your answers on the objects detected in the image and space station operational knowledge.
            Keep responses under 3 paragraphs, focused on technical solutions.`
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        max_tokens: 500
      });
      
      // Get AI response
      const aiMessage = response.choices[0].message.content || "I'm unable to provide an answer at this time.";
      
      // Store the chat message
      const chatMessage = await storage.createChatMessage({
        detectionId,
        message,
        response: aiMessage
      });
      
      res.status(200).json({
        success: true,
        messageId: chatMessage.id,
        question: message,
        response: aiMessage
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process chat" 
      });
    }
  });

  const server = createServer(app);
  return server;
}