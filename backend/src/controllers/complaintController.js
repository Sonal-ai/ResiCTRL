import * as complaintRepository from '../models/repositories/complaintRepository.js';
import { createComplaintSchema, updateComplaintStatusSchema, getAutoPriority, COMPLAINT_CATEGORIES, VALID_CATEGORIES } from '../models/validations/complaintSchemas.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';
import { notifyComplaintUpdate } from '../services/notificationService.js';

// GET /api/complaints/categories — returns category/subcategory tree for frontend
export const getCategories = async (req, res) => {
  const categories = Object.entries(COMPLAINT_CATEGORIES).map(([key, val]) => ({
    key,
    label: val.label,
    icon: val.icon,
    subcategories: val.subcategories,
    defaultPriority: val.defaultPriority,
  }));
  sendSuccess(res, categories);
};

// POST /api/complaints — Hosteller submits a complaint
export const createComplaint = async (req, res) => {
  try {
    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0].message, 400);
    }

    const { title, description, category, subcategory, priority } = parsed.data;

    // Auto-assign priority if not provided
    const finalPriority = priority || getAutoPriority(category, subcategory);

    // Auto-generate title from category+subcategory if title is generic
    const complaintData = {
      hostellerId: req.user.id,
      title,
      description,
      category,
      subcategory,
      priority: finalPriority,
      image_url: req.file?.path || null,
    };

    const complaint = await complaintRepository.createComplaint(complaintData);
    sendSuccess(res, complaint, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints — Admin gets all complaints (with filters + pagination)
export const getAllComplaints = async (req, res) => {
  try {
    const { skip, take, page, limit } = parsePagination(req);
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.subcategory) filters.subcategory = req.query.subcategory;
    if (req.query.priority) filters.priority = req.query.priority;

    const [complaints, total] = await complaintRepository.getAllComplaintsPaginated({ ...filters, skip, take });
    sendPaginated(res, complaints, total, { page, limit });
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints/my — Hosteller gets their own complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await complaintRepository.getComplaintsByHosteller(req.user.id);
    sendSuccess(res, complaints);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/complaints/stats — Admin gets complaint statistics
export const getComplaintStats = async (req, res) => {
  try {
    const stats = await complaintRepository.countComplaintsByStatus();
    const byCategory = await complaintRepository.countComplaintsByCategory();
    const byPriority = await complaintRepository.countComplaintsByPriority();
    sendSuccess(res, { ...stats, byCategory, byPriority });
  } catch (error) {
    sendError(res, error.message);
  }
};

// PUT /api/complaints/:id/status — Admin updates complaint status + priority
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

    const complaint = await complaintRepository.updateComplaint(
      req.params.id,
      {
        status: parsed.data.status,
        resolvedById: req.user.id,
        admin_response: parsed.data.admin_response || null,
        ...(parsed.data.priority && { priority: parsed.data.priority }),
      }
    );

    // Trigger notification to the hosteller
    await notifyComplaintUpdate(existing.hostellerId, existing.title, parsed.data.status);

    sendSuccess(res, complaint);
  } catch (error) {
    sendError(res, error.message);
  }
};
