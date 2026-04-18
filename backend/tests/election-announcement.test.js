import { describe, it, expect } from 'vitest';
import { createElectionSchema, addCandidateSchema, castVoteSchema, POSITIONS } from '../src/models/validations/electionSchemas.js';
import { createAnnouncementSchema, updateAnnouncementSchema, ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES } from '../src/models/validations/announcementSchemas.js';

describe('Election Schemas', () => {
  describe('POSITIONS', () => {
    it('should have 4 positions', () => {
      expect(POSITIONS).toHaveLength(4);
      expect(POSITIONS).toContain('President');
      expect(POSITIONS).toContain('Mess Secretary');
      expect(POSITIONS).toContain('Cultural Secretary');
      expect(POSITIONS).toContain('Sports Secretary');
    });
  });

  describe('createElectionSchema', () => {
    it('should pass with valid data', () => {
      const result = createElectionSchema.safeParse({
        title: 'Hostel Committee Election 2026',
        hostel_name: 'Aryabhatta Hostel',
        start_date: '2026-05-01T00:00:00.000Z',
        end_date: '2026-05-02T23:59:59.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const result = createElectionSchema.safeParse({
        title: 'Hi',
        hostel_name: 'Aryabhatta',
        start_date: '2026-05-01T00:00:00.000Z',
        end_date: '2026-05-02T23:59:59.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('should reject when start_date is after end_date', () => {
      const result = createElectionSchema.safeParse({
        title: 'Test Election',
        hostel_name: 'Aryabhatta',
        start_date: '2026-05-03T00:00:00.000Z',
        end_date: '2026-05-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing hostel_name', () => {
      const result = createElectionSchema.safeParse({
        title: 'Test Election',
        start_date: '2026-05-01T00:00:00.000Z',
        end_date: '2026-05-02T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('addCandidateSchema', () => {
    it('should pass with valid data', () => {
      const result = addCandidateSchema.safeParse({
        hostellerId: '9267ea3b-041a-4329-a1e3-205d2562e899',
        position: 'President',
        manifesto: 'Better food!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid position', () => {
      const result = addCandidateSchema.safeParse({
        hostellerId: '9267ea3b-041a-4329-a1e3-205d2562e899',
        position: 'Treasury Secretary',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID hostellerId', () => {
      const result = addCandidateSchema.safeParse({
        hostellerId: 'not-a-uuid',
        position: 'President',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('castVoteSchema', () => {
    it('should pass with valid data', () => {
      const result = castVoteSchema.safeParse({
        candidateId: '9267ea3b-041a-4329-a1e3-205d2562e899',
        position: 'Mess Secretary',
        electionId: 'bd8e8c0d-6185-4771-9f68-fc50433185bc',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing electionId', () => {
      const result = castVoteSchema.safeParse({
        candidateId: '9267ea3b-041a-4329-a1e3-205d2562e899',
        position: 'President',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Announcement Schemas', () => {
  describe('enums', () => {
    it('should have 5 categories', () => {
      expect(ANNOUNCEMENT_CATEGORIES).toHaveLength(5);
      expect(ANNOUNCEMENT_CATEGORIES).toContain('EVENT');
      expect(ANNOUNCEMENT_CATEGORIES).toContain('URGENT');
      expect(ANNOUNCEMENT_CATEGORIES).toContain('MESS');
    });

    it('should have 3 priorities', () => {
      expect(ANNOUNCEMENT_PRIORITIES).toHaveLength(3);
      expect(ANNOUNCEMENT_PRIORITIES).toContain('NORMAL');
      expect(ANNOUNCEMENT_PRIORITIES).toContain('IMPORTANT');
      expect(ANNOUNCEMENT_PRIORITIES).toContain('URGENT');
    });
  });

  describe('createAnnouncementSchema', () => {
    it('should pass with valid data', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Hostel Fest 2026',
        content: 'Annual hostel cultural fest on May 15.',
        category: 'EVENT',
        priority: 'IMPORTANT',
      });
      expect(result.success).toBe(true);
    });

    it('should set default priority to NORMAL', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'General Notice',
        content: 'Room inspections will be conducted this week.',
        category: 'NOTICE',
      });
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe('NORMAL');
    });

    it('should reject short title', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Hi',
        content: 'This is a valid content.',
        category: 'GENERAL',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short content', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Valid Title',
        content: 'Short',
        category: 'GENERAL',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Valid Title',
        content: 'This is valid content text.',
        category: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional expiry_date', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Limited Notice',
        content: 'This notice expires on May 1.',
        category: 'NOTICE',
        expiry_date: '2026-05-01T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null hostel_name (global)', () => {
      const result = createAnnouncementSchema.safeParse({
        title: 'Global Notice',
        content: 'This applies to all hostels.',
        category: 'GENERAL',
        hostel_name: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateAnnouncementSchema', () => {
    it('should accept partial update', () => {
      const result = updateAnnouncementSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = updateAnnouncementSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid priority', () => {
      const result = updateAnnouncementSchema.safeParse({
        priority: 'SUPER_URGENT',
      });
      expect(result.success).toBe(false);
    });
  });
});
