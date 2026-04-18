import { z } from 'zod';

export const POSITIONS = ['President', 'Mess Secretary', 'Cultural Secretary', 'Sports Secretary'];
export const ELECTION_STATUSES = ['UPCOMING', 'ACTIVE', 'ENDED'];

export const createElectionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  hostel_name: z.string().min(1, 'Hostel name is required'),
  start_date: z.string().datetime({ message: 'Invalid start_date ISO format' }),
  end_date: z.string().datetime({ message: 'Invalid end_date ISO format' }),
}).refine(
  data => new Date(data.start_date) < new Date(data.end_date),
  { message: 'start_date must be before end_date', path: ['end_date'] }
);

export const addCandidateSchema = z.object({
  hostellerId: z.string().uuid('Invalid hosteller ID'),
  position: z.enum(POSITIONS, { message: `Position must be one of: ${POSITIONS.join(', ')}` }),
  manifesto: z.string().max(500).optional(),
});

export const castVoteSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID'),
  position: z.enum(POSITIONS, { message: 'Invalid position' }),
  electionId: z.string().uuid('Invalid election ID'),
});
