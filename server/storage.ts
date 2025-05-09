import { users, type User, type InsertUser, type Detection, type InsertDetection, type DetectedObject, type Feedback, type InsertFeedback, detections, feedback, chatMessages, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface with CRUD methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Detection methods
  getDetection(id: number): Promise<Detection | undefined>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  listDetections(limit?: number): Promise<Detection[]>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  listFeedback(limit?: number): Promise<Feedback[]>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByDetection(detectionId: number): Promise<ChatMessage[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Detection methods
  async getDetection(id: number): Promise<Detection | undefined> {
    const [detection] = await db.select().from(detections).where(eq(detections.id, id));
    return detection || undefined;
  }
  
  async createDetection(insertDetection: InsertDetection): Promise<Detection> {
    const [detection] = await db.insert(detections).values(insertDetection).returning();
    return detection;
  }
  
  async listDetections(limit = 10): Promise<Detection[]> {
    return await db.select()
      .from(detections)
      .orderBy(desc(detections.createdAt))
      .limit(limit);
  }
  
  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db.insert(feedback).values(insertFeedback).returning();
    return feedbackItem;
  }
  
  async listFeedback(limit = 50): Promise<Feedback[]> {
    return await db.select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt))
      .limit(limit);
  }
  
  // Chat methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }
  
  async getChatMessagesByDetection(detectionId: number): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.detectionId, detectionId))
      .orderBy(chatMessages.createdAt);
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
