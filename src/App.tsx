import React, { useState, useEffect } from 'react';
import { Stethoscope, User, Search, Shield, Heart, Brain, Activity, Bell, Settings, LogOut, Menu, X, Plus, Eye, Lock, Unlock, Users, Database, BarChart3, FileText, Calendar, MessageCircle, AlertTriangle, CheckCircle, TrendingUp, Download, Share2 } from 'lucide-react';

// Types
type UserRole = 'patient' | 'doctor' | 'researcher' | 'admin';

interface HealthData {
  heartRate: number;
  bloodPressure: string;
  glucose: number;
  temperature: number;
  oxygenSaturation: number;
  lastUpdated: string;
}

interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
}

interface ConsentRecord {
  id: string;
  doctor: string;
  hospital: string;
  dataTypes: string[];
  granted: string;
  expires: string;
  status: 'active' | 'revoked' | 'expired';
}

// Mock data
const mockHealthData: HealthData = {
  heartRate: 72,
  bloodPressure: '120/80',
  glucose: 95,
  temperature: 98.6,
  oxygenSaturation: 98,
  lastUpdated: '2025-01-01 14:30'
};

const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Irregular Heart Rate Pattern Detected',
    description: 'Your heart rate has shown unusual variations over the past 3 days. Consider consulting with your cardiologist.',
    confidence: 0.87,
    timestamp: '2025-01-01 12:00'
  },
  {
    id: '2',
    type: 'info',
    title: 'Sleep Quality Improvement Suggested',
    description: 'Based on your activity patterns, adjusting your bedtime by 30 minutes could improve sleep quality.',
    confidence: 0.74,
    timestamp: '2025-01-01 08:00'
  },
  {
    id: '3',
    type: 'success',
    title: 'Blood Glucose Levels Stable',
    description: 'Your glucose management has been excellent over the past week. Continue your current routine.',
    confidence: 0.92,
    timestamp: '2024-12-31 20:00'
  }
];

const mockConsentRecords: ConsentRecord[] = [
  {
    id: '1',
    doctor: 'Dr. Sarah Johnson',
    hospital: 'Metro General Hospital',
    dataTypes: ['Lab Results', 'Vital Signs', 'Prescriptions'],
    granted: '2024-12-15',
    expires: '2025-03-15',
    status: 'active'
  },
  {
    id: '2',
    doctor: 'Dr. Michael Chen',
    hospital: 'City Cardiology Center',
    dataTypes: ['ECG Data', 'Vital Signs'],
    granted: '2024-11-20',
    expires: '2025-02-20',
    status: 'active'
  },
  {
    id: '3',
    doctor: 'Dr. Emily Rodriguez',
    hospital: 'University Medical Center',
    dataTypes: ['All Data'],
    granted: '2024-10-10',
    expires: '2024-12-10',
    status: 'expired'
  }
];

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Theme configuration for each role
  const themes = {
    patient: {
      primary: 'from-green-400 to-blue-500',
      accent: 'bg-green-500',
      background: 'bg-gradient-to-br from-green-50 to-blue-50',
      card: 'bg-white',
      text: 'text-gray-800'
    },
    doctor: {
      primary: 'from-blue-600 to-blue-800',
      accent: 'bg-blue-600',
      background: 'bg-gray-50',
      card: 'bg-white',
      text: 'text-gray-800'
    },
    researcher: {
      primary: 'from-purple-500 to-purple-700',
      accent: 'bg-purple-600',
      background: 'bg-purple-50',
      card: 'bg-white',
      text: 'text-gray-800'
    },
    admin: {
      primary: 'from-gray-600 to-cyan-600',
      accent: 'bg-cyan-600',
      background: 'bg-gray-50',
      card: 'bg-white',
      text: 'text-gray-800'
    }
  };

  const currentTheme = themes[currentRole];

  // Navigation items for each role
  const navItems = {
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: Activity },
      { id: 'records', label: 'Medical Records', icon: FileText },
      { id: 'consent', label: 'Data Consent', icon: Shield },
      { id: 'insights', label: 'AI Insights', icon: Brain },
      { id: 'notifications', label: 'Notifications', icon: Bell }
    ],
    doctor: [
      { id: 'dashboard', label: 'Patient Overview', icon: Users },
      { id: 'requests', label: 'Data Requests', icon: Search },
      { id: 'tools', label: 'Clinical Tools', icon: Stethoscope },
      { id: 'communication', label: 'Messages', icon: MessageCircle },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ],
    researcher: [
      { id: 'dashboard', label: 'Dataset Explorer', icon: Database },
      { id: 'training', label: 'AI Model Training', icon: Brain },
      { id: 'analytics', label: 'Analytics Suite', icon: BarChart3 },
      { id: 'publications', label: 'Publications', icon: FileText }
    ],
    admin: [
      { id: 'dashboard', label: 'System Overview', icon: Shield },
      { id: 'nodes', label: 'Node Management', icon: Database },
      { id: 'contracts', label: 'Smart Contracts', icon: Lock },
      { id: 'compliance', label: 'Compliance', icon: CheckCircle }
    ]
  };

  const HealthMetricCard = ({ title, value, unit, icon: Icon, trend }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${currentTheme.accent} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${currentRole === 'patient' ? 'green' : currentRole === 'doctor' ? 'blue' : currentRole === 'researcher' ? 'purple' : 'cyan'}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}{unit && <span className="text-lg font-normal text-gray-600 ml-1">{unit}</span>}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );

  const AIInsightCard = ({ insight }: { insight: AIInsight }) => (
    <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm border-l-4 ${
      insight.type === 'warning' ? 'border-amber-400' : 
      insight.type === 'info' ? 'border-blue-400' : 
      'border-green-400'
    }`}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${
          insight.type === 'warning' ? 'bg-amber-100' : 
          insight.type === 'info' ? 'bg-blue-100' : 
          'bg-green-100'
        }`}>
          {insight.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : insight.type === 'info' ? (
            <Brain className="w-5 h-5 text-blue-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
            <span>{insight.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ConsentRecordCard = ({ record }: { record: ConsentRecord }) => (
    <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{record.doctor}</h3>
          <p className="text-sm text-gray-600">{record.hospital}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          record.status === 'active' ? 'bg-green-100 text-green-800' :
          record.status === 'expired' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {record.status}
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Data Types:</p>
          <div className="flex flex-wrap gap-1">
            {record.dataTypes.map((type, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Granted: {record.granted}</span>
          <span>Expires: {record.expires}</span>
        </div>
        <div className="flex space-x-2 pt-2">
          <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
            Revoke Access
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (currentRole === 'patient') {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex</h1>
            <p className="text-gray-600">Your health dashboard shows all systems are functioning well.</p>
          </div>

          {/* Health Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <HealthMetricCard
              title="Heart Rate"
              value={mockHealthData.heartRate}
              unit="bpm"
              icon={Heart}
              trend="stable"
            />
            <HealthMetricCard
              title="Blood Pressure"
              value={mockHealthData.bloodPressure}
              unit="mmHg"
              icon={Activity}
              trend="stable"
            />
            <HealthMetricCard
              title="Glucose"
              value={mockHealthData.glucose}
              unit="mg/dL"
              icon={TrendingUp}
              trend="down"
            />
            <HealthMetricCard
              title="Temperature"
              value={mockHealthData.temperature}
              unit="°F"
              icon={Activity}
              trend="stable"
            />
            <HealthMetricCard
              title="Oxygen Sat"
              value={mockHealthData.oxygenSaturation}
              unit="%"
              icon={Activity}
              trend="up"
            />
          </div>

          {/* AI Insights */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Health Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockAIInsights.map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Cardiology Appointment</p>
                  <p className="text-sm text-gray-600">January 3, 2025 at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Lab Results Available</p>
                  <p className="text-sm text-gray-600">Complete Blood Count - December 28, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentRole === 'doctor') {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Overview</h1>
            <p className="text-gray-600">Monitor your patients and access AI-powered clinical insights.</p>
          </div>

          {/* Patient Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                  <p className="text-sm text-gray-600">Active Patients</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-600">AI Alerts</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Search className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Patient Alerts */}
          <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Patient Alerts</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">High Risk Alert - Sarah Johnson</h3>
                  <p className="text-sm text-gray-600 mb-2">AI detected potential cardiac event risk based on recent vitals and patient history.</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">Review</button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm">Schedule</button>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg">
                <Brain className="w-5 h-5 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Medication Interaction - Mike Chen</h3>
                  <p className="text-sm text-gray-600 mb-2">Potential drug interaction detected with newly prescribed medication.</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-amber-600 text-white rounded text-sm">Review</button>
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm">Contact Patient</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Patient Activity */}
          <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Patient Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Patient</th>
                    <th className="text-left py-2">Activity</th>
                    <th className="text-left py-2">AI Confidence</th>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3">Sarah Johnson</td>
                    <td className="py-3">Vitals uploaded</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">95%</span></td>
                    <td className="py-3">2 hours ago</td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3">Mike Chen</td>
                    <td className="py-3">Lab results processed</td>
                    <td className="py-3"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">78%</span></td>
                    <td className="py-3">4 hours ago</td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800">Review</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentRole === 'researcher') {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Dashboard</h1>
            <p className="text-gray-600">Explore anonymized datasets and contribute to federated AI model training.</p>
          </div>

          {/* Research Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Database className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">2.4M</p>
                  <p className="text-sm text-gray-600">Anonymized Records</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Brain className="w-8 h-8 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                  <p className="text-sm text-gray-600">Active Models</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-sm text-gray-600">Participating Nodes</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  <p className="text-sm text-gray-600">Model Accuracy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Federated Learning Models */}
          <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Federated Learning Models</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Cardiovascular Risk Prediction</h3>
                    <p className="text-sm text-gray-600">Training on 250,000+ patient records across 45 hospitals</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-600 font-medium">94.2% accuracy</span>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Join Training</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Early Cancer Detection</h3>
                    <p className="text-sm text-gray-600">Multi-modal AI combining lab results and imaging data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-amber-600 font-medium">Training</span>
                  <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg text-sm">View Progress</button>
                </div>
              </div>
            </div>
          </div>

          {/* Research Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Population Health Trends</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Diabetes Prevalence</span>
                  <span className="font-semibold">11.3% ↑ 0.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Hypertension Cases</span>
                  <span className="font-semibold">45.6% ↓ 1.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Mental Health</span>
                  <span className="font-semibold">23.4% ↑ 3.2%</span>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Model Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Prediction Accuracy</span>
                  <span className="font-semibold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">False Positive Rate</span>
                  <span className="font-semibold text-blue-600">2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Model Confidence</span>
                  <span className="font-semibold text-purple-600">87.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentRole === 'admin') {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administration</h1>
            <p className="text-gray-600">Monitor blockchain network, smart contracts, and system compliance.</p>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">99.8%</p>
                  <p className="text-sm text-gray-600">Network Uptime</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">178</p>
                  <p className="text-sm text-gray-600">Active Nodes</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <Lock className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-gray-600">Smart Contracts</p>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-8 h-8 text-cyan-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Blockchain Transactions */}
          <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Blockchain Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Transaction ID</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 font-mono text-xs">0x4a7b...9c2d</td>
                    <td className="py-3">Data Access Grant</td>
                    <td className="py-3">Dr. Sarah Johnson</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Confirmed</span></td>
                    <td className="py-3">2025-01-01 14:23</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">0x8f3e...4b1a</td>
                    <td className="py-3">Consent Revocation</td>
                    <td className="py-3">Alex Patient</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Confirmed</span></td>
                    <td className="py-3">2025-01-01 13:45</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">0x2d9c...7e8f</td>
                    <td className="py-3">AI Model Update</td>
                    <td className="py-3">Research Node #45</td>
                    <td className="py-3"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">Pending</span></td>
                    <td className="py-3">2025-01-01 13:12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">HIPAA Compliance</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">GDPR Compliance</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">FDA Guidelines</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Compliant
                  </span>
                </div>
              </div>
            </div>
            <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Security Alerts</h2>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">All systems operating normally</p>
                  <p className="text-xs text-green-600">Last security scan: 2 hours ago</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">Scheduled maintenance tonight at 2 AM</p>
                  <p className="text-xs text-blue-600">Expected downtime: 30 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderConsentSection = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Consent Management</h1>
        <p className="text-gray-600">Control who has access to your medical data and for how long.</p>
      </div>

      {/* Active Consents */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Data Sharing Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockConsentRecords.filter(record => record.status === 'active').map((record) => (
            <ConsentRecordCard key={record.id} record={record} />
          ))}
        </div>
      </div>

      {/* Grant New Access */}
      <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Grant New Data Access</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor/Institution</label>
            <input
              type="text"
              placeholder="Enter doctor name or institution"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Types</label>
            <div className="grid grid-cols-2 gap-2">
              {['Vital Signs', 'Lab Results', 'Prescriptions', 'Imaging', 'Allergies', 'Family History'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Duration</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
              <option>6 months</option>
              <option>1 year</option>
            </select>
          </div>
          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            Grant Access
          </button>
        </div>
      </div>

      {/* Expired/Revoked Access */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Access History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockConsentRecords.filter(record => record.status !== 'active').map((record) => (
            <ConsentRecordCard key={record.id} record={record} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${currentTheme.background}`}>
      {/* Top Navigation */}
      <nav className={`bg-gradient-to-r ${currentTheme.primary} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:text-gray-200 lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">MedChain AI</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Role Switcher */}
              <select
                value={currentRole}
                onChange={(e) => {
                  setCurrentRole(e.target.value as UserRole);
                  setActiveSection('dashboard');
                }}
                className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-1 text-sm"
              >
                <option value="patient" className="text-gray-900">Patient</option>
                <option value="doctor" className="text-gray-900">Doctor</option>
                <option value="researcher" className="text-gray-900">Researcher</option>
                <option value="admin" className="text-gray-900">Admin</option>
              </select>

              <button className="text-white hover:text-gray-200">
                <Bell className="w-6 h-6" />
              </button>
              <button className="text-white hover:text-gray-200">
                <Settings className="w-6 h-6" />
              </button>
              <button className="text-white hover:text-gray-200">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full pt-20 lg:pt-0">
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="px-4 space-y-2">
                {navItems[currentRole].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? `${currentTheme.accent} text-white`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'consent' && currentRole === 'patient' && renderConsentSection()}
            {activeSection === 'insights' && currentRole === 'patient' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Health Insights</h1>
                  <p className="text-gray-600">Personalized recommendations and predictions based on your health data.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockAIInsights.map((insight) => (
                    <AIInsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}
            {activeSection === 'records' && currentRole === 'patient' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h1>
                  <p className="text-gray-600">Access your complete medical history and documentation.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
                    <FileText className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Lab Results</h3>
                    <p className="text-sm text-gray-600 mb-4">Latest blood work and diagnostic tests</p>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">View</button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
                    <Activity className="w-8 h-8 text-green-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Vital Signs</h3>
                    <p className="text-sm text-gray-600 mb-4">Heart rate, blood pressure, and more</p>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">View</button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`${currentTheme.card} p-6 rounded-xl shadow-sm`}>
                    <Calendar className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">Prescriptions</h3>
                    <p className="text-sm text-gray-600 mb-4">Current and past medications</p>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">View</button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      

export default App;
