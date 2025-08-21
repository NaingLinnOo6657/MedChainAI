import { v4 as uuidv4 } from 'uuid';
import { BlockchainTransaction, ConsentRecord } from '../types';
import { logger } from '../utils/logger';
import { EncryptionService } from '../utils/encryption';

// Mock blockchain service - in production, this would interact with actual blockchain
export class BlockchainService {
  private static transactions: BlockchainTransaction[] = [];
  private static consents: ConsentRecord[] = [];

  static async recordConsentGrant(
    patientId: string,
    granteeId: string,
    granteeType: 'doctor' | 'researcher' | 'institution',
    dataTypes: string[],
    expiresAt: Date
  ): Promise<{ txHash: string; consentId: string }> {
    try {
      const txHash = EncryptionService.generateSecureToken();
      const consentId = uuidv4();

      // Create blockchain transaction
      const transaction: BlockchainTransaction = {
        id: uuidv4(),
        txHash,
        type: 'consent_grant',
        fromAddress: `patient_${patientId}`,
        toAddress: `${granteeType}_${granteeId}`,
        data: {
          consentId,
          dataTypes,
          expiresAt: expiresAt.toISOString()
        },
        gasUsed: 21000,
        timestamp: new Date(),
        status: 'confirmed'
      };

      // Create consent record
      const consent: ConsentRecord = {
        id: consentId,
        patientId,
        granteeId,
        granteeType,
        dataTypes,
        permissions: [
          { action: 'read', resource: 'health_data' },
          { action: 'read', resource: 'medical_records' }
        ],
        status: 'active',
        grantedAt: new Date(),
        expiresAt,
        blockchainTxHash: txHash
      };

      this.transactions.push(transaction);
      this.consents.push(consent);

      logger.info(`Consent granted on blockchain: ${txHash}`);
      return { txHash, consentId };
    } catch (error) {
      logger.error('Blockchain consent grant failed:', error);
      throw new Error('Failed to record consent on blockchain');
    }
  }

  static async revokeConsent(consentId: string, patientId: string): Promise<string> {
    try {
      const txHash = EncryptionService.generateSecureToken();
      
      // Update consent status
      const consent = this.consents.find(c => c.id === consentId && c.patientId === patientId);
      if (consent) {
        consent.status = 'revoked';
      }

      // Create revocation transaction
      const transaction: BlockchainTransaction = {
        id: uuidv4(),
        txHash,
        type: 'consent_revoke',
        fromAddress: `patient_${patientId}`,
        data: { consentId },
        gasUsed: 15000,
        timestamp: new Date(),
        status: 'confirmed'
      };

      this.transactions.push(transaction);
      logger.info(`Consent revoked on blockchain: ${txHash}`);
      return txHash;
    } catch (error) {
      logger.error('Blockchain consent revocation failed:', error);
      throw new Error('Failed to revoke consent on blockchain');
    }
  }

  static async recordDataAccess(
    patientId: string,
    accessorId: string,
    dataType: string,
    consentId: string
  ): Promise<string> {
    try {
      const txHash = EncryptionService.generateSecureToken();

      const transaction: BlockchainTransaction = {
        id: uuidv4(),
        txHash,
        type: 'data_access',
        fromAddress: `accessor_${accessorId}`,
        toAddress: `patient_${patientId}`,
        data: {
          dataType,
          consentId,
          timestamp: new Date().toISOString()
        },
        gasUsed: 12000,
        timestamp: new Date(),
        status: 'confirmed'
      };

      this.transactions.push(transaction);
      logger.info(`Data access recorded on blockchain: ${txHash}`);
      return txHash;
    } catch (error) {
      logger.error('Blockchain data access recording failed:', error);
      throw new Error('Failed to record data access on blockchain');
    }
  }

  static async getConsentsByPatient(patientId: string): Promise<ConsentRecord[]> {
    return this.consents.filter(c => c.patientId === patientId);
  }

  static async getTransactionHistory(address?: string): Promise<BlockchainTransaction[]> {
    if (address) {
      return this.transactions.filter(
        t => t.fromAddress === address || t.toAddress === address
      );
    }
    return this.transactions;
  }

  static async verifyConsent(
    patientId: string,
    granteeId: string,
    dataType: string
  ): Promise<boolean> {
    const activeConsents = this.consents.filter(
      c => c.patientId === patientId &&
           c.granteeId === granteeId &&
           c.status === 'active' &&
           c.expiresAt > new Date() &&
           c.dataTypes.includes(dataType)
    );

    return activeConsents.length > 0;
  }

  static async getNetworkStats(): Promise<{
    totalTransactions: number;
    activeConsents: number;
    networkNodes: number;
    averageBlockTime: number;
  }> {
    return {
      totalTransactions: this.transactions.length,
      activeConsents: this.consents.filter(c => c.status === 'active').length,
      networkNodes: 178, // Mock data
      averageBlockTime: 2.3 // seconds
    };
  }
}