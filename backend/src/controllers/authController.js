import bcrypt from 'bcryptjs';
import * as userRepository from '../models/repositories/userRepository.js';
import { registerSchema, loginSchema } from '../models/validations/authSchemas.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a generic User (For attendants/wardens manually, hostellers via script)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }

    const { email, password, role } = parsed.data;

    const userExists = await userRepository.findUserByEmail(email);
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      role: role || 'HOSTELLER'
    });

    generateToken(res, user.id, user.role);

    res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findUserByEmail(email);
    
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
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
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
export const getUserProfile = async (req, res) => {
  try {
    const user = await userRepository.findUserById(req.user.id, true);

    if (user) {
      delete user.password;
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
