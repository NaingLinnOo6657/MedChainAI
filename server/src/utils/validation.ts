import Joi from 'joi';

export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    role: Joi.string().valid('patient', 'doctor', 'researcher', 'admin').required(),
    profile: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      dateOfBirth: Joi.date().max('now').optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
      medicalLicenseNumber: Joi.string().when('role', {
        is: 'doctor',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      specialization: Joi.string().when('role', {
        is: 'doctor',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      institutionId: Joi.string().when('role', {
        is: Joi.valid('doctor', 'researcher'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    }).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const healthDataValidation = {
  create: Joi.object({
    type: Joi.string().valid('vitals', 'lab_results', 'imaging', 'prescription', 'wearable').required(),
    data: Joi.object().required(),
    source: Joi.string().required(),
    timestamp: Joi.date().default(Date.now)
  }),

  vitals: Joi.object({
    heartRate: Joi.number().min(30).max(220).optional(),
    bloodPressure: Joi.object({
      systolic: Joi.number().min(70).max(250).required(),
      diastolic: Joi.number().min(40).max(150).required()
    }).optional(),
    temperature: Joi.number().min(95).max(110).optional(),
    oxygenSaturation: Joi.number().min(70).max(100).optional(),
    glucose: Joi.number().min(50).max(500).optional(),
    weight: Joi.number().min(20).max(500).optional(),
    height: Joi.number().min(50).max(250).optional()
  })
};

export const consentValidation = {
  grant: Joi.object({
    granteeId: Joi.string().required(),
    granteeType: Joi.string().valid('doctor', 'researcher', 'institution').required(),
    dataTypes: Joi.array().items(Joi.string()).min(1).required(),
    permissions: Joi.array().items(
      Joi.object({
        action: Joi.string().valid('read', 'write', 'share').required(),
        resource: Joi.string().required(),
        conditions: Joi.object().optional()
      })
    ).required(),
    expiresAt: Joi.date().greater('now').required()
  }),

  revoke: Joi.object({
    consentId: Joi.string().required(),
    reason: Joi.string().optional()
  })
};

export const aiInsightValidation = {
  create: Joi.object({
    patientId: Joi.string().required(),
    type: Joi.string().valid('prediction', 'anomaly', 'recommendation').required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    confidence: Joi.number().min(0).max(1).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    data: Joi.object().required(),
    modelVersion: Joi.string().required()
  })
};