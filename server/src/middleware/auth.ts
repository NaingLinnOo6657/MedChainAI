import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, AuthRequest } from '../types';
import { logger } from '../utils/logger';
import { JWT_CONFIG, HTTP_STATUS } from '../utils/constants';

// Mock user database - in production, this would be a real database
const users: User[] = [
  {
    id: '1',
    email: 'patient@medchain.ai',
    password: '$2a$10$hashedpassword', // bcrypt hash
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
    password: '$2a$10$hashedpassword',
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
  }
];

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as any;
    
    // In production, fetch user from database
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    JWT_CONFIG.SECRET,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );
};