import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BlockchainService } from '../services/blockchainService';
import { AIService } from '../services/aiService';
import { logger } from '../utils/logger';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const adminId = req.user?.id || '4';

  // Get blockchain network stats
  const networkStats = await BlockchainService.getNetworkStats();

  // Get system health metrics
  const systemHealth = {
    uptime: 99.8,
    activeNodes: 178,
    smartContracts: 1247,
    complianceScore: 100,
    lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    scheduledMaintenance: new Date(Date.now() + 10 * 60 * 60 * 1000) // 10 hours from now
  };

  // Get recent transactions
  const recentTransactions = await BlockchainService.getTransactionHistory();
  const latestTransactions = recentTransactions.slice(0, 10);

  // Compliance status
  const complianceStatus = {
    hipaa: { status: 'verified', lastAudit: new Date('2024-12-01') },
    gdpr: { status: 'verified', lastAudit: new Date('2024-11-15') },
    fda: { status: 'compliant', lastReview: new Date('2024-10-20') }
  };

  res.json({
    success: true,
    data: {
      networkStats,
      systemHealth,
      recentTransactions: latestTransactions,
      complianceStatus,
      summary: {
        totalUsers: 15847,
        activeConsents: networkStats.activeConsents,
        systemAlerts: 0,
        securityIncidents: 0
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/admin/nodes
// @desc    Get blockchain network nodes
// @access  Private (Admin only)
router.get('/nodes', asyncHandler(async (req, res) => {
  const { status, type, limit = 20, offset = 0 } = req.query;

  // Mock node data
  const nodes = [
    {
      id: 'node_001',
      name: 'Metro General Hospital',
      type: 'hospital',
      location: 'New York, NY',
      status: 'active',
      lastSeen: new Date(),
      version: '2.1.0',
      transactions: 15847,
      uptime: 99.9,
      stakingAmount: 50000
    },
    {
      id: 'node_002',
      name: 'City Cardiology Center',
      type: 'clinic',
      location: 'Los Angeles, CA',
      status: 'active',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      version: '2.1.0',
      transactions: 8923,
      uptime: 98.7,
      stakingAmount: 25000
    },
    {
      id: 'node_003',
      name: 'University Medical Center',
      type: 'hospital',
      location: 'Chicago, IL',
      status: 'maintenance',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      version: '2.0.8',
      transactions: 12456,
      uptime: 97.2,
      stakingAmount: 75000
    },
    {
      id: 'node_004',
      name: 'Research Institute Alpha',
      type: 'research',
      location: 'Boston, MA',
      status: 'active',
      lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      version: '2.1.0',
      transactions: 3421,
      uptime: 99.5,
      stakingAmount: 100000
    }
  ];

  let filteredNodes = nodes;

  if (status) {
    filteredNodes = nodes.filter(n => n.status === status);
  }

  if (type) {
    filteredNodes = filteredNodes.filter(n => n.type === type);
  }

  const paginatedNodes = filteredNodes.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    success: true,
    data: paginatedNodes,
    pagination: {
      total: filteredNodes.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredNodes.length
    },
    summary: {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(n => n.status === 'active').length,
      averageUptime: nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/admin/transactions
// @desc    Get blockchain transactions
// @access  Private (Admin only)
router.get('/transactions', asyncHandler(async (req, res) => {
  const { type, status, limit = 50, offset = 0 } = req.query;

  const allTransactions = await BlockchainService.getTransactionHistory();
  
  let filteredTransactions = allTransactions;

  if (type) {
    filteredTransactions = allTransactions.filter(t => t.type === type);
  }

  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  const paginatedTransactions = filteredTransactions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      total: filteredTransactions.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredTransactions.length
    },
    summary: {
      totalTransactions: allTransactions.length,
      confirmedTransactions: allTransactions.filter(t => t.status === 'confirmed').length,
      pendingTransactions: allTransactions.filter(t => t.status === 'pending').length,
      failedTransactions: allTransactions.filter(t => t.status === 'failed').length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/admin/smart-contracts
// @desc    Get smart contract information
// @access  Private (Admin only)
router.get('/smart-contracts', asyncHandler(async (req, res) => {
  const { status, type, limit = 20, offset = 0 } = req.query;

  // Mock smart contract data
  const contracts = [
    {
      id: 'contract_001',
      name: 'ConsentManager',
      type: 'consent_management',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'active',
      version: '2.1.0',
      deployedAt: new Date('2024-01-15'),
      gasUsed: 2847563,
      interactions: 15847,
      lastInteraction: new Date()
    },
    {
      id: 'contract_002',
      name: 'DataAccessControl',
      type: 'access_control',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      status: 'active',
      version: '2.0.5',
      deployedAt: new Date('2024-02-01'),
      gasUsed: 1923847,
      interactions: 8923,
      lastInteraction: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 'contract_003',
      name: 'AIModelRegistry',
      type: 'ai_model',
      address: '0x567890abcdef1234567890abcdef1234567890ab',
      status: 'active',
      version: '1.8.2',
      deployedAt: new Date('2024-03-10'),
      gasUsed: 3421567,
      interactions: 3421,
      lastInteraction: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  let filteredContracts = contracts;

  if (status) {
    filteredContracts = contracts.filter(c => c.status === status);
  }

  if (type) {
    filteredContracts = filteredContracts.filter(c => c.type === type);
  }

  const paginatedContracts = filteredContracts.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    success: true,
    data: paginatedContracts,
    pagination: {
      total: filteredContracts.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredContracts.length
    },
    summary: {
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => c.status === 'active').length,
      totalInteractions: contracts.reduce((sum, c) => sum + c.interactions, 0)
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/admin/compliance
// @desc    Get compliance reports
// @access  Private (Admin only)
router.get('/compliance', asyncHandler(async (req, res) => {
  const { framework, timeframe = '30d' } = req.query;

  // Mock compliance data
  const complianceReports = {
    hipaa: {
      status: 'compliant',
      score: 100,
      lastAudit: new Date('2024-12-01'),
      nextAudit: new Date('2025-06-01'),
      violations: 0,
      recommendations: [],
      certificationExpiry: new Date('2025-12-01')
    },
    gdpr: {
      status: 'compliant',
      score: 100,
      lastAudit: new Date('2024-11-15'),
      nextAudit: new Date('2025-05-15'),
      violations: 0,
      recommendations: [
        'Update privacy policy to include new AI processing details'
      ],
      certificationExpiry: new Date('2025-11-15')
    },
    fda: {
      status: 'compliant',
      score: 98,
      lastReview: new Date('2024-10-20'),
      nextReview: new Date('2025-04-20'),
      violations: 0,
      recommendations: [
        'Document AI model validation procedures',
        'Update clinical trial protocols'
      ],
      certificationExpiry: new Date('2025-10-20')
    }
  };

  // Security metrics
  const securityMetrics = {
    dataBreaches: 0,
    unauthorizedAccess: 0,
    encryptionCompliance: 100,
    accessControlCompliance: 100,
    auditTrailCompleteness: 100,
    lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 3
    }
  };

  let responseData = complianceReports;

  if (framework) {
    responseData = { [framework]: complianceReports[framework as keyof typeof complianceReports] };
  }

  res.json({
    success: true,
    data: {
      compliance: responseData,
      security: securityMetrics,
      overallScore: 99.2,
      timeframe,
      generatedAt: new Date()
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/admin/users
// @desc    Get system users
// @access  Private (Admin only)
router.get('/users', asyncHandler(async (req, res) => {
  const { role, status, limit = 20, offset = 0 } = req.query;

  // Mock user data (without sensitive information)
  const users = [
    {
      id: '1',
      email: 'patient@medchain.ai',
      role: 'patient',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date('2024-01-15'),
      dataConsents: 3,
      healthRecords: 156
    },
    {
      id: '2',
      email: 'doctor@medchain.ai',
      role: 'doctor',
      status: 'active',
      lastLogin: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date('2024-02-01'),
      patients: 127,
      dataRequests: 45
    },
    {
      id: '3',
      email: 'researcher@medchain.ai',
      role: 'researcher',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date('2024-03-10'),
      publications: 8,
      datasetQueries: 234
    }
  ];

  let filteredUsers = users;

  if (role) {
    filteredUsers = users.filter(u => u.role === role);
  }

  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }

  const paginatedUsers = filteredUsers.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      total: filteredUsers.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredUsers.length
    },
    summary: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      usersByRole: {
        patients: users.filter(u => u.role === 'patient').length,
        doctors: users.filter(u => u.role === 'doctor').length,
        researchers: users.filter(u => u.role === 'researcher').length,
        admins: users.filter(u => u.role === 'admin').length
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/admin/system/maintenance
// @desc    Schedule system maintenance
// @access  Private (Admin only)
router.post('/system/maintenance', asyncHandler(async (req, res) => {
  const { scheduledTime, duration, description, affectedServices } = req.body;
  const adminId = req.user?.id || '4';

  const maintenanceId = `maint_${Date.now()}`;

  logger.info(`System maintenance scheduled by admin ${adminId}: ${description}`);

  res.status(201).json({
    success: true,
    data: {
      maintenanceId,
      scheduledTime: new Date(scheduledTime),
      duration,
      description,
      affectedServices,
      status: 'scheduled',
      scheduledBy: adminId
    },
    message: 'System maintenance scheduled successfully',
    timestamp: new Date().toISOString()
  });
}));

export { router as adminRoutes };