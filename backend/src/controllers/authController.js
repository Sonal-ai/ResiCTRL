import bcrypt from 'bcryptjs';
import prisma from '../configs/prismaClient.js';
import { z } from 'zod';
import { generateToken } from '../utils/generateToken.js';

// ── Hostels list for validation ──
const HOSTELS = ['Aryabhatta Hostel', 'CV Raman Hostel', 'Kalpana Hostel', 'Sarojini Hostel', 'Vivekananda Hostel'];

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  designation: z.enum(['WARDEN', 'RESI_WARDEN', 'ATTENDANT']).optional(),
  admin_key: z.string().min(1, { message: 'Admin registration key is required' }),
});

export const registerAdmin = async (req, res) => {
  try {
    const parsed = adminSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const { email, password, name, phone, designation, admin_key } = parsed.data;

    // ── Security: Verify admin registration key ──
    const validKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!validKey) return res.status(503).json({ success: false, message: 'Admin registration is not configured on this server' });
    if (admin_key !== validKey) return res.status(403).json({ success: false, message: 'Invalid admin registration key' });

    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: 'Admin already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        designation: designation || 'WARDEN'
      }
    });

    const token = generateToken(res, admin.id, admin.designation, admin.name);
    res.status(201).json({ success: true, data: { id: admin.id, email: admin.email, name: admin.name, role: admin.designation, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// ── Hosteller Self-Registration ──

const registerHostellerSchema = z.object({
  roll_number: z.string().min(3, 'Roll number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' }),
  hostel_name: z.string().min(1, 'Hostel name is required'),
  room_number: z.string().min(1, 'Room number is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().default(''),
  guardian_contact: z.string().optional().default(''),
});

export const registerHosteller = async (req, res) => {
  try {
    const parsed = registerHostellerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const { roll_number, name, email, password, dob, gender, hostel_name, room_number, phone, guardian_contact } = parsed.data;

    // Check uniqueness
    const existingRoll = await prisma.hosteller.findUnique({ where: { roll_number } });
    if (existingRoll) return res.status(400).json({ success: false, message: 'Roll number already registered' });

    const existingEmail = await prisma.hosteller.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hosteller = await prisma.hosteller.create({
      data: {
        roll_number,
        name,
        email,
        password: hashedPassword,
        dob: new Date(dob),
        gender,
        hostel_name,
        room_number,
        phone: phone || '',
        guardian_contact: guardian_contact || '',
      },
    });

    const token = generateToken(res, hosteller.id, 'HOSTELLER');
    res.status(201).json({
      success: true,
      data: { id: hosteller.id, email: hosteller.email, roll_number: hosteller.roll_number, role: 'HOSTELLER', token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const loginSchema = z.object({ email: z.string(), password: z.string().min(1) });

export const loginAdmin = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({ where: { email } });
    
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = generateToken(res, admin.id, admin.designation, admin.name);
      res.status(200).json({ success: true, data: { id: admin.id, email: admin.email, name: admin.name, role: admin.designation, token } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const loginHosteller = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    // Hosteller can login with email or roll number
    const hosteller = await prisma.hosteller.findFirst({
      where: {
        OR: [{ email }, { roll_number: email }]
      }
    });
    
    if (hosteller && (await bcrypt.compare(password, hosteller.password))) {
      const token = generateToken(res, hosteller.id, 'HOSTELLER');
      res.status(200).json({ success: true, data: { id: hosteller.id, email: hosteller.email, role: 'HOSTELLER', token } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const updatePassSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(6) });

export const updatePassword = async (req, res) => {
  try {
    const parsed = updatePassSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid format' });

    const { oldPassword, newPassword } = parsed.data;
    const userId = req.user.id;
    const role = req.user.role;

    let userModel = role === 'HOSTELLER' ? 'hosteller' : 'admin';
    const user = await prisma[userModel].findUnique({ where: { id: userId } });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(401).json({ success: false, message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma[userModel].update({ where: { id: userId }, data: { password: hashedPassword } });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
