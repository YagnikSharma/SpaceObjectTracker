import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import { tensorflowDetector } from "./services/tensorflow-detector";
import { enhanceObjectsWithContext, generateComponentAnalysis } from "./services/context-service";
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

// Define our priority objects
const PRIORITY_OBJECTS = [
  'toolbox',
  'oxygen tank',
  'fire extinguisher'
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // API status endpoint
  app.get("/api/status", async (req: Request, res: Response) => {
    try {
      res.status(200).json({ status: "ok", message: "API is operational" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "API is not available" });
    }
  });
  
  // Object detection endpoint
  app.post("/api/detect", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      // Save the uploaded image to disk
      const filename = `space_station_scan_${randomUUID().substring(0, 8)}.jpg`;
      const filePath = path.join('uploads', filename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      console.log(`Processing image at path: ${filePath}`);
      
      // Use TensorFlow COCO-SSD model for detection
      const result = await tensorflowDetector.detectObjects(filePath);
      
      // Enhance objects with contextual information
      const enhancedObjects = await enhanceObjectsWithContext(result.detectedObjects);
      
      // Count priority objects
      const priorityObjects = enhancedObjects.filter(obj => 
        PRIORITY_OBJECTS.some(category => 
          obj.label.toLowerCase().includes(category.toLowerCase())
        )
      );
      
      // Log detection results
      console.log(`Space Station Detection Results:`);
      console.log(`- Total Objects: ${enhancedObjects.length}`);
      console.log(`- Priority Objects: ${priorityObjects.length}`);
      console.log(`- Detection Method: ${result.detectionMethod}`);
      
      // Generate image URL
      const imageUrl = `/uploads/${filename}`;
      
      // Store detection in database
      const detection = await storage.createDetection({
        imageUrl: imageUrl,
        objects: enhancedObjects,
      });
      
      // Return detection results
      res.status(200).json({
        imageUrl: imageUrl,
        detectedObjects: enhancedObjects,
        detectionId: detection.id,
        source: result.detectionMethod,
        stats: {
          objectsDetected: enhancedObjects.length,
          priorityObjectsDetected: priorityObjects.length,
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
  
  // Export detection result as PDF (stub)
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
      
      // We'll use streams to avoid loading the full file into memory
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=detection_${detectionId}.json`);
      
      // Send the data directly to the response
      // Note: actual PDF generation happens in the frontend with jsPDF
      res.status(200).json({
        detectionId,
        objects: detection.objects,
        imageUrl: detection.imageUrl
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export data" 
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
        const objects = detection.objects;
        
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
        
        // Find issues
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
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
        });
      }
      
      // Initialize OpenAI client
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Extract component information from message or detected objects
      let componentName = "";
      let detectedIssue = "";
      
      // Extract space station component name from user message
      const message = validatedData.message.toLowerCase();
      
      // Try to find component mentioned in the message
      if (message.includes("oxygen")) componentName = "oxygen tank";
      else if (message.includes("fire") || message.includes("extinguisher")) componentName = "fire extinguisher";
      else if (message.includes("tool") || message.includes("toolbox")) componentName = "toolbox";
      
      // Try to identify issue in message
      if (message.includes("leak")) detectedIssue = "air leakage detected";
      else if (message.includes("malfunction")) detectedIssue = "control panel malfunction";
      else if (message.includes("error")) detectedIssue = "calibration error";
      else if (message.includes("reading") && message.includes("fluctuat")) detectedIssue = "fluctuating readings";
      else if (message.includes("crack")) detectedIssue = "structural damage detected";
      
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
      
      // Generate component analysis
      const analysis = await generateComponentAnalysis(
        componentName,
        detectedIssue,
        validatedData.detectedObjects
      );
      
      // Generate prompt with technical context
      const systemPrompt = `
You are ASTROSCAN, the International Space Station's AI assistant.
Respond in a professional technical tone using space terminology when appropriate.
Always limit responses to 2-3 short paragraphs.
Include technical details when responding to astronaut's questions about station equipment.
Focus primarily on addressing safety concerns, operational issues, and maintenance protocols.

Current component being discussed: ${componentName || "Unknown component"}
${detectedIssue ? `Detected issue: ${detectedIssue}` : ""}
Component analysis: ${analysis}
`;

      // Create a response ID for this chat
      const responseId = `chatcmpl-${randomUUID()}`;
      
      // Make API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: validatedData.message,
          },
        ],
        max_tokens: 450,
      });
      
      // Store message and response in database if detection ID is provided
      if (validatedData.detectionId) {
        try {
          await storage.createChatMessage({
            detectionId: validatedData.detectionId,
            role: "user",
            content: validatedData.message,
          });
          
          await storage.createChatMessage({
            detectionId: validatedData.detectionId,
            role: "assistant",
            content: completion.choices[0].message.content || "",
          });
        } catch (dbError) {
          console.error("Failed to store chat messages:", dbError);
          // Continue even if storage fails
        }
      }
      
      // Return the chat response
      res.status(200).json({
        id: responseId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-4o",
        choices: [
          {
            message: {
              role: "assistant",
              content: completion.choices[0].message.content,
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
      });
    } catch (error) {
      console.error("Error generating chat response:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to generate response",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}