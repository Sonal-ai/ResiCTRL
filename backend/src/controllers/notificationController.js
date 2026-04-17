import * as notificationRepo from '../models/repositories/notificationRepository.js';
import { parsePagination } from '../utils/pagination.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res) => {
  try {
    const { skip, take, page, limit } = parsePagination(req);
    const [notifications, total] = await notificationRepo.getNotificationsByUser(req.user.id, { skip, take });
    const unreadCount = await notificationRepo.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    sendError(res, error.message);
  }
};

export const markAsRead = async (req, res) => {
  try {
    await notificationRepo.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Notification marked as read' });
  } catch (error) {
    sendError(res, error.message);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationRepo.markAllAsRead(req.user.id);
    sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (error) {
    sendError(res, error.message);
  }
};
