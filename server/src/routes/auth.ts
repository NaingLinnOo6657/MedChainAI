import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userValidation } from '../utils/validation';
import { generateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { User } from '../types';

const router = express.Router();

// Mock user database
const users: User[] = [
  {
    id: '1',
    email: 'patient@medchain.ai',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'patient',
    profile: {
      firstName: 'Alex',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-05-15'),
      phone: '+1234567890'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: '2',
    email: 'doctor@medchain.ai',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'doctor',
    profile: {
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      medicalLicenseNumber: 'MD123456',
      specialization: 'Cardiology',
      institutionId: 'hospital-1'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: '3',
    email: 'researcher@medchain.ai',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'researcher',
    profile: {
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      institutionId: 'research-institute-1'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: '4',
    email: 'admin@medchain.ai',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { error } = userValidation.register.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email, password, role, profile } = req.body;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser: User = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    role,
    profile,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };

  users.push(newUser);

  // Generate JWT token
  const token = generateToken(newUser.id, newUser.role);

  logger.info(`New user registered: ${email} (${role})`);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.profile
      },
      token
    },
    message: 'User registered successfully'
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { error } = userValidation.login.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.isActive);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate JWT token
  const token = generateToken(user.id, user.role);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    },
    message: 'Login successful'
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  // This would typically use the auth middleware
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        email: 'patient@medchain.ai',
        role: 'patient',
        profile: {
          firstName: 'Alex',
          lastName: 'Johnson'
        }
      }
    }
  });
}));

export { router as authRoutes };