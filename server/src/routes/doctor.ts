import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { BlockchainService } from '../services/blockchainService';
import { AIService } from '../services/aiService';
import { logger } from '../utils/logger';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);
router.use(authorizeRoles('doctor'));

// @route   GET /api/doctor/dashboard
// @desc    Get doctor dashboard data
// @access  Private (Doctor only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const doctorId = req.user?.id || '2';

  // Mock patient data for the doctor
  const patientStats = {
    activePatients: 127,
    aiAlerts: 3,
    todayAppointments: 12,
    pendingRequests: 5
  };

  // Get recent AI alerts for doctor's patients
  const aiAlerts = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      type: 'High Risk Alert',
      description: 'AI detected potential cardiac event risk based on recent vitals and patient history.',
      severity: 'critical',
      confidence: 0.89,
      timestamp: new Date()
    },
    {
      id: '2',
      patientName: 'Mike Chen',
      type: 'Medication Interaction',
      description: 'Potential drug interaction detected with newly prescribed medication.',
      severity: 'medium',
      confidence: 0.76,
      timestamp: new Date()
    }
  ];

  // Recent patient activity
  const recentActivity = [
    {
      patientName: 'Sarah Johnson',
      activity: 'Vitals uploaded',
      confidence: 95,
      timestamp: '2 hours ago'
    },
    {
      patientName: 'Mike Chen',
      activity: 'Lab results processed',
      confidence: 78,
      timestamp: '4 hours ago'
    }
  ];

  res.json({
    success: true,
    data: {
      stats: patientStats,
      aiAlerts,
      recentActivity,
      summary: {
        totalPatients: patientStats.activePatients,
        criticalAlerts: aiAlerts.filter(a => a.severity === 'critical').length,
        pendingActions: patientStats.pendingRequests
      }
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/doctor/patients
// @desc    Get doctor's patients list
// @access  Private (Doctor only)
router.get('/patients', asyncHandler(async (req, res) => {
  const doctorId = req.user?.id || '2';
  const { search, status, limit = 20, offset = 0 } = req.query;

  // Mock patient data
  const patients = [
    {
      id: '1',
      name: 'Alex Johnson',
      age: 34,
      lastVisit: '2024-12-28',
      condition: 'Hypertension',
      riskLevel: 'medium',
      hasActiveConsent: true,
      aiInsights: 2
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      age: 45,
      lastVisit: '2024-12-30',
      condition: 'Diabetes Type 2',
      riskLevel: 'high',
      hasActiveConsent: true,
      aiInsights: 4
    },
    {
      id: '4',
      name: 'Mike Chen',
      age: 52,
      lastVisit: '2024-12-29',
      condition: 'Cardiovascular Disease',
      riskLevel: 'critical',
      hasActiveConsent: false,
      aiInsights: 1
    }
  ];

  let filteredPatients = patients;

  if (search) {
    filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes((search as string).toLowerCase())
    );
  }

  if (status) {
    filteredPatients = filteredPatients.filter(p => 
      status === 'consented' ? p.hasActiveConsent : !p.hasActiveConsent
    );
  }

  const paginatedPatients = filteredPatients.slice(
    Number(offset), 
    Number(offset) + Number(limit)
  );

  res.json({
    success: true,
    data: paginatedPatients,
    pagination: {
      total: filteredPatients.length,
      limit: Number(limit),
      offset: Number(offset),
      hasMore: Number(offset) + Number(limit) < filteredPatients.length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/doctor/patients/:patientId
// @desc    Get specific patient details
// @access  Private (Doctor only)
router.get('/patients/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const doctorId = req.user?.id || '2';

  // Verify consent
  const hasConsent = await BlockchainService.verifyConsent(
    patientId,
    doctorId,
    'health_data'
  );

  if (!hasConsent) {
    return res.status(403).json({
      success: false,
      message: 'No active consent to access this patient\'s data'
    });
  }

  // Mock patient details
  const patientDetails = {
    id: patientId,
    name: 'Alex Johnson',
    age: 34,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    currentMedications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    ],
    recentVitals: {
      heartRate: 72,
      bloodPressure: '120/80',
      temperature: 98.6,
      oxygenSaturation: 98,
      lastUpdated: new Date()
    },
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosedDate: '2022-03-15',
        status: 'Active'
      }
    ]
  };

  // Get AI insights for this patient
  const insights = await AIService.getPatientInsights(patientId);

  // Record data access on blockchain
  await BlockchainService.recordDataAccess(
    patientId,
    doctorId,
    'patient_details',
    'consent-id-placeholder'
  );

  res.json({
    success: true,
    data: {
      patient: patientDetails,
      insights: insights.slice(0, 5),
      accessGranted: true
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/doctor/data-request
// @desc    Request access to patient data
// @access  Private (Doctor only)
router.post('/data-request', asyncHandler(async (req, res) => {
  const doctorId = req.user?.id || '2';
  const { patientId, dataTypes, reason, duration } = req.body;

  // In a real system, this would send a notification to the patient
  // For now, we'll simulate the request being logged
  
  const requestId = `req_${Date.now()}`;
  
  logger.info(`Data access request: Doctor ${doctorId} requesting ${dataTypes.join(', ')} from patient ${patientId}`);

  res.status(201).json({
    success: true,
    data: {
      requestId,
      status: 'pending',
      patientId,
      dataTypes,
      reason,
      duration,
      requestedAt: new Date()
    },
    message: 'Data access request sent to patient',
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/doctor/ai-insights
// @desc    Get AI insights for doctor's patients
// @access  Private (Doctor only)
router.get('/ai-insights', asyncHandler(async (req, res) => {
  const doctorId = req.user?.id || '2';
  const { severity, acknowledged, limit = 10 } = req.query;

  // Mock AI insights for doctor's patients
  const insights = [
    {
      id: '1',
      patientId: '1',
      patientName: 'Alex Johnson',
      type: 'prediction',
      title: 'Cardiovascular Risk Increase',
      description: 'Patient shows 15% increased risk for cardiovascular events in next 6 months',
      confidence: 0.87,
      severity: 'medium',
      recommendations: [
        'Increase monitoring frequency',
        'Consider medication adjustment',
        'Lifestyle counseling'
      ],
      createdAt: new Date(),
      acknowledged: false
    },
    {
      id: '2',
      patientId: '3',
      patientName: 'Sarah Wilson',
      type: 'anomaly',
      title: 'Glucose Pattern Anomaly',
      description: 'Unusual glucose fluctuation pattern detected over past week',
      confidence: 0.92,
      severity: 'high',
      recommendations: [
        'Review medication compliance',
        'Dietary assessment',
        'Consider continuous glucose monitoring'
      ],
      createdAt: new Date(),
      acknowledged: false
    }
  ];

  let filteredInsights = insights;

  if (severity) {
    filteredInsights = filteredInsights.filter(i => i.severity === severity);
  }

  if (acknowledged !== undefined) {
    filteredInsights = filteredInsights.filter(i => 
      i.acknowledged === (acknowledged === 'true')
    );
  }

  const limitedInsights = filteredInsights.slice(0, Number(limit));

  res.json({
    success: true,
    data: limitedInsights,
    summary: {
      total: filteredInsights.length,
      critical: filteredInsights.filter(i => i.severity === 'critical').length,
      unacknowledged: filteredInsights.filter(i => !i.acknowledged).length
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   POST /api/doctor/ai-insights/:id/acknowledge
// @desc    Acknowledge an AI insight
// @access  Private (Doctor only)
router.post('/ai-insights/:id/acknowledge', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  // In a real system, this would update the insight in the database
  logger.info(`Doctor acknowledged AI insight ${id} with notes: ${notes || 'No notes'}`);

  res.json({
    success: true,
    message: 'AI insight acknowledged successfully',
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/doctor/analytics
// @desc    Get analytics and population health data
// @access  Private (Doctor only)
router.get('/analytics', asyncHandler(async (req, res) => {
  const doctorId = req.user?.id || '2';

  // Get population health trends
  const populationTrends = await AIService.getPopulationHealthTrends();

  // Mock doctor-specific analytics
  const doctorAnalytics = {
    patientOutcomes: {
      improved: 78,
      stable: 15,
      declined: 7
    },
    aiAccuracy: {
      predictions: 94.2,
      anomalyDetection: 89.7,
      recommendations: 91.5
    },
    treatmentEffectiveness: {
      hypertension: 87.3,
      diabetes: 82.1,
      cardiovascular: 79.8
    }
  };

  res.json({
    success: true,
    data: {
      populationTrends,
      doctorAnalytics,
      generatedAt: new Date()
    },
    timestamp: new Date().toISOString()
  });
}));

export { router as doctorRoutes };