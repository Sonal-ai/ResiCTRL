import * as electionRepo from '../models/repositories/electionRepository.js';
import { createElectionSchema, addCandidateSchema, castVoteSchema, POSITIONS } from '../models/validations/electionSchemas.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// GET /api/elections/positions — list valid positions
export const getPositions = (req, res) => {
  sendSuccess(res, POSITIONS);
};

// POST /api/elections — Admin creates an election
export const createElection = async (req, res) => {
  try {
    const parsed = createElectionSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const election = await electionRepo.createElection({
      ...parsed.data,
      start_date: new Date(parsed.data.start_date),
      end_date: new Date(parsed.data.end_date),
      createdById: req.user.id,
    });
    sendSuccess(res, election, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/elections — Admin lists all elections
export const getAllElections = async (req, res) => {
  try {
    const elections = await electionRepo.getAllElections();
    sendSuccess(res, elections);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/elections/active — Hosteller gets active election for their hostel
export const getActiveElection = async (req, res) => {
  try {
    // req.user should have hostel_name (from JWT/DB lookup)
    const hostelName = req.query.hostel || req.user.hostel_name;
    if (!hostelName) return sendError(res, 'Hostel name required', 400);

    const election = await electionRepo.getActiveElection(hostelName);
    if (!election) return sendSuccess(res, null);

    // Also attach voter's existing votes
    const myVotes = await electionRepo.getVoterVotes(req.user.id, election.id);
    sendSuccess(res, { ...election, myVotes });
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/elections/:id — Get single election details
export const getElectionById = async (req, res) => {
  try {
    const election = await electionRepo.getElectionById(req.params.id);
    if (!election) return sendError(res, 'Election not found', 404);
    sendSuccess(res, election);
  } catch (error) {
    sendError(res, error.message);
  }
};

// POST /api/elections/:id/candidates — Admin adds a candidate
export const addCandidate = async (req, res) => {
  try {
    const parsed = addCandidateSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const election = await electionRepo.getElectionById(req.params.id);
    if (!election) return sendError(res, 'Election not found', 404);
    if (election.status === 'ENDED') return sendError(res, 'Cannot add candidates to ended election', 400);

    const candidate = await electionRepo.addCandidate({
      ...parsed.data,
      electionId: req.params.id,
    });
    sendSuccess(res, candidate, 201);
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, 'This student is already a candidate for this position', 409);
    sendError(res, error.message);
  }
};

// GET /api/elections/:id/candidates — Get candidates grouped by position
export const getCandidates = async (req, res) => {
  try {
    const candidates = await electionRepo.getCandidatesByElection(req.params.id);
    // Group by position
    const grouped = {};
    candidates.forEach(c => {
      if (!grouped[c.position]) grouped[c.position] = [];
      grouped[c.position].push(c);
    });
    sendSuccess(res, grouped);
  } catch (error) {
    sendError(res, error.message);
  }
};

// POST /api/elections/vote — Hosteller casts a vote
export const castVote = async (req, res) => {
  try {
    const parsed = castVoteSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const { candidateId, position, electionId } = parsed.data;

    // Check election is ACTIVE
    const election = await electionRepo.getElectionById(electionId);
    if (!election) return sendError(res, 'Election not found', 404);
    if (election.status !== 'ACTIVE') return sendError(res, 'Election is not currently active', 403);

    // Check time window
    const now = new Date();
    if (now < election.start_date || now > election.end_date) {
      return sendError(res, 'Voting is not open at this time', 403);
    }

    // Check already voted for this position
    const existing = await electionRepo.hasVoted(req.user.id, position, electionId);
    if (existing) return sendError(res, `You have already voted for ${position}`, 409);

    const vote = await electionRepo.castVote({
      voterId: req.user.id,
      candidateId,
      position,
      electionId,
    });
    sendSuccess(res, { message: `Vote cast for ${position}`, voteId: vote.id }, 201);
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, 'Duplicate vote detected', 409);
    sendError(res, error.message);
  }
};

// GET /api/elections/:id/results — Results (only if ENDED)
export const getResults = async (req, res) => {
  try {
    const election = await electionRepo.getElectionById(req.params.id);
    if (!election) return sendError(res, 'Election not found', 404);

    // Only show results if election has ended (admins can always see)
    const isAdmin = req.user.role === 'WARDEN' || req.user.role === 'ATTENDANT' || req.user.designation;
    if (election.status !== 'ENDED' && !isAdmin) {
      return sendError(res, 'Results are available only after the election ends', 403);
    }

    const results = await electionRepo.getResults(req.params.id);
    sendSuccess(res, { election: { id: election.id, title: election.title, status: election.status }, ...results });
  } catch (error) {
    sendError(res, error.message);
  }
};

// PUT /api/elections/:id/status — Admin changes election status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['UPCOMING', 'ACTIVE', 'ENDED'].includes(status)) {
      return sendError(res, 'Status must be UPCOMING, ACTIVE, or ENDED', 400);
    }
    const election = await electionRepo.updateElectionStatus(req.params.id, status);
    sendSuccess(res, election);
  } catch (error) {
    sendError(res, error.message);
  }
};
