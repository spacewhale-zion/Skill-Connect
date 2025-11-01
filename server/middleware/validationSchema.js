// server/middleware/validationSchemas.js
import { z } from 'zod';

// A reusable location schema, based on your models
const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).min(2, 'Coordinates must be [lng, lat]').max(2, 'Coordinates must be [lng, lat]'),
});

// Schema for: POST /api/auth/register
// Based on server/controllers/authController.js
export const registerSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  location: locationSchema,
  skills: z.array(z.string()).optional(),
  fcmToken: z.string().optional(),
});

// Schema for: POST /api/auth/login
export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for: POST /api/tasks
// Based on server/controllers/taskController.js
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  budget: z.object({
    amount: z.number().positive('Budget amount must be a positive number'),
  }),
  location: locationSchema,
});