import { users, type User, type InsertUser, type Detection, type InsertDetection, type DetectedObject } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Detection methods
  getDetection(id: number): Promise<Detection | undefined>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  listDetections(limit?: number): Promise<Detection[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private detections: Map<number, Detection>;
  private userCurrentId: number;
  private detectionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.detections = new Map();
    this.userCurrentId = 1;
    this.detectionCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Detection methods
  async getDetection(id: number): Promise<Detection | undefined> {
    return this.detections.get(id);
  }
  
  async createDetection(insertDetection: InsertDetection): Promise<Detection> {
    const id = this.detectionCurrentId++;
    const now = new Date();
    
    const detection: Detection = { 
      ...insertDetection, 
      id, 
      createdAt: now
    };
    
    this.detections.set(id, detection);
    return detection;
  }
  
  async listDetections(limit = 10): Promise<Detection[]> {
    return Array.from(this.detections.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
