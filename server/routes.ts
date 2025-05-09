import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema, DetectedObject } from "@shared/schema";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { enhanceDetectionWithContext, generateSyntheticImages, SPACE_CATEGORIES } from "./services/falcon-service";
import { detectSpaceObjects } from "./services/yolo-service";
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

  // Space object detection endpoint
  app.post("/api/detect", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log("Processing image with enhanced Falcon API...");
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save the image with a unique filename
      const imageName = `space_station_scan_${randomUUID()}.jpg`;
      const imagePath = path.join(uploadsDir, imageName);
      fs.writeFileSync(imagePath, req.file.buffer);
      
      // Get image dimensions (approximated if not available)
      const imageWidth = 800; // Default width if not provided
      const imageHeight = 600; // Default height if not provided
      
      // Process image with our space station object detection
      const detectedObjects = await detectSpaceObjects(req.file.buffer, imageWidth, imageHeight);
      
      // Enhance detection with Falcon context - already done in YOLO service
      console.log(`Enhanced Falcon API detected ${detectedObjects.length} objects in the image`);
      
      // Save relative image path to serve statically
      const relativeImagePath = `/uploads/${imageName}`;
      
      // Store detection in database
      const detection = await storage.createDetection({
        imageUrl: relativeImagePath,
        objects: detectedObjects,
      });

      res.status(200).json({
        imageUrl: relativeImagePath,
        detectedObjects,
        detectionId: detection.id
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });

  // Falcon synthetic image generator endpoint
  app.post("/api/generate-synthetic", async (req: Request, res: Response) => {
    try {
      // Validate request
      const { category, count } = req.body;
      
      // Check if category is valid
      if (category !== 'random' && !SPACE_CATEGORIES[category]) {
        return res.status(400).json({ 
          error: "Invalid category. Valid categories are: TOOLS, GAUGES, STRUCTURAL, EMERGENCY, or 'random'" 
        });
      }
      
      const imageCount = parseInt(count) || 5;
      if (imageCount < 1 || imageCount > 10) {
        return res.status(400).json({ error: "Count must be between 1 and 10" });
      }
      
      console.log(`Generating ${imageCount} synthetic ${category} images with Falcon AI...`);
      
      // Generate synthetic images using Falcon AI
      const generatedImages = await generateSyntheticImages({
        category: category as any, 
        count: imageCount
      });
      
      // Format the result for the frontend
      const imageUrls = generatedImages.map((image: any) => ({
        url: image.url,
        prompt: image.prompt,
        filename: image.filename
      }));
      
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
      const categories = Object.keys(SPACE_CATEGORIES);
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
