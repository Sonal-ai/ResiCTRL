import * as complaintRepository from '../models/repositories/complaintRepository.js';
import { createComplaintSchema, updateComplaintStatusSchema } from '../models/validations/complaintSchemas.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { notifyComplaintUpdate } from '../services/notificationService.js';

// POST /api/complaints — Hosteller submits a complaint
export const createComplaint = async (req, res) => {
  try {
    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0].message, 400);
    }

    const complaintData = {
      hostellerId: req.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category || 'general',
      image_url: req.file?.path || null, // Cloudinary URL from multer
    };

    const complaint = await complaintRepository.createComplaint(complaintData);
    sendSuccess(res, complaint, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints — Admin gets all complaints (with optional filters)
export const getAllComplaints = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;

    const complaints = await complaintRepository.getAllComplaints(filters);
    res.json(complaints);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints/my — Hosteller gets their own complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await complaintRepository.getComplaintsByHosteller(req.user.id);
    res.json(complaints);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints/stats — Admin gets complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await complaintRepository.countComplaintsByStatus();
    res.json(stats);
  } catch (error) {
    sendError(res, error.message);
  }
};

// PUT /api/complaints/:id/status — Admin updates complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const parsed = updateComplaintStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0].message, 400);
    }

    const existing = await complaintRepository.getComplaintById(req.params.id);
    if (!existing) {
      return sendError(res, 'Complaint not found', 404);
    }

    const complaint = await complaintRepository.updateComplaintStatus(
      req.params.id,
      parsed.data.status,
      req.user.id,
      parsed.data.admin_response
    );

    // Trigger notification to the hosteller
    await notifyComplaintUpdate(existing.hostellerId, existing.title, parsed.data.status);

    sendSuccess(res, complaint);
  } catch (error) {
    sendError(res, error.message);
  }
};
