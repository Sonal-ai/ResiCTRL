import prisma from '../../configs/prismaClient.js';

// ── Elections ──

export const createElection = (data) =>
  prisma.election.create({ data });

export const getElectionById = (id) =>
  prisma.election.findUnique({
    where: { id },
    include: {
      candidates: {
        include: { hosteller: { select: { id: true, name: true, roll_number: true, hostel_name: true, image_url: true } } },
        orderBy: { position: 'asc' },
      },
      _count: { select: { votes: true } },
    },
  });

export const getActiveElection = (hostelName) =>
  prisma.election.findFirst({
    where: {
      hostel_name: hostelName,
      status: 'ACTIVE',
    },
    include: {
      candidates: {
        include: { hosteller: { select: { id: true, name: true, roll_number: true, image_url: true } } },
        orderBy: { position: 'asc' },
      },
    },
  });

export const getAllElections = () =>
  prisma.election.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { candidates: true, votes: true } } },
  });

export const updateElectionStatus = (id, status) =>
  prisma.election.update({ where: { id }, data: { status } });

// ── Candidates ──

export const addCandidate = (data) =>
  prisma.candidate.create({
    data,
    include: { hosteller: { select: { name: true, roll_number: true } } },
  });

export const getCandidatesByElection = (electionId) =>
  prisma.candidate.findMany({
    where: { electionId },
    include: { hosteller: { select: { id: true, name: true, roll_number: true, hostel_name: true, image_url: true } } },
    orderBy: { position: 'asc' },
  });

// ── Votes ──

export const castVote = (data) =>
  prisma.vote.create({ data });

export const hasVoted = (voterId, position, electionId) =>
  prisma.vote.findUnique({
    where: { voterId_position_electionId: { voterId, position, electionId } },
  });

export const getVoterVotes = (voterId, electionId) =>
  prisma.vote.findMany({
    where: { voterId, electionId },
    select: { position: true, candidateId: true },
  });

export const getResults = async (electionId) => {
  const candidates = await prisma.candidate.findMany({
    where: { electionId },
    include: {
      hosteller: { select: { name: true, roll_number: true, image_url: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { position: 'asc' },
  });

  // Group by position
  const byPosition = {};
  candidates.forEach(c => {
    if (!byPosition[c.position]) byPosition[c.position] = [];
    byPosition[c.position].push({
      id: c.id,
      name: c.hosteller.name,
      roll_number: c.hosteller.roll_number,
      image_url: c.hosteller.image_url,
      manifesto: c.manifesto,
      voteCount: c._count.votes,
    });
  });

  // Sort each position by vote count (winner first)
  for (const pos of Object.keys(byPosition)) {
    byPosition[pos].sort((a, b) => b.voteCount - a.voteCount);
  }

  const totalVoters = await prisma.vote.groupBy({
    by: ['voterId'],
    where: { electionId },
  });

  return { positions: byPosition, totalVoters: totalVoters.length };
};
