import { 
  users, models, trainingJobs, trainingMetrics, communityPosts, validationSessions,
  type User, type InsertUser,
  type Model, type InsertModel,
  type TrainingJob, type InsertTrainingJob,
  type TrainingMetric, type InsertTrainingMetric,
  type CommunityPost, type InsertCommunityPost,
  type ValidationSession, type InsertValidationSession
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Models
  getModels(userId?: number): Promise<Model[]>;
  getModel(id: number): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: number, updates: Partial<Model>): Promise<Model | undefined>;
  deleteModel(id: number): Promise<boolean>;

  // Training Jobs
  getTrainingJobs(userId?: number): Promise<TrainingJob[]>;
  getTrainingJob(id: number): Promise<TrainingJob | undefined>;
  createTrainingJob(job: InsertTrainingJob): Promise<TrainingJob>;
  updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob | undefined>;

  // Training Metrics
  getTrainingMetrics(jobId: number): Promise<TrainingMetric[]>;
  createTrainingMetric(metric: InsertTrainingMetric): Promise<TrainingMetric>;

  // Community Posts
  getCommunityPosts(): Promise<(CommunityPost & { user: User; model?: Model })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost | undefined>;

  // Validation Sessions
  getValidationSessions(userId?: number): Promise<ValidationSession[]>;
  createValidationSession(session: InsertValidationSession): Promise<ValidationSession>;
  updateValidationSession(id: number, updates: Partial<ValidationSession>): Promise<ValidationSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private models: Map<number, Model> = new Map();
  private trainingJobs: Map<number, TrainingJob> = new Map();
  private trainingMetrics: Map<number, TrainingMetric> = new Map();
  private communityPosts: Map<number, CommunityPost> = new Map();
  private validationSessions: Map<number, ValidationSession> = new Map();
  
  private currentUserId = 1;
  private currentModelId = 1;
  private currentJobId = 1;
  private currentMetricId = 1;
  private currentPostId = 1;
  private currentSessionId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed users
    const user1: User = {
      id: 1,
      username: "johndoe",
      password: "password",
      email: "john@example.com",
      fullName: "John Doe",
      affiliation: "Researcher",
      avatar: null,
      createdAt: new Date()
    };
    this.users.set(1, user1);
    this.currentUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Models
  async getModels(userId?: number): Promise<Model[]> {
    const allModels = Array.from(this.models.values());
    if (userId) {
      return allModels.filter(model => model.userId === userId || model.isPublic);
    }
    return allModels.filter(model => model.isPublic);
  }

  async getModel(id: number): Promise<Model | undefined> {
    return this.models.get(id);
  }

  async createModel(insertModel: InsertModel): Promise<Model> {
    const id = this.currentModelId++;
    const model: Model = {
      ...insertModel,
      id,
      downloads: 0,
      likes: 0,
      createdAt: new Date()
    };
    this.models.set(id, model);
    return model;
  }

  async updateModel(id: number, updates: Partial<Model>): Promise<Model | undefined> {
    const model = this.models.get(id);
    if (!model) return undefined;
    
    const updatedModel = { ...model, ...updates };
    this.models.set(id, updatedModel);
    return updatedModel;
  }

  async deleteModel(id: number): Promise<boolean> {
    return this.models.delete(id);
  }

  // Training Jobs
  async getTrainingJobs(userId?: number): Promise<TrainingJob[]> {
    const allJobs = Array.from(this.trainingJobs.values());
    if (userId) {
      return allJobs.filter(job => job.userId === userId);
    }
    return allJobs;
  }

  async getTrainingJob(id: number): Promise<TrainingJob | undefined> {
    return this.trainingJobs.get(id);
  }

  async createTrainingJob(insertJob: InsertTrainingJob): Promise<TrainingJob> {
    const id = this.currentJobId++;
    const job: TrainingJob = {
      ...insertJob,
      id,
      progress: 0,
      currentEpoch: 0,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null
    };
    this.trainingJobs.set(id, job);
    return job;
  }

  async updateTrainingJob(id: number, updates: Partial<TrainingJob>): Promise<TrainingJob | undefined> {
    const job = this.trainingJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.trainingJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Training Metrics
  async getTrainingMetrics(jobId: number): Promise<TrainingMetric[]> {
    return Array.from(this.trainingMetrics.values())
      .filter(metric => metric.jobId === jobId)
      .sort((a, b) => a.epoch - b.epoch);
  }

  async createTrainingMetric(insertMetric: InsertTrainingMetric): Promise<TrainingMetric> {
    const id = this.currentMetricId++;
    const metric: TrainingMetric = {
      ...insertMetric,
      id,
      timestamp: new Date()
    };
    this.trainingMetrics.set(id, metric);
    return metric;
  }

  // Community Posts
  async getCommunityPosts(): Promise<(CommunityPost & { user: User; model?: Model })[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return posts.map(post => {
      const user = this.users.get(post.userId)!;
      const model = post.modelId ? this.models.get(post.modelId) : undefined;
      return { ...post, user, model };
    });
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentPostId++;
    const post: CommunityPost = {
      ...insertPost,
      id,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }

  // Validation Sessions
  async getValidationSessions(userId?: number): Promise<ValidationSession[]> {
    const allSessions = Array.from(this.validationSessions.values());
    if (userId) {
      return allSessions.filter(session => session.userId === userId);
    }
    return allSessions;
  }

  async createValidationSession(insertSession: InsertValidationSession): Promise<ValidationSession> {
    const id = this.currentSessionId++;
    const session: ValidationSession = {
      ...insertSession,
      id,
      duration: 0,
      createdAt: new Date()
    };
    this.validationSessions.set(id, session);
    return session;
  }

  async updateValidationSession(id: number, updates: Partial<ValidationSession>): Promise<ValidationSession | undefined> {
    const session = this.validationSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.validationSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
