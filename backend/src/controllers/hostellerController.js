import bcrypt from 'bcryptjs';
import prisma from '../configs/prismaClient.js';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';

export const getAllHostellers = async (req, res) => {
  try {
    const hostellers = await prisma.hosteller.findMany({ orderBy: { name: 'asc' } });
    res.json(hostellers);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHostellerById = async (req, res) => {
  try {
    const hosteller = await prisma.hosteller.findUnique({
      where: { id: req.params.id },
      include: { leaves: true, scanEvents: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });
    if (!hosteller) return res.status(404).json({ error: 'Hosteller not found' });
    res.json(hosteller);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
  // name part (first 4 chars or full)
  const namePart = name.slice(0, 4);
  // dob should be formatted string ideally
  const cleanDob = dobString.replace(/[-/:\s]/g, ''); // strip non-numerics to aim for DDMMYYYY
  return namePart + cleanDob;
};

export const createHosteller = async (req, res) => {
  try {
    const parsed = hostellerCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const rawPassword = generatePassword(parsed.data.name, parsed.data.dob);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const hosteller = await prisma.hosteller.create({
      data: {
        ...parsed.data,
        dob: new Date(parsed.data.dob),
        password: hashedPassword
      }
    });
    res.status(201).json({ success: true, data: hosteller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadBulkCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No CSV file provided" });
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

export const deleteHosteller = async (req, res) => {
  try {
    await prisma.hosteller.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
