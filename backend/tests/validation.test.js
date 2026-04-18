import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ── Replicate the exact Zod schemas used in controllers ──

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  designation: z.enum(['WARDEN', 'RESI_WARDEN', 'ATTENDANT']).optional(),
  admin_key: z.string().min(1, { message: 'Admin registration key is required' }),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
});

const updatePassSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
});

const hostellerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
  hostel_name: z.string().min(1).optional(),
  room_number: z.string().min(1).optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ── Admin Registration Schema ──
describe('Admin Registration Schema', () => {
  it('should pass with valid data + admin_key', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: 'securePassword123',
      name: 'Test Admin',
      admin_key: 'valid_key',
    });
    expect(result.success).toBe(true);
  });

  it('should reject without admin_key', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: 'securePassword123',
      name: 'Test Admin',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = adminSchema.safeParse({
      email: 'not-an-email',
      password: 'securePassword123',
      name: 'Test',
      admin_key: 'key',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password (<6 chars)', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: '12345',
      name: 'Test',
      admin_key: 'key',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short name (<2 chars)', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: 'securepass',
      name: 'A',
      admin_key: 'key',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid designation', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: 'securepass',
      name: 'Test',
      admin_key: 'key',
      designation: 'STUDENT', // not in enum
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid designation', () => {
    const result = adminSchema.safeParse({
      email: 'test@dtu.ac.in',
      password: 'securepass',
      name: 'Test Admin',
      admin_key: 'key',
      designation: 'WARDEN',
    });
    expect(result.success).toBe(true);
  });
});

// ── Login Schema ──
describe('Login Schema', () => {
  it('should pass with email and password', () => {
    const result = loginSchema.safeParse({ email: 'test@dtu.ac.in', password: 'pass' });
    expect(result.success).toBe(true);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@dtu.ac.in', password: '' });
    expect(result.success).toBe(false);
  });
});

// ── Password Update Schema ──
describe('Password Update Schema', () => {
  it('should pass with valid old/new passwords', () => {
    const result = updatePassSchema.safeParse({ oldPassword: 'old123', newPassword: 'newpass123' });
    expect(result.success).toBe(true);
  });

  it('should reject short new password', () => {
    const result = updatePassSchema.safeParse({ oldPassword: 'old123', newPassword: '12345' });
    expect(result.success).toBe(false);
  });
});

// ── Hosteller Update Schema ──
describe('Hosteller Update Schema', () => {
  it('should accept partial updates', () => {
    const result = hostellerUpdateSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = hostellerUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = hostellerUpdateSchema.safeParse({ status: 'deleted' });
    expect(result.success).toBe(false);
  });

  it('should accept valid status', () => {
    const result = hostellerUpdateSchema.safeParse({ status: 'inactive' });
    expect(result.success).toBe(true);
  });

  it('should reject name shorter than 2 chars', () => {
    const result = hostellerUpdateSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });
});
