import { z } from 'zod';

export const processScanSchema = z.object({
  student_id: z.string().uuid({ message: "Valid student_id is required" }),
  timestamp: z.string().or(z.date()),
  type: z.enum(['entry', 'exit']),
  ocr_confidence: z.number().or(z.string()).optional(),
  model_confidence: z.number().or(z.string()).optional(),
  camera_id: z.string().min(1, { message: "Camera Id is required" })
});
