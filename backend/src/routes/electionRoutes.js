import express from 'express';
import * as electionController from '../controllers/electionController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Public (authenticated) ──
router.get('/positions', protect, electionController.getPositions);
router.get('/active', protect, electionController.getActiveElection);

// ── Hosteller: vote ──
router.post('/vote', protect, authorizeRoles('HOSTELLER'), electionController.castVote);

// ── Admin: manage elections ──
router.post('/', protect, authorizeRoles('WARDEN', 'ATTENDANT'), electionController.createElection);
router.get('/', protect, authorizeRoles('WARDEN', 'ATTENDANT'), electionController.getAllElections);

// ── Specific election ──
router.get('/:id', protect, electionController.getElectionById);
router.get('/:id/candidates', protect, electionController.getCandidates);
router.get('/:id/results', protect, electionController.getResults);
router.post('/:id/candidates', protect, authorizeRoles('WARDEN', 'ATTENDANT'), electionController.addCandidate);
router.put('/:id/status', protect, authorizeRoles('WARDEN', 'ATTENDANT'), electionController.updateStatus);

export default router;
