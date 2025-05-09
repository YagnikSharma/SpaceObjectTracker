import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping this from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Detection object schema
export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  objects: jsonb("objects").notNull(),
});

export const insertDetectionSchema = createInsertSchema(detections).pick({
  imageUrl: true,
  objects: true,
});

// Chat message schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  detectionId: integer("detection_id").references(() => detections.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  detectionId: true,
  role: true,
  content: true,
});

// Feedback schema
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  detectionId: integer("detection_id").references(() => detections.id, { onDelete: "cascade" }),
  accuracy: integer("accuracy").notNull(), // 1-5 rating
  missedObjects: text("missed_objects"), // Text description of objects the model missed
  falseDetections: text("false_detections"), // Text description of false detections
  suggestions: text("suggestions"), // User suggestions for improvement
  email: text("email"), // Optional user email for contact
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  detectionId: true,
  accuracy: true,
  missedObjects: true,
  falseDetections: true,
  suggestions: true,
  email: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDetection = z.infer<typeof insertDetectionSchema>;
export type Detection = typeof detections.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Define Zod schemas for API requests/responses
export const detectedObjectSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string().optional(),
  originalClass: z.string().optional(), // Original COCO-SSD class for debugging
  context: z.string().optional(), // Space station context category (TOOLS, GAUGES, etc.)
  issue: z.string().optional(), // Detected issue with the component
  referenceLink: z.string().optional(), // Link to official documentation
});

export const chatCompletionRequestSchema = z.object({
  message: z.string(),
  detectedObjects: z.array(detectedObjectSchema),
});

export type DetectedObject = z.infer<typeof detectedObjectSchema>;
export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;
