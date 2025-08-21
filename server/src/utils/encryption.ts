export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  RESEARCHER: 'researcher',
  ADMIN: 'admin'
} as const;

export const HEALTH_DATA_TYPES = {
  VITALS: 'vitals',
  LAB_RESULTS: 'lab_results',
  IMAGING: 'imaging',
  PRESCRIPTION: 'prescription',
  WEARABLE: 'wearable'
} as const;

export const CONSENT_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired'
} as const;

export const AI_INSIGHT_TYPES = {
  PREDICTION: 'prediction',
  ANOMALY: 'anomaly',
  RECOMMENDATION: 'recommendation'
} as const;

export const AI_INSIGHT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const BLOCKCHAIN_TRANSACTION_TYPES = {
  CONSENT_GRANT: 'consent_grant',
  CONSENT_REVOKE: 'consent_revoke',
  DATA_ACCESS: 'data_access',
  MODEL_UPDATE: 'model_update'
} as const;

export const DEFAULT_PAGINATION = {
  LIMIT: 20,
  OFFSET: 0
} as const;

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'medchain-ai-secret-key-2025',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h'
} as const;

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
} as const;

export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16
} as const;

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;