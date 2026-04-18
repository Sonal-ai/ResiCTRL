import { describe, it, expect } from 'vitest';
import { createComplaintSchema, updateComplaintStatusSchema, getAutoPriority, isValidSubcategory, COMPLAINT_CATEGORIES, VALID_CATEGORIES } from '../src/models/validations/complaintSchemas.js';

describe('Complaint Categories', () => {
  it('should have 7 categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(7);
  });

  it('should include expected categories', () => {
    expect(VALID_CATEGORIES).toContain('WATER_ISSUES');
    expect(VALID_CATEGORIES).toContain('ELECTRICITY');
    expect(VALID_CATEGORIES).toContain('MESS_FOOD');
    expect(VALID_CATEGORIES).toContain('FURNITURE');
    expect(VALID_CATEGORIES).toContain('HYGIENE');
    expect(VALID_CATEGORIES).toContain('SAFETY');
    expect(VALID_CATEGORIES).toContain('GENERAL');
  });

  it('each category should have subcategories', () => {
    for (const key of VALID_CATEGORIES) {
      expect(COMPLAINT_CATEGORIES[key].subcategories.length).toBeGreaterThan(0);
    }
  });
});

describe('Subcategory Validation', () => {
  it('should validate correct category/subcategory pair', () => {
    expect(isValidSubcategory('WATER_ISSUES', 'Water logging')).toBe(true);
    expect(isValidSubcategory('ELECTRICITY', 'Power cut')).toBe(true);
    expect(isValidSubcategory('SAFETY', 'Honeybee hive')).toBe(true);
  });

  it('should reject wrong subcategory for category', () => {
    expect(isValidSubcategory('WATER_ISSUES', 'Power cut')).toBe(false);
    expect(isValidSubcategory('ELECTRICITY', 'Dirty water')).toBe(false);
  });

  it('should reject invalid category', () => {
    expect(isValidSubcategory('NONEXISTENT', 'Something')).toBe(false);
  });
});

describe('Auto-Priority Engine', () => {
  it('should assign URGENT for critical subcategories', () => {
    expect(getAutoPriority('ELECTRICITY', 'Power cut')).toBe('URGENT');
    expect(getAutoPriority('SAFETY', 'Honeybee hive')).toBe('URGENT');
    expect(getAutoPriority('SAFETY', 'Unsafe wiring')).toBe('URGENT');
    expect(getAutoPriority('WATER_ISSUES', 'No water supply')).toBe('URGENT');
  });

  it('should assign HIGH for electricity by default', () => {
    expect(getAutoPriority('ELECTRICITY', 'Fan not working')).toBe('HIGH');
  });

  it('should assign URGENT for safety by default', () => {
    expect(getAutoPriority('SAFETY', 'Stray animals')).toBe('URGENT');
  });

  it('should assign MEDIUM for regular categories', () => {
    expect(getAutoPriority('WATER_ISSUES', 'Water logging')).toBe('MEDIUM');
    expect(getAutoPriority('MESS_FOOD', 'Late food service')).toBe('MEDIUM');
  });

  it('should assign LOW for furniture and general', () => {
    expect(getAutoPriority('FURNITURE', 'Chair broken')).toBe('LOW');
    expect(getAutoPriority('GENERAL', 'Other')).toBe('LOW');
  });
});

describe('Create Complaint Schema', () => {
  it('should pass with valid data', () => {
    const result = createComplaintSchema.safeParse({
      title: 'Broken fan in room',
      description: 'The ceiling fan in room 104B is making noise and not working properly',
      category: 'ELECTRICITY',
      subcategory: 'Fan not working',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid category', () => {
    const result = createComplaintSchema.safeParse({
      title: 'Test complaint',
      description: 'This is a test description for the complaint',
      category: 'INVALID_CATEGORY',
      subcategory: 'Something',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched subcategory', () => {
    const result = createComplaintSchema.safeParse({
      title: 'Test complaint',
      description: 'This is a test description for the complaint',
      category: 'WATER_ISSUES',
      subcategory: 'Power cut', // belongs to ELECTRICITY, not WATER_ISSUES
    });
    expect(result.success).toBe(false);
  });

  it('should reject short title', () => {
    const result = createComplaintSchema.safeParse({
      title: 'AB',
      description: 'Valid description here for the complaint',
      category: 'GENERAL',
      subcategory: 'Other',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short description', () => {
    const result = createComplaintSchema.safeParse({
      title: 'Valid Title',
      description: 'Short',
      category: 'GENERAL',
      subcategory: 'Other',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional priority', () => {
    const result = createComplaintSchema.safeParse({
      title: 'Urgent fan issue',
      description: 'The fan is sparking and could be dangerous',
      category: 'ELECTRICITY',
      subcategory: 'Fan not working',
      priority: 'URGENT',
    });
    expect(result.success).toBe(true);
  });
});

describe('Update Complaint Status Schema', () => {
  it('should accept valid status', () => {
    const result = updateComplaintStatusSchema.safeParse({ status: 'RESOLVED' });
    expect(result.success).toBe(true);
  });

  it('should accept status with response and priority', () => {
    const result = updateComplaintStatusSchema.safeParse({
      status: 'IN_PROGRESS',
      admin_response: 'We are looking into this.',
      priority: 'HIGH',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateComplaintStatusSchema.safeParse({ status: 'COMPLETED' });
    expect(result.success).toBe(false);
  });
});
