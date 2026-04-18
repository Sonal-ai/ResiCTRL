import * as announcementRepo from '../models/repositories/announcementRepository.js';
import { createAnnouncementSchema, updateAnnouncementSchema, ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES } from '../models/validations/announcementSchemas.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// GET /api/announcements/meta — return enum values for frontend dropdowns
export const getMeta = (req, res) => {
  sendSuccess(res, { categories: ANNOUNCEMENT_CATEGORIES, priorities: ANNOUNCEMENT_PRIORITIES });
};

// POST /api/announcements — Admin creates announcement
export const createAnnouncement = async (req, res) => {
  try {
    const parsed = createAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const announcement = await announcementRepo.createAnnouncement({
      ...parsed.data,
      expiry_date: parsed.data.expiry_date ? new Date(parsed.data.expiry_date) : null,
      createdById: req.user.id,
    });
    sendSuccess(res, announcement, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

// GET /api/announcements — get announcements (filtered)
export const getAnnouncements = async (req, res) => {
  try {
    const { hostel, category, priority, includeExpired } = req.query;

    // Hostellers auto-filter by their hostel; admins can see all
    const isAdmin = req.user.role === 'WARDEN' || req.user.role === 'ATTENDANT' || req.user.designation;
    const hostelFilter = hostel || (!isAdmin ? req.user.hostel_name : undefined);

    const announcements = await announcementRepo.getAnnouncements({
      hostel: hostelFilter,
      category,
      priority,
      includeExpired: includeExpired === 'true' || isAdmin,
    });
    sendSuccess(res, announcements);
  } catch (error) {
    sendError(res, error.message);
  }
};

// PUT /api/announcements/:id — Admin updates
export const updateAnnouncement = async (req, res) => {
  try {
    const parsed = updateAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const existing = await announcementRepo.getAnnouncementById(req.params.id);
    if (!existing) return sendError(res, 'Announcement not found', 404);

    const data = { ...parsed.data };
    if (data.expiry_date) data.expiry_date = new Date(data.expiry_date);

    const updated = await announcementRepo.updateAnnouncement(req.params.id, data);
    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, error.message);
  }
};

// DELETE /api/announcements/:id — Admin deletes
export const deleteAnnouncement = async (req, res) => {
  try {
    const existing = await announcementRepo.getAnnouncementById(req.params.id);
    if (!existing) return sendError(res, 'Announcement not found', 404);

    await announcementRepo.deleteAnnouncement(req.params.id);
    sendSuccess(res, { message: 'Announcement deleted' });
  } catch (error) {
    sendError(res, error.message);
  }
};
