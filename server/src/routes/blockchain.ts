import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BlockchainService } from '../services/blockchainService';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/blockchain/transactions
// @desc    Get blockchain transaction history
// @access  Private
router.get('/transactions', asyncHandler(async (req, res) => {
  const { address, type, limit = 20, offset = 0 } = req.query;

  const transactions = await BlockchainService.getTransactionHistory(address as string);
  
  let filteredTransactions = transactions;

  if (type) {
    filteredTransactions = transactions.filter(t => t.type === type);
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
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/blockchain/network-stats
// @desc    Get blockchain network statistics
// @access  Private
router.get('/network-stats', asyncHandler(async (req, res) => {
  const stats = await BlockchainService.getNetworkStats();

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/blockchain/verify-consent
// @desc    Verify consent on blockchain
// @access  Private
router.get('/verify-consent', asyncHandler(async (req, res) => {
  const { patientId, granteeId, dataType } = req.query;

  if (!patientId || !granteeId || !dataType) {
    return res.status(400).json({
      success: false,
      message: 'patientId, granteeId, and dataType are required'
    });
  }

  const isValid = await BlockchainService.verifyConsent(
    patientId as string,
    granteeId as string,
    dataType as string
  );

  res.json({
    success: true,
    data: {
      consentValid: isValid,
      patientId,
      granteeId,
      dataType,
      verifiedAt: new Date()
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/blockchain/record-access
// @desc    Record data access on blockchain
// @access  Private
router.post('/record-access', asyncHandler(async (req, res) => {
  const { patientId, dataType, consentId } = req.body;
  const accessorId = req.user?.id;

  if (!patientId || !dataType || !consentId || !accessorId) {
    return res.status(400).json({
      success: false,
      message: 'patientId, dataType, consentId are required'
    });
  }

  const txHash = await BlockchainService.recordDataAccess(
    patientId,
    accessorId,
    dataType,
    consentId
  );

  res.status(201).json({
    success: true,
    data: {
      txHash,
      patientId,
      accessorId,
      dataType,
      consentId,
      recordedAt: new Date()
    },
    message: 'Data access recorded on blockchain',
    timestamp: new Date().toISOString()
  });
}));

export { router as blockchainRoutes };