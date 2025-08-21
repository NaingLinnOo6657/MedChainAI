export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export const DEMO_USERS = {
  PATIENT: {
    email: 'patient@medchain.ai',
    password: 'password',
    role: 'patient'
  },
  DOCTOR: {
    email: 'doctor@medchain.ai',
    password: 'password',
    role: 'doctor'
  },
  RESEARCHER: {
    email: 'researcher@medchain.ai',
    password: 'password',
    role: 'researcher'
  },
  ADMIN: {
    email: 'admin@medchain.ai',
    password: 'password',
    role: 'admin'
  }
} as const;