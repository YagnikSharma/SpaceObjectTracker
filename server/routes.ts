import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { chatCompletionRequestSchema } from "@shared/schema";
import { processImageWithFalcon } from "./services/falcon-service";
import { generateChatCompletion } from "./services/openai-service";

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

      // Process image with Falcon API
      const result = await processImageWithFalcon(req.file.buffer);
      
      // Store detection in database
      const detection = await storage.createDetection({
        imageUrl: result.imageUrl,
        objects: result.detectedObjects,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process image" 
      });
    }
  });

  // Chat completion endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = chatCompletionRequestSchema.parse(req.body);
      
      // Generate chat completion using OpenAI
      const completion = await generateChatCompletion(
        validatedData.message,
        validatedData.detectedObjects
      );
      
      res.status(200).json({
        id: completion.id,
        content: completion.content,
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
