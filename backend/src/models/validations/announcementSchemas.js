import { z } from 'zod';

export const ANNOUNCEMENT_CATEGORIES = ['EVENT', 'NOTICE', 'URGENT', 'MESS', 'GENERAL'];
export const ANNOUNCEMENT_PRIORITIES = ['NORMAL', 'IMPORTANT', 'URGENT'];

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.enum(ANNOUNCEMENT_CATEGORIES, { message: 'Invalid category' }),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional().default('NORMAL'),
  hostel_name: z.string().optional().nullable(),  // null = all hostels
  expiry_date: z.string().datetime().optional().nullable(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).optional(),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES).optional(),
  hostel_name: z.string().optional().nullable(),
  expiry_date: z.string().datetime().optional().nullable(),
});
