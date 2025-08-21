import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';
import { aiInsightValidation } from '../utils/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/ai/models
// @desc    Get available AI models
// @access  Private
router.get('/models', asyncHandler(async (req, res) => {
  const models = await AIService.getFederatedModels();

  res.json({
    success: true,
    data: models,
    summary: {
      total: models.length,
      averageAccuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / models.length,
      totalNodes: models.reduce((sum, m) => sum + m.participatingNodes, 0)
    },
    timestamp: new Date().toISOString()
  });
}));

// @route   GET /api/ai/insights/:patientId
// @desc    Get AI insights for a patient
// @access  Private (Patient, Doctor)
router.get('/insights/:patientId', 
  authorizeRoles('patient', 'doctor'),
  asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { severity, acknowledged, limit = 10 } = req.query;

    // Check if user can access this patient's data
    if (req.user?.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let insights = await AIService.getPatientInsights(patientId);

    if (severity) {
      insights = insights.filter(i => i.severity === severity);
    }

    if (acknowledged !== undefined) {
      insights = insights.filter(i => i.acknowledged === (acknowledged === 'true'));
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
  })
);

// @route   POST /api/ai/insights
// @desc    Create new AI insight
// @access  Private (System/AI Service)
router.post('/insights', 
  authorizeRoles('admin', 'doctor'),
  asyncHandler(async (req, res) => {
    const { error } = aiInsightValidation.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // In a real system, this would be called by the AI service
    // For now, we'll simulate creating an insight
    const insight = {
      id: `insight_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      acknowledged: false
    };

    res.status(201).json({
      success: true,
      data: insight,
      message: 'AI insight created successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// @route   POST /api/ai/predict-risk
// @desc    Predict disease risk for a patient
// @access  Private (Doctor)
router.post('/predict-risk',
  authorizeRoles('doctor'),
  asyncHandler(async (req, res) => {
    const { patientId, diseaseType, healthData } = req.body;

    if (!patientId || !diseaseType) {
      return res.status(400).json({
        success: false,
        message: 'patientId and diseaseType are required'
      });
    }

    const prediction = await AIService.predictDiseaseRisk(
      patientId,
      diseaseType,
      healthData || []
    );

    res.json({
      success: true,
      data: {
        patientId,
        diseaseType,
        prediction,
        generatedAt: new Date()
      },
      timestamp: new Date().toISOString()
    });
  })
);

// @route   GET /api/ai/population-trends
// @desc    Get population health trends
// @access  Private (Doctor, Researcher, Admin)
router.get('/population-trends',
  authorizeRoles('doctor', 'researcher', 'admin'),
  asyncHandler(async (req, res) => {
    const trends = await AIService.getPopulationHealthTrends();

    res.json({
      success: true,
      data: trends,
      timestamp: new Date().toISOString()
    });
  })
);

// @route   POST /api/ai/federated-training/:modelId
// @desc    Initiate federated training
// @access  Private (Researcher, Admin)
router.post('/federated-training/:modelId',
  authorizeRoles('researcher', 'admin'),
  asyncHandler(async (req, res) => {
    const { modelId } = req.params;

    const trainingResult = await AIService.simulateFederatedTraining(modelId);

    if (!trainingResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate federated training'
      });
    }

    res.json({
      success: true,
      data: {
        modelId,
        trainingStatus: 'initiated',
        newAccuracy: trainingResult.newAccuracy,
        participatingNodes: trainingResult.participatingNodes,
        estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      },
      message: 'Federated training initiated successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// @route   POST /api/ai/insights/:id/acknowledge
// @desc    Acknowledge an AI insight
// @access  Private (Patient, Doctor)
router.post('/insights/:id/acknowledge',
  authorizeRoles('patient', 'doctor'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    const success = await AIService.acknowledgeInsight(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    res.json({
      success: true,
      data: {
        insightId: id,
        acknowledgedBy: req.user?.id,
        acknowledgedAt: new Date(),
        notes: notes || null
      },
      message: 'Insight acknowledged successfully',
      timestamp: new Date().toISOString()
    });
  })
);

export { router as aiRoutes };