import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.enum(['general', 'maintenance', 'hygiene', 'noise', 'food', 'other']).optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'rejected']),
  admin_response: z.string().optional(),
});
