import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { healthDataValidation, consentValidation } from '../utils/validation';
import { BlockchainService } from '../services/blockchainService';
import { AIService } from '../services/aiService';
import { HealthData, MedicalRecord, HealthMetrics } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock data
const healthDataStore: HealthData[] = [
  {
    id: '1',
    patientId: '1',
    type: 'vitals',
    data: {
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 98.6,
      oxygenSaturation: 98,
      glucose: 95
    },
    timestamp: new Date(),
    source: 'wearable_device',
    verified: true,
    encryptedHash: 'hash123'
  }
];

const medicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    type: 'lab_result',
    title: 'Complete Blood Count',
    description: 'Routine blood work showing normal values',
    data: {
      wbc: 7.2,
      rbc: 4.5,
      hemoglobin: 14.2,
      hematocrit: 42.1
    },
    date: new Date('2024-12-28'),
    tags: ['routine', 'blood_work'],
    attachments: [],
    isConfidential: false
  }
];

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorizeRoles('patient'));

// @route   GET /api/patient/dashboard
// @desc    Get patient dashboard data
// @access  Private (Patient only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const patientId = req.user?.id || '1';

  // Get recent health data
  const recentHealthData = healthDataStore
    .filter(d => d.patientId === patientId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  // Get AI insights
  const insights = await AIService.getPatientInsights(patientId);

  // Get active consents
  const consents = await BlockchainService.getConsentsByPatient(patientId);

  res.json({
    success: true,
    data: {
      healthData: recentHealthData,
      insights: insights.slice(0, 5), // Latest 5 insights
      consents: consents.filter(c => c.status === 'active'),
      summary: {
        totalRecords: healthDataStore.filter(d => d.patientId === patientId).length,
        activeConsents: consents.filter(c => c.status === 'active').length,
        unreadInsights: insights.filter(i => !i.acknowledged).length
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/patient/health-data
// @desc    Get patient health data
// @access  Private (Patient only)
router.get('/health-data', asyncHandler(async (req, res) => {
  const patientId = req.user?.id || '1';
  const { type, limit = 50, offset = 0 } = req.query;

  let filteredData = healthDataStore.filter(d => d.patientId === patientId);

  if (type) {
    filteredData = filteredData.filter(d => d.type === type);
  }

  const paginatedData = filteredData
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    data: paginatedData,
    pagination: {
      total: filteredData.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredData.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/patient/health-data
// @desc    Add new health data
// @access  Private (Patient only)
router.post('/health-data', asyncHandler(async (req, res) => {
  const { error } = healthDataValidation.create.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const patientId = req.user?.id || '1';
  const { type, data, source, timestamp } = req.body;

  // Validate vitals data if type is vitals
  if (type === 'vitals') {
    const { error: vitalsError } = healthDataValidation.vitals.validate(data);
    if (vitalsError) {
      return res.status(400).json({
        success: false,
        message: vitalsError.details[0].message
      });
    }
  }

  const newHealthData: HealthData = {
    id: uuidv4(),
    patientId,
    type,
    data,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    source,
    verified: source === 'manual' ? false : true,
    encryptedHash: `hash_${uuidv4()}`
  };

  healthDataStore.push(newHealthData);

  // Generate AI insights for new data
  const patientHealthData = healthDataStore.filter(d => d.patientId === patientId);
  await AIService.generateHealthInsights(patientId, patientHealthData);

  logger.info(`New health data added for patient ${patientId}: ${type}`);

  res.status(201).json({
    success: true,
    data: newHealthData,
    message: 'Health data added successfully',
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/patient/medical-records
// @desc    Get patient medical records
// @access  Private (Patient only)
router.get('/medical-records', asyncHandler(async (req, res) => {
  const patientId = req.user?.id || '1';
  const { type, limit = 20, offset = 0 } = req.query;

  let filteredRecords = medicalRecords.filter(r => r.patientId === patientId);

  if (type) {
    filteredRecords = filteredRecords.filter(r => r.type === type);
  }

  const paginatedRecords = filteredRecords
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    data: paginatedRecords,
    pagination: {
      total: filteredRecords.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredRecords.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/patient/consents
// @desc    Get patient consent records
// @access  Private (Patient only)
router.get('/consents', asyncHandler(async (req, res) => {
  const patientId = req.user?.id || '1';
  const consents = await BlockchainService.getConsentsByPatient(patientId);

  res.json({
    success: true,
    data: consents,
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/patient/consents/grant
// @desc    Grant data access consent
// @access  Private (Patient only)
router.post('/consents/grant', asyncHandler(async (req, res) => {
  const { error } = consentValidation.grant.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const patientId = req.user?.id || '1';
  const { granteeId, granteeType, dataTypes, expiresAt } = req.body;

  const { txHash, consentId } = await BlockchainService.recordConsentGrant(
    patientId,
    granteeId,
    granteeType,
    dataTypes,
    new Date(expiresAt)
  );

  logger.info(`Consent granted by patient ${patientId} to ${granteeType} ${granteeId}`);

  res.status(201).json({
    success: true,
    data: {
      consentId,
      txHash,
      status: 'active'
    },
    message: 'Consent granted successfully',
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/patient/consents/revoke
// @desc    Revoke data access consent
// @access  Private (Patient only)
router.post('/consents/revoke', asyncHandler(async (req, res) => {
  const { error } = consentValidation.revoke.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const patientId = req.user?.id || '1';
  const { consentId } = req.body;

  const txHash = await BlockchainService.revokeConsent(consentId, patientId);

  logger.info(`Consent ${consentId} revoked by patient ${patientId}`);

  res.json({
    success: true,
    data: {
      consentId,
      txHash,
      status: 'revoked'
    },
    message: 'Consent revoked successfully',
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/patient/insights
// @desc    Get AI health insights
// @access  Private (Patient only)
router.get('/insights', asyncHandler(async (req, res) => {
  const patientId = req.user?.id || '1';
  const { acknowledged, severity, limit = 10 } = req.query;

  let insights = await AIService.getPatientInsights(patientId);

  if (acknowledged !== undefined) {
    insights = insights.filter(i => i.acknowledged === (acknowledged === 'true'));
  }

  if (severity) {
    insights = insights.filter(i => i.severity === severity);
  }

  const limitedInsights = insights.slice(0, Number(limit));

  res.json({
    success: true,
    data: limitedInsights,
    summary: {
      total: insights.length,
      unacknowledged: insights.filter(i => !i.acknowledged).length,
      critical: insights.filter(i => i.severity === 'critical').length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/patient/insights/:id/acknowledge
// @desc    Acknowledge an AI insight
// @access  Private (Patient only)
router.post('/insights/:id/acknowledge', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await AIService.acknowledgeInsight(id);

  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Insight not found'
    });
  }

  res.json({
    success: true,
    message: 'Insight acknowledged successfully',
    timestamp: new Date().toISOString()
  });
}));

export { router as patientRoutes };