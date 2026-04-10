import * as leaveRepository from '../models/repositories/leaveRepository.js';
import { applyLeaveSchema } from '../models/validations/leaveSchemas.js';

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await leaveRepository.getAllLeaves();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const parsed = applyLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const leave = await leaveRepository.applyLeave({
      ...parsed.data,
      start_date: new Date(parsed.data.start_date),
      end_date: new Date(parsed.data.end_date),
      status: 'pending'
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const leave = await leaveRepository.updateLeaveStatus(
      req.params.id,
      'approved',
      req.user?.id || req.body.adminId
    );
    res.json(leave);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const leave = await leaveRepository.updateLeaveStatus(
      req.params.id,
      'rejected',
      req.user?.id || req.body.adminId
    );
    res.json(leave);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
