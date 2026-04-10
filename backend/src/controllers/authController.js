import bcrypt from 'bcryptjs';
import prisma from '../configs/prismaClient.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a generic User (For attendants/wardens manually, hostellers via script)
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'HOSTELLER'
      }
    });

    generateToken(res, user.id, user.role);

    res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user.id, user.role);
      res.status(200).json({
        success: true,
        data: { id: user.id, email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { student: true } // grab attached student info if exists
    });

    if (user) {
      delete user.password;
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
