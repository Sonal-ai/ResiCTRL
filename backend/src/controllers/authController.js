import bcrypt from 'bcryptjs';
import prisma from '../configs/prismaClient.js';
import { z } from 'zod';
import { generateToken } from '../utils/generateToken.js';

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
