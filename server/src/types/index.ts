export interface User {
  id: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'researcher' | 'admin';
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: Address;
  medicalLicenseNumber?: string; // For doctors
  institutionId?: string; // For researchers/doctors
  specialization?: string; // For doctors
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface HealthData {
  id: string;
  patientId: string;
  type: 'vitals' | 'lab_results' | 'imaging' | 'prescription' | 'wearable';
  data: any;
  timestamp: Date;
  source: string;
  verified: boolean;
  encryptedHash: string;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  granteeId: string;
  granteeType: 'doctor' | 'researcher' | 'institution';
  dataTypes: string[];
  permissions: Permission[];
  status: 'active' | 'revoked' | 'expired';
  grantedAt: Date;
  expiresAt: Date;
  blockchainTxHash: string;
}

export interface Permission {
  action: 'read' | 'write' | 'share';
  resource: string;
  conditions?: any;
}

export interface AIInsight {
  id: string;
  patientId: string;
  type: 'prediction' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  modelVersion: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface FederatedModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'anomaly_detection';
  description: string;
  accuracy: number;
  participatingNodes: number;
  lastUpdated: Date;
  isActive: boolean;
  modelHash: string;
}

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  type: 'consent_grant' | 'consent_revoke' | 'data_access' | 'model_update';
  fromAddress: string;
  toAddress?: string;
  data: any;
  gasUsed: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface HealthMetrics {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  oxygenSaturation?: number;
  glucose?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'diagnosis' | 'treatment' | 'prescription' | 'lab_result' | 'imaging';
  title: string;
  description: string;
  data: any;
  doctorId?: string;
  institutionId?: string;
  date: Date;
  tags: string[];
  attachments: string[];
  isConfidential: boolean;
}