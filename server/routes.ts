import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { 
  insertModelSchema, 
  insertTrainingJobSchema, 
  insertCommunityPostSchema,
  insertValidationSessionSchema,
  insertTrainingMetricSchema
} from "@shared/schema";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ========== 模型市场 mock 数据 ==========
const marketplaceModels = [
  {
    id: 1,
    name: "Humanoid Soccer Player",
    description: "A high-performance humanoid robot model for soccer simulation.",
    thumbnailUrl: "/images/humanoid.jpg",
    category: "humanoid",
    tags: ["soccer", "simulation"],
    rating: 4.8,
    downloads: 245,
    price: 0,
    likes: 32,
    license: "MIT",
    author: { id: 1, name: "Dr. Sarah Rodriguez", avatar: "/images/author1.png", affiliation: "MIT CSAIL" },
  },
  {
    id: 2,
    name: "Drone Swarm Controller",
    description: "Controller for multi-agent drone swarms.",
    thumbnailUrl: "/images/drone.jpg",
    category: "drone",
    tags: ["swarm", "controller"],
    rating: 4.6,
    downloads: 198,
    price: 99,
    likes: 21,
    license: "Apache-2.0",
    author: { id: 2, name: "Prof. Michael Kim", avatar: "/images/author2.png", affiliation: "Stanford AI Lab" },
  },
  {
    id: 3,
    name: "Humanoid Soccer Player2",
    description: "A high-performance humanoid robot model for soccer simulation.",
    thumbnailUrl: "/images/humanoid.jpg",
    category: "humanoid",
    tags: ["soccer", "simulation"],
    rating: 4.8,
    downloads: 245,
    price: 0,
    likes: 32,
    license: "MIT",
    author: { id: 1, name: "Dr. Sarah Rodriguez", avatar: "/images/author2.png", affiliation: "MIT CSAIL" },
  },  
];

// ========== 训练页面 mock 数据 ==========
type TrainingMetric = { epoch: number; loss: number; reward: number; accuracy: number };
const mockTrainingJobs = [
  {
    id: 1,
    name: "Job Alpha",
    userId: 1,
    status: "running",
    totalEpochs: 200,
    currentEpoch: 50,
    progress: 25,
    modelId: 1,
    startedAt: new Date(),
    completedAt: null,
  },
  {
    id: 2,
    name: "Job Beta",
    userId: 1,
    status: "completed",
    totalEpochs: 100,
    currentEpoch: 100,
    progress: 100,
    modelId: 2,
    startedAt: new Date(Date.now() - 1000 * 60 * 60),
    completedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

const mockTrainingMetrics: Record<number, TrainingMetric[]> = {
  1: Array.from({ length: 50 }, (_, i) => ({
    epoch: i + 1,
    loss: 0.1 * Math.exp(-i / 30) + Math.random() * 0.02,
    reward: 200 + i * 2 + Math.random() * 10,
    accuracy: 70 + i * 0.5 + Math.random() * 5,
  })),
  2: Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    loss: 0.1 * Math.exp(-i / 40) + Math.random() * 0.01,
    reward: 180 + i * 2.5 + Math.random() * 8,
    accuracy: 65 + i * 0.6 + Math.random() * 4,
  })),
};

// ========== 训练日志 mock 数据 ==========
const mockTrainingLogs: Record<number, { timestamp: string; level: string; message: string }[]> = {
  1: Array.from({ length: 50 }, (_, i) => ({
    timestamp: new Date(Date.now() - (50 - i) * 1000 * 10).toISOString(),
    level: i % 10 === 0 ? 'ERROR' : i % 5 === 0 ? 'WARN' : 'INFO',
    message: `Job 1 log message at epoch ${i + 1}`
  })),
  2: Array.from({ length: 100 }, (_, i) => ({
    timestamp: new Date(Date.now() - (100 - i) * 1000 * 10).toISOString(),
    level: i % 15 === 0 ? 'ERROR' : i % 7 === 0 ? 'WARN' : 'INFO',
    message: `Job 2 log message at epoch ${i + 1}`
  })),
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        // Handle different message types
        switch (data.type) {
          case 'subscribe_training':
            // Subscribe to training updates
            break;
          case 'subscribe_logs':
            // Subscribe to log updates
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Models API
  app.get("/api/models", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const models = await storage.getModels(userId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.post("/api/models", upload.single('modelFile'), async (req, res) => {
    try {
      const modelData = insertModelSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        accuracy: req.body.accuracy ? parseFloat(req.body.accuracy) : null,
        trainingTime: req.body.trainingTime ? parseInt(req.body.trainingTime) : null,
        size: req.file?.size || null,
        filePath: req.file?.path || null,
        isPublic: req.body.isPublic === 'true'
      });

      const model = await storage.createModel(modelData);
      res.json(model);
    } catch (error) {
      res.status(400).json({ message: "Invalid model data" });
    }
  });

  app.patch("/api/models/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const model = await storage.updateModel(id, updates);
      
      if (!model) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Training Jobs API
  app.get("/api/training-jobs", async (req, res) => {
    try {
      // mock 数据优先
      res.json(mockTrainingJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training jobs" });
    }
  });

  app.post("/api/training-jobs", upload.fields([
    { name: 'modelFile', maxCount: 1 },
    { name: 'rewardFile', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const jobData = insertTrainingJobSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        modelId: req.body.modelId ? parseInt(req.body.modelId) : null,
        totalEpochs: parseInt(req.body.totalEpochs),
        rewardConfig: JSON.parse(req.body.rewardConfig || '{}'),
        modelFile: files.modelFile?.[0]?.path || null,
        rewardFile: files.rewardFile?.[0]?.path || null
      });

      const job = await storage.createTrainingJob(jobData);
      
      // Start training simulation
      simulateTraining(job.id, broadcast);
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid training job data" });
    }
  });

  app.patch("/api/training-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const job = await storage.updateTrainingJob(id, updates);
      
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }
      
      // Broadcast update
      broadcast({ type: 'training_update', job });
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update training job" });
    }
  });

  // Training Metrics API
  app.get("/api/training-metrics/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      // mock 数据优先
      if (mockTrainingMetrics[jobId]) {
        res.json(mockTrainingMetrics[jobId]);
        return;
      }
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training metrics" });
    }
  });

  // Community API
  app.get("/api/community/posts", async (req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post("/api/community/posts", async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        modelId: req.body.modelId ? parseInt(req.body.modelId) : null
      });

      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  // Validation Sessions API
  app.get("/api/validation-sessions", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const sessions = await storage.getValidationSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch validation sessions" });
    }
  });

  app.post("/api/validation-sessions", async (req, res) => {
    try {
      const sessionData = insertValidationSessionSchema.parse({
        ...req.body,
        userId: parseInt(req.body.userId),
        modelId: parseInt(req.body.modelId)
      });

      const session = await storage.createValidationSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Training simulation function
  function simulateTraining(jobId: number, broadcast: (data: any) => void) {
    let currentEpoch = 0;
    
    const interval = setInterval(async () => {
      currentEpoch++;
      const job = await storage.getTrainingJob(jobId);
      
      if (!job || currentEpoch > job.totalEpochs) {
        clearInterval(interval);
        if (job) {
          await storage.updateTrainingJob(jobId, { 
            status: 'completed',
            progress: 100,
            completedAt: new Date()
          });
          broadcast({ type: 'training_complete', jobId });
        }
        return;
      }

      // Generate realistic metrics
      const loss = Math.max(0.001, 0.1 * Math.exp(-currentEpoch / 50) + Math.random() * 0.02);
      const reward = Math.min(500, 200 + currentEpoch * 2 + Math.random() * 50);
      const accuracy = Math.min(99, 70 + currentEpoch * 0.5 + Math.random() * 5);
      
      // Save metrics
      await storage.createTrainingMetric({
        jobId,
        epoch: currentEpoch,
        loss,
        reward,
        accuracy
      });

      // Update job progress
      const progress = Math.round((currentEpoch / job.totalEpochs) * 100);
      await storage.updateTrainingJob(jobId, {
        currentEpoch,
        progress,
        status: 'running',
        startedAt: job.startedAt || new Date()
      });

      // Broadcast updates
      broadcast({
        type: 'training_progress',
        jobId,
        epoch: currentEpoch,
        progress,
        metrics: { loss, reward, accuracy }
      });

      broadcast({
        type: 'training_log',
        jobId,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `Epoch ${currentEpoch}/${job.totalEpochs} - Reward: ${reward.toFixed(1)}, Loss: ${loss.toFixed(4)}`
      });
    }, 2000); // Update every 2 seconds
  }

  // ========== API 路由 ==========

  // 获取模型市场列表
  app.get('/api/marketplace/models', (req, res) => {
    res.json(marketplaceModels);
  });

  // 获取模型详情
  app.get('/api/marketplace/models/:id', (req, res) => {
    const id = Number(req.params.id);
    const model = marketplaceModels.find(m => m.id === id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  });

  // 点赞模型
  app.post('/api/marketplace/models/:id/like', (req, res) => {
    const id = Number(req.params.id);
    const model = marketplaceModels.find(m => m.id === id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    model.likes++;
    res.json({ success: true, likes: model.likes });
  });

  // 下载/购买模型
  app.post('/api/marketplace/models/:id/download', (req, res) => {
    const id = Number(req.params.id);
    const model = marketplaceModels.find(m => m.id === id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    model.downloads++;
    res.json({ success: true, downloads: model.downloads });
  });

  // ========== Training Logs API ==========
  // 提供一个接口返回全部日志
  app.get('/api/training-logs/:jobId', (req, res) => {
    const jobId = parseInt(req.params.jobId);
    if (mockTrainingLogs[jobId]) {
      res.json(mockTrainingLogs[jobId]);
    } else {
      res.json([]);
    }
  });

  return httpServer;
}
