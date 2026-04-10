import prisma from '../configs/prismaClient.js';
import { startOfDay, subDays } from 'date-fns';

export const processScan = async (req, res, next) => {
  try {
    const { student_id, timestamp, type, ocr_confidence, model_confidence, camera_id } = req.body;
    const scanTime = new Date(timestamp);
    const hour = scanTime.getHours();

    const student = await prisma.student.findUnique({ where: { id: student_id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Hardware scan logging
    const scanEvent = await prisma.scanEvent.create({
      data: {
        studentId: student_id,
        timestamp: scanTime,
        type, 
        ocr_confidence: parseFloat(ocr_confidence),
        model_confidence: parseFloat(model_confidence),
        camera_id
      }
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

        const lateRecord = await prisma.attendanceRecord.findUnique({
            where: { studentId_date: { studentId: student_id, date: referenceDate } }
        });

        if (lateRecord && lateRecord.status === 'ABSENT') {
            await prisma.attendanceRecord.update({
                where: { id: lateRecord.id },
                data: { status: 'PRESENT' }
            });
            // Revert the absentee penalties applied by cron
            updateData.absent_without_leave_count = { decrement: 1 };
            updateData.total_absent_count = { decrement: 1 };
        }
    }
    
    // Evaluate Exit bypassing logic
    // Exit after 11 PM doesn't trigger absence (the system ignores checking an exit if active curfew)

    await prisma.student.update({
      where: { id: student_id },
      data: updateData
    });

    res.status(200).json({ message: 'Scan processed successfully', scanEvent });
  } catch (error) {
    next(error);
  }
};

export const getRecentScans = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const scans = await prisma.scanEvent.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: { student: { select: { name: true, roll_number: true, room_number: true } } }
        });
        res.json(scans);
    } catch (error) {
        next(error);
    }
};
