import * as leaveRepository from '../models/repositories/leaveRepository.js';
import { applyLeaveSchema } from '../models/validations/leaveSchemas.js';
import { parsePagination } from '../utils/pagination.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import { notifyLeaveUpdate } from '../services/notificationService.js';

export const getAllLeaves = async (req, res) => {
  try {
    const { skip, take, page, limit } = parsePagination(req);
    const status = req.query.status || '';

    const [leaves, total] = await leaveRepository.getAllLeavesPaginated({ skip, take, status });
    sendPaginated(res, leaves, total, { page, limit });
  } catch (error) {
    sendError(res, error.message);
  }
};

// NEW — Hosteller's own leaves
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await leaveRepository.getLeavesByHosteller(req.user.id);
    sendSuccess(res, leaves);
  } catch (error) {
    sendError(res, error.message);
  }
};

export const applyLeave = async (req, res) => {
  try {
    const parsed = applyLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0].message, 400);
    }

    const leave = await leaveRepository.applyLeave({
      ...parsed.data,
      start_date: new Date(parsed.data.start_date),
      end_date: new Date(parsed.data.end_date),
      status: 'pending'
    });
    sendSuccess(res, leave, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

export const approveLeave = async (req, res) => {
  try {
    const leave = await leaveRepository.updateLeaveStatus(
      req.params.id,
      'approved',
      req.user?.id || req.body.adminId
    );

    // Trigger notification to the hosteller
    await notifyLeaveUpdate(leave.hostellerId, leave.id, 'approved');

    sendSuccess(res, leave);
  } catch (error) {
    sendError(res, error.message);
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const leave = await leaveRepository.updateLeaveStatus(
      req.params.id,
      'rejected',
      req.user?.id || req.body.adminId
    );

    // Trigger notification to the hosteller
    await notifyLeaveUpdate(leave.hostellerId, leave.id, 'rejected');

    sendSuccess(res, leave);
  } catch (error) {
    sendError(res, error.message);
  }
};
