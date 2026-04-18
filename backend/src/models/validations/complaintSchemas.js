import { z } from 'zod';

// ────────────────────────────────────────────────────────────────
// COMPLAINT CATEGORIES & SUBCATEGORIES
// Central source of truth — used by validation, controller, and frontend
// ────────────────────────────────────────────────────────────────

export const COMPLAINT_CATEGORIES = {
  WATER_ISSUES: {
    label: 'Water Issues',
    icon: '💧',
    subcategories: ['Water logging', 'Water cooler not working', 'No water supply', 'Dirty water'],
    defaultPriority: 'MEDIUM',
  },
  ELECTRICITY: {
    label: 'Electricity',
    icon: '⚡',
    subcategories: ['Power cut', 'Faulty switch', 'Fan not working', 'Light not working'],
    defaultPriority: 'HIGH',  // Safety-critical
  },
  MESS_FOOD: {
    label: 'Mess / Food',
    icon: '🍽️',
    subcategories: ['Poor food quality', 'Unhygienic food', 'Late food service', 'Limited quantity'],
    defaultPriority: 'MEDIUM',
  },
  FURNITURE: {
    label: 'Furniture',
    icon: '🪑',
    subcategories: ['Table damage', 'Chair broken', 'Almirah issue', 'Door issue', 'Door handle issue', 'Bed issue'],
    defaultPriority: 'LOW',
  },
  HYGIENE: {
    label: 'Hygiene',
    icon: '🧼',
    subcategories: ['Too many mosquitoes', 'Garbage not cleaned', 'Dirty washrooms', 'Drain blockage'],
    defaultPriority: 'MEDIUM',
  },
  SAFETY: {
    label: 'Safety',
    icon: '🚨',
    subcategories: ['Honeybee hive', 'Stray animals', 'Broken window', 'Unsafe wiring'],
    defaultPriority: 'URGENT',  // Critical safety
  },
  GENERAL: {
    label: 'General',
    icon: '📋',
    subcategories: ['Other'],
    defaultPriority: 'LOW',
  },
};

export const VALID_CATEGORIES = Object.keys(COMPLAINT_CATEGORIES);
export const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

// Auto-priority rules: certain subcategories escalate priority
const HIGH_PRIORITY_SUBCATEGORIES = [
  'Power cut', 'Unsafe wiring', 'Honeybee hive', 'No water supply',
  'Unhygienic food', 'Drain blockage', 'Broken window',
];

/**
 * Determine auto-priority from category + subcategory.
 * Returns the highest applicable priority.
 */
export const getAutoPriority = (category, subcategory) => {
  if (HIGH_PRIORITY_SUBCATEGORIES.includes(subcategory)) return 'URGENT';
  return COMPLAINT_CATEGORIES[category]?.defaultPriority || 'MEDIUM';
};

/**
 * Validate that subcategory belongs to the given category.
 */
export const isValidSubcategory = (category, subcategory) => {
  const cat = COMPLAINT_CATEGORIES[category];
  if (!cat) return false;
  return cat.subcategories.includes(subcategory);
};

// ────────────────────────────────────────────────────────────────
// ZOD SCHEMAS
// ────────────────────────────────────────────────────────────────

export const createComplaintSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.enum(VALID_CATEGORIES, { message: "Invalid category" }),
  subcategory: z.string().min(1, { message: "Subcategory is required" }),
  priority: z.enum(VALID_PRIORITIES).optional(),  // Optional — auto-assigned if not provided
}).refine(
  (data) => isValidSubcategory(data.category, data.subcategory),
  { message: "Invalid subcategory for the selected category", path: ["subcategory"] }
);

export const updateComplaintStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, { message: "Invalid status" }),
  admin_response: z.string().optional(),
  priority: z.enum(VALID_PRIORITIES).optional(),  // Admin can override priority
});
