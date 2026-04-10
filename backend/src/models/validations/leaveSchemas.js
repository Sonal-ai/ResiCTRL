import { z } from 'zod';

export const applyLeaveSchema = z.object({
  studentId: z.string().uuid({ message: "Valid studentId is required" }),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  reason: z.string().min(5, { message: "Reason must be at least 5 characters long" })
});
