import prisma from '../configs/prismaClient.js';

// Since user avoided Redis/BullMQ, we'll process scans directly (synchronous DB update for now),
// or push to a simple JS array if we want async in-memory queue.
// For robust scaling in production, we swap this with BullMQ later.

export const processScan = async (req, res, next) => {
  try {
    const { student_id, timestamp, type, ocr_confidence, model_confidence, camera_id } = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({ where: { id: student_id } });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found. Scan flagged as UNAUTHORIZED.' });
    }

    // Record the scan event
    const scanEvent = await prisma.scanEvent.create({
      data: {
        studentId: student_id,
        timestamp: new Date(timestamp),
        type, // "entry" or "exit"
        ocr_confidence: parseFloat(ocr_confidence),
        model_confidence: parseFloat(model_confidence),
        camera_id
      }
    });

    // Update student's last known state
    let updateData = {
      current_location: type === 'entry' ? 'INSIDE' : 'OUTSIDE'
    };
    
    if (type === 'entry') {
      updateData.last_entry_time = new Date(timestamp);
    }

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
