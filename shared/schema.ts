import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";

// Define the detected object schema
export const detectedObjectSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  originalClass: z.string().optional(),
  color: z.string().optional(),
  context: z.string().optional(),
  issue: z.string().optional(),
  referenceLink: z.string().optional(),
});

export type DetectedObject = z.infer<typeof detectedObjectSchema>;

// Schema for chat completion requests
export const chatCompletionRequestSchema = z.object({
  message: z.string(),
  detectionId: z.number().optional(),
  detectedObjects: z.array(detectedObjectSchema).optional(),
});

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;

// Database schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  objects: json("objects").$type<DetectedObject[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  detectionId: integer("detection_id").references(() => detections.id).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDetectionSchema = createInsertSchema(detections).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });

// Types for inserts
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDetection = {
  imageUrl: string;
  objects: DetectedObject[];
};
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Types for selects
export type User = typeof users.$inferSelect;
export type Detection = typeof detections.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;