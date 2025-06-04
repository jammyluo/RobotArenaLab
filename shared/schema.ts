import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  affiliation: text("affiliation"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  modelType: text("model_type").notNull(), // 'humanoid', 'quadruped', 'manipulator'
  accuracy: real("accuracy"),
  trainingTime: integer("training_time"), // in hours
  size: integer("size"), // in bytes
  filePath: text("file_path"),
  isPublic: boolean("is_public").default(false),
  downloads: integer("downloads").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trainingJobs = pgTable("training_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  modelId: integer("model_id"),
  status: text("status").notNull(), // 'queued', 'running', 'completed', 'failed'
  progress: integer("progress").default(0), // 0-100
  currentEpoch: integer("current_epoch").default(0),
  totalEpochs: integer("total_epochs").notNull(),
  rewardConfig: jsonb("reward_config"),
  modelFile: text("model_file"),
  rewardFile: text("reward_file"),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const trainingMetrics = pgTable("training_metrics", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  epoch: integer("epoch").notNull(),
  loss: real("loss"),
  reward: real("reward"),
  accuracy: real("accuracy"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  modelId: integer("model_id"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const validationSessions = pgTable("validation_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modelId: integer("model_id").notNull(),
  robotType: text("robot_type").notNull(),
  status: text("status").notNull(), // 'pending', 'active', 'completed'
  duration: integer("duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  createdAt: true,
  downloads: true,
  likes: true,
});

export const insertTrainingJobSchema = createInsertSchema(trainingJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
  progress: true,
  currentEpoch: true,
});

export const insertTrainingMetricSchema = createInsertSchema(trainingMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  likes: true,
  comments: true,
});

export const insertValidationSessionSchema = createInsertSchema(validationSessions).omit({
  id: true,
  createdAt: true,
  duration: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;

export type TrainingJob = typeof trainingJobs.$inferSelect;
export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;

export type TrainingMetric = typeof trainingMetrics.$inferSelect;
export type InsertTrainingMetric = z.infer<typeof insertTrainingMetricSchema>;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type ValidationSession = typeof validationSessions.$inferSelect;
export type InsertValidationSession = z.infer<typeof insertValidationSessionSchema>;
