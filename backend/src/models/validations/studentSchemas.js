import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  roll_number: z.string().min(1, { message: "Roll number is required" }),
  father_name: z.string().optional(),
  dob: z.string().optional(), // Or z.date(), depending on how client sends it
  hostel_name: z.string().min(1, { message: "Hostel name is required" }),
  block: z.string().optional(),
  floor: z.string().optional(),
  room_number: z.string().min(1, { message: "Room number is required" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  guardian_contact: z.string().min(10, { message: "Guardian contact is required" }),
  image_url: z.string().url().optional().or(z.literal('')),
  userId: z.string().uuid({ message: "Valid userId is required" })
});

export const updateStudentSchema = z.object({
  name: z.string().optional(),
  roll_number: z.string().optional(),
  father_name: z.string().optional(),
  dob: z.string().optional(),
  hostel_name: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  room_number: z.string().optional(),
  phone: z.string().optional(),
  guardian_contact: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional()
});
