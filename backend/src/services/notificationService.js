/**
 * Notification Service
 * 
 * High-level functions to trigger notifications.
 * Called from controllers when status changes occur.
 */
import * as notificationRepo from '../models/repositories/notificationRepository.js';

export const notifyLeaveUpdate = async (hostellerId, leaveId, status) => {
  try {
    await notificationRepo.createNotification({
      userId: hostellerId,
      userType: 'HOSTELLER',
      title: `Leave ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
      message: `Your leave request has been ${status} by the warden.`,
      type: `leave_${status}`,
    });
  } catch (err) {
    // Notification failure should never block the main operation
    console.error('Notification error (leave):', err.message);
  }
};

export const notifyComplaintUpdate = async (hostellerId, complaintTitle, status) => {
  try {
    const statusLabels = {
      in_progress: 'is now being reviewed',
      resolved: 'has been resolved ✅',
      rejected: 'has been rejected',
    };

    await notificationRepo.createNotification({
      userId: hostellerId,
      userType: 'HOSTELLER',
      title: `Complaint Update`,
      message: `Your complaint "${complaintTitle}" ${statusLabels[status] || `status changed to ${status}`}.`,
      type: 'complaint_update',
    });
  } catch (err) {
    console.error('Notification error (complaint):', err.message);
  }
};

export const notifyViolation = async (hostellerId, message) => {
  try {
    await notificationRepo.createNotification({
      userId: hostellerId,
      userType: 'HOSTELLER',
      title: 'Curfew Violation ⚠️',
      message,
      type: 'violation',
    });
  } catch (err) {
    console.error('Notification error (violation):', err.message);
  }
};
