import { Detection, User, InsertUser, InsertDetection, ChatMessage, InsertChatMessage } from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Detection methods
  getDetection(id: number): Promise<Detection | undefined>;
  listDetections(limit?: number): Promise<Detection[]>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  
  // Chat message methods
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByDetection(detectionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private detections: Detection[] = [];
  private chatMessages: ChatMessage[] = [];
  private userId = 1;
  private detectionId = 1;
  private chatMessageId = 1;
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.userId++,
      ...user,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
  
  // Detection methods
  async getDetection(id: number): Promise<Detection | undefined> {
    return this.detections.find(detection => detection.id === id);
  }
  
  async listDetections(limit: number = 20): Promise<Detection[]> {
    return [...this.detections]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async createDetection(detection: InsertDetection): Promise<Detection> {
    // Ensure objects array is properly typed
    const newDetection: Detection = {
      id: this.detectionId++,
      imageUrl: detection.imageUrl,
      objects: detection.objects,
      createdAt: new Date()
    };
    this.detections.push(newDetection);
    return newDetection;
  }
  
  // Chat message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.find(message => message.id === id);
  }
  
  async getChatMessagesByDetection(detectionId: number): Promise<ChatMessage[]> {
    return this.chatMessages
      .filter(message => message.detectionId === detectionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: this.chatMessageId++,
      ...message,
      createdAt: new Date()
    };
    this.chatMessages.push(newMessage);
    return newMessage;
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();