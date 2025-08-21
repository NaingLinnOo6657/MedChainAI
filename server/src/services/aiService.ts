import { v4 as uuidv4 } from 'uuid';
import { AIInsight, FederatedModel, HealthData, HealthMetrics } from '../types';
import { logger } from '../utils/logger';

export class AIService {
  private static models: FederatedModel[] = [
    {
      id: '1',
      name: 'Cardiovascular Risk Prediction',
      version: '2.1.0',
      type: 'classification',
      description: 'Predicts cardiovascular disease risk based on patient vitals and history',
      accuracy: 0.942,
      participatingNodes: 45,
      lastUpdated: new Date(),
      isActive: true,
      modelHash: 'sha256:abc123...'
    },
    {
      id: '2',
      name: 'Early Cancer Detection',
      version: '1.8.3',
      type: 'classification',
      description: 'Multi-modal AI for early cancer detection using lab results and imaging',
      accuracy: 0.887,
      participatingNodes: 32,
      lastUpdated: new Date(),
      isActive: true,
      modelHash: 'sha256:def456...'
    },
    {
      id: '3',
      name: 'Anomaly Detection System',
      version: '3.0.1',
      type: 'anomaly_detection',
      description: 'Real-time anomaly detection for vital signs and wearable data',
      accuracy: 0.923,
      participatingNodes: 67,
      lastUpdated: new Date(),
      isActive: true,
      modelHash: 'sha256:ghi789...'
    }
  ];

  private static insights: AIInsight[] = [];

  static async generateHealthInsights(
    patientId: string,
    healthData: HealthData[]
  ): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];

      // Analyze recent vitals for anomalies
      const recentVitals = healthData
        .filter(d => d.type === 'vitals')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      if (recentVitals.length > 0) {
        const latestVitals = recentVitals[0].data as HealthMetrics;

        // Heart rate anomaly detection
        if (latestVitals.heartRate && (latestVitals.heartRate > 100 || latestVitals.heartRate < 60)) {
          insights.push({
            id: uuidv4(),
            patientId,
            type: 'anomaly',
            title: 'Irregular Heart Rate Detected',
            description: `Heart rate of ${latestVitals.heartRate} BPM is outside normal range. Consider monitoring closely.`,
            confidence: 0.87,
            severity: latestVitals.heartRate > 120 || latestVitals.heartRate < 50 ? 'high' : 'medium',
            data: { heartRate: latestVitals.heartRate, threshold: '60-100 BPM' },
            modelVersion: '3.0.1',
            createdAt: new Date(),
            acknowledged: false
          });
        }

        // Blood pressure analysis
        if (latestVitals.bloodPressure) {
          const { systolic, diastolic } = latestVitals.bloodPressure;
          if (systolic > 140 || diastolic > 90) {
            insights.push({
              id: uuidv4(),
              patientId,
              type: 'prediction',
              title: 'Hypertension Risk Detected',
              description: `Blood pressure ${systolic}/${diastolic} indicates potential hypertension. Lifestyle modifications recommended.`,
              confidence: 0.92,
              severity: systolic > 160 || diastolic > 100 ? 'high' : 'medium',
              data: { bloodPressure: latestVitals.bloodPressure },
              modelVersion: '2.1.0',
              createdAt: new Date(),
              acknowledged: false
            });
          }
        }

        // Glucose level analysis
        if (latestVitals.glucose && latestVitals.glucose > 126) {
          insights.push({
            id: uuidv4(),
            patientId,
            type: 'prediction',
            title: 'Elevated Glucose Levels',
            description: `Glucose level of ${latestVitals.glucose} mg/dL suggests potential diabetes risk. Consult with endocrinologist.`,
            confidence: 0.89,
            severity: latestVitals.glucose > 200 ? 'critical' : 'high',
            data: { glucose: latestVitals.glucose, threshold: '<126 mg/dL' },
            modelVersion: '2.1.0',
            createdAt: new Date(),
            acknowledged: false
          });
        }
      }

      // Generate positive insights for stable metrics
      if (recentVitals.length >= 5) {
        const avgHeartRate = recentVitals
          .map(v => v.data.heartRate)
          .filter(hr => hr)
          .reduce((sum, hr, _, arr) => sum + hr / arr.length, 0);

        if (avgHeartRate >= 60 && avgHeartRate <= 80) {
          insights.push({
            id: uuidv4(),
            patientId,
            type: 'recommendation',
            title: 'Excellent Cardiovascular Health',
            description: 'Your heart rate has been consistently in the optimal range. Continue your current exercise routine.',
            confidence: 0.94,
            severity: 'low',
            data: { averageHeartRate: Math.round(avgHeartRate) },
            modelVersion: '2.1.0',
            createdAt: new Date(),
            acknowledged: false
          });
        }
      }

      // Store insights
      this.insights.push(...insights);
      
      logger.info(`Generated ${insights.length} AI insights for patient ${patientId}`);
      return insights;
    } catch (error) {
      logger.error('AI insight generation failed:', error);
      throw new Error('Failed to generate AI insights');
    }
  }

  static async getPatientInsights(patientId: string): Promise<AIInsight[]> {
    return this.insights
      .filter(i => i.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async acknowledgeInsight(insightId: string): Promise<boolean> {
    const insight = this.insights.find(i => i.id === insightId);
    if (insight) {
      insight.acknowledged = true;
      return true;
    }
    return false;
  }

  static async getFederatedModels(): Promise<FederatedModel[]> {
    return this.models.filter(m => m.isActive);
  }

  static async updateModelAccuracy(modelId: string, accuracy: number): Promise<boolean> {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.accuracy = accuracy;
      model.lastUpdated = new Date();
      logger.info(`Updated model ${modelId} accuracy to ${accuracy}`);
      return true;
    }
    return false;
  }

  static async simulateFederatedTraining(modelId: string): Promise<{
    success: boolean;
    newAccuracy: number;
    participatingNodes: number;
  }> {
    try {
      const model = this.models.find(m => m.id === modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      // Simulate training improvement
      const improvement = (Math.random() * 0.02) - 0.01; // -1% to +1%
      const newAccuracy = Math.min(0.99, Math.max(0.5, model.accuracy + improvement));
      
      model.accuracy = newAccuracy;
      model.lastUpdated = new Date();
      model.participatingNodes += Math.floor(Math.random() * 3); // Add 0-2 nodes

      logger.info(`Federated training completed for model ${modelId}: ${newAccuracy}`);
      
      return {
        success: true,
        newAccuracy,
        participatingNodes: model.participatingNodes
      };
    } catch (error) {
      logger.error('Federated training simulation failed:', error);
      return {
        success: false,
        newAccuracy: 0,
        participatingNodes: 0
      };
    }
  }

  static async getPopulationHealthTrends(): Promise<{
    diabetesPrevalence: { value: number; change: number };
    hypertensionCases: { value: number; change: number };
    mentalHealthIssues: { value: number; change: number };
    averageLifeExpectancy: { value: number; change: number };
  }> {
    // Mock population health data
    return {
      diabetesPrevalence: { value: 11.3, change: 0.2 },
      hypertensionCases: { value: 45.6, change: -1.1 },
      mentalHealthIssues: { value: 23.4, change: 3.2 },
      averageLifeExpectancy: { value: 78.9, change: 0.3 }
    };
  }

  static async predictDiseaseRisk(
    patientId: string,
    diseaseType: string,
    healthData: HealthData[]
  ): Promise<{
    riskScore: number;
    confidence: number;
    factors: string[];
    recommendations: string[];
  }> {
    // Mock disease risk prediction
    const riskScore = Math.random() * 0.8; // 0-80% risk
    const confidence = 0.85 + (Math.random() * 0.1); // 85-95% confidence

    const factors = [];
    const recommendations = [];

    if (diseaseType === 'cardiovascular') {
      factors.push('Elevated blood pressure', 'Family history', 'Sedentary lifestyle');
      recommendations.push('Increase physical activity', 'Monitor blood pressure daily', 'Consider cardiology consultation');
    } else if (diseaseType === 'diabetes') {
      factors.push('High glucose levels', 'BMI over 25', 'Age over 45');
      recommendations.push('Dietary modifications', 'Regular glucose monitoring', 'Weight management program');
    }

    return {
      riskScore,
      confidence,
      factors,
      recommendations
    };
  }
}