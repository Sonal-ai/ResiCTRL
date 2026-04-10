import * as scanEventRepository from '../models/repositories/scanEventRepository.js';
import * as studentRepository from '../models/repositories/studentRepository.js';
import * as attendanceRepository from '../models/repositories/attendanceRepository.js';
import { processScanSchema } from '../models/validations/scanSchemas.js';
import { startOfDay, subDays } from 'date-fns';

export const processScan = async (req, res, next) => {
  try {
    const parsed = processScanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { student_id, timestamp, type, ocr_confidence, model_confidence, camera_id } = parsed.data;
    const scanTime = new Date(timestamp);
    const hour = scanTime.getHours();

    const student = await studentRepository.getStudentById(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Hardware scan logging
    const scanEvent = await scanEventRepository.createScanEvent({
      studentId: student_id,
      timestamp: scanTime,
      type, 
      ocr_confidence: ocr_confidence ? parseFloat(ocr_confidence) : null,
      model_confidence: model_confidence ? parseFloat(model_confidence) : null,
      camera_id
    });

    let updateData = { current_location: type === 'entry' ? 'INSIDE' : 'OUTSIDE' };
    if (type === 'entry') updateData.last_entry_time = scanTime;

    // Evaluate Late Curfew Entries (Overriding Cron Job flags)
    // If Entry happens between 11PM (23:00) and 5AM (05:00)
    // It means the student arrived VERY late, after the 11:05 PM Cron marked them ABSENT.
    if (type === 'entry') {
        let referenceDate = startOfDay(scanTime);
        if (hour >= 0 && hour <= 5) {
            referenceDate = subDays(referenceDate, 1); // Bind to previous day's curfew scope
        }

        const lateRecord = await attendanceRepository.getAttendanceRecord(student_id, referenceDate);

        if (lateRecord && lateRecord.status === 'ABSENT') {
            await attendanceRepository.updateAttendanceStatus(lateRecord.id, 'PRESENT');
            // Revert the absentee penalties applied by cron
            updateData.absent_without_leave_count = { decrement: 1 };
            updateData.total_absent_count = { decrement: 1 };
        }
    }
    
    // Evaluate Exit bypassing logic
    // Exit after 11 PM doesn't trigger absence (the system ignores checking an exit if active curfew)

    await studentRepository.updateStudent(student_id, updateData);

    res.status(200).json({ message: 'Scan processed successfully', scanEvent });
  } catch (error) {
    next(error);
  }
};

export const getRecentScans = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const scans = await scanEventRepository.getRecentScans(limit);
        res.json(scans);
    } catch (error) {
        next(error);
    }
};
