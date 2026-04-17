import bcrypt from 'bcryptjs';
import prisma from '../configs/prismaClient.js';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';
import { parsePagination } from '../utils/pagination.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

// ── Pagination-enabled list with search + filter ──
export const getAllHostellers = async (req, res) => {
  try {
    const { skip, take, page, limit } = parsePagination(req);
    const search = req.query.search || '';
    const location = req.query.location || '';
    const hostel = req.query.hostel || '';

    const where = {};
    if (location) where.current_location = location;
    if (hostel) where.hostel_name = { contains: hostel, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { roll_number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [hostellers, total] = await Promise.all([
      prisma.hosteller.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
        // Select only needed fields — avoid returning password
        select: {
          id: true, roll_number: true, name: true, email: true,
          dob: true, gender: true, phone: true, guardian_name: true,
          guardian_contact: true, hostel_name: true, room_number: true,
          block: true, floor: true, total_working_days: true,
          total_present_days: true, image_url: true, status: true,
          current_location: true, last_entry_time: true,
          absent_without_leave_count: true, total_absent_count: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.hosteller.count({ where }),
    ]);

    sendPaginated(res, hostellers, total, { page, limit });
  } catch (error) {
    sendError(res, error.message);
  }
};

// ── Get single hosteller with full analytics ──
export const getHostellerById = async (req, res) => {
  try {
    const hosteller = await prisma.hosteller.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, roll_number: true, name: true, email: true,
        dob: true, gender: true, phone: true, guardian_name: true,
        guardian_contact: true, hostel_name: true, room_number: true,
        block: true, floor: true, total_working_days: true,
        total_present_days: true, image_url: true, status: true,
        current_location: true, last_entry_time: true,
        absent_without_leave_count: true, total_absent_count: true,
        createdAt: true, updatedAt: true,
        // Include related data for profile view
        leaves: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, start_date: true, end_date: true, reason: true, status: true, createdAt: true },
        },
        scanEvents: {
          orderBy: { timestamp: 'desc' },
          take: 15,
          select: { id: true, timestamp: true, type: true, camera_id: true, ocr_confidence: true },
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30,
          select: { id: true, date: true, status: true },
        },
        complaints: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, title: true, category: true, status: true, createdAt: true },
        },
      }
    });
    if (!hosteller) return sendError(res, 'Hosteller not found', 404);

    // Compute attendance percentage
    const attendancePercent = hosteller.total_working_days > 0
      ? Math.round((hosteller.total_present_days / hosteller.total_working_days) * 100)
      : null;

    sendSuccess(res, { ...hosteller, attendancePercent });
  } catch (error) {
    sendError(res, error.message);
  }
};

// ── Create hosteller ──
const hostellerCreateSchema = z.object({
  name: z.string().min(2),
  roll_number: z.string().min(1),
  email: z.string().email(),
  dob: z.string(), // expected DDMMYYYY or parsable string
  gender: z.string(),
  hostel_name: z.string().min(1),
  room_number: z.string().min(1),
  phone: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional()
});

// Helper for generating passwords
const generatePassword = (name, dobString) => {
  const namePart = name.slice(0, 4);
  const cleanDob = dobString.replace(/[-/:\s]/g, '');
  return namePart + cleanDob;
};

export const createHosteller = async (req, res) => {
  try {
    const parsed = hostellerCreateSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    const rawPassword = generatePassword(parsed.data.name, parsed.data.dob);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const hosteller = await prisma.hosteller.create({
      data: {
        ...parsed.data,
        dob: new Date(parsed.data.dob),
        password: hashedPassword
      }
    });
    sendSuccess(res, hosteller, 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

// ── Update hosteller (NEW — Phase 2) ──
const hostellerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
  hostel_name: z.string().min(1).optional(),
  room_number: z.string().min(1).optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateHosteller = async (req, res) => {
  try {
    const parsed = hostellerUpdateSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.issues[0].message, 400);

    // Verify hosteller exists
    const existing = await prisma.hosteller.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Hosteller not found', 404);

    // Only update fields that were provided (partial update)
    const updateData = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value;
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 'No fields to update', 400);
    }

    const updated = await prisma.hosteller.update({
      where: { id: req.params.id },
      data: updateData,
    });

    sendSuccess(res, updated);
  } catch (error) {
    sendError(res, error.message);
  }
};

// ── Bulk CSV upload ──
export const uploadBulkCSV = async (req, res) => {
  if (!req.file) {
    return sendError(res, "No CSV file provided", 400);
  }

  const results = [];
  const errors = [];
  let index = 1;

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
       results.push({ rowNumber: index++, data });
    })
    .on('end', async () => {
      let successCount = 0;

      for (const row of results) {
        try {
          const parsed = hostellerCreateSchema.safeParse(row.data);
          if (!parsed.success) {
            errors.push({ row: row.rowNumber, error: parsed.error.issues[0].message, data: row.data });
            continue;
          }
          
          const rawPassword = generatePassword(parsed.data.name, parsed.data.dob);
          const hashedPassword = await bcrypt.hash(rawPassword, 10);
          
          await prisma.hosteller.create({
            data: {
              ...parsed.data,
              dob: new Date(parsed.data.dob),
              password: hashedPassword
            }
          });
          successCount++;
        } catch (dbErr) {
          errors.push({ row: row.rowNumber, error: dbErr.message, data: row.data });
        }
      }

      // Cleanup uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: `Processed CSV. Inserted: ${successCount}, Failed: ${errors.length}`,
        added: successCount,
        failedRows: errors
      });
    });
};

// ── Delete hosteller ──
export const deleteHosteller = async (req, res) => {
  try {
    const existing = await prisma.hosteller.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Hosteller not found', 404);

    await prisma.hosteller.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error.message);
  }
};
