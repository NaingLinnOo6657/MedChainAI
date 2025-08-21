# MedChain AI Backend

A comprehensive backend API for the MedChain AI healthcare platform, featuring blockchain-based consent management, federated AI learning, and secure health data management.

## Features

- **Multi-Role Authentication**: Support for patients, doctors, researchers, and administrators
- **Blockchain Integration**: Immutable consent management and audit trails
- **Federated AI**: Privacy-preserving machine learning across healthcare institutions
- **Health Data Management**: Secure storage and sharing of medical records
- **Compliance**: HIPAA, GDPR, and FDA compliant architecture
- **Real-time Insights**: AI-powered health predictions and anomaly detection

## Architecture

### Core Services

- **Authentication Service**: JWT-based authentication with role-based access control
- **Blockchain Service**: Smart contract integration for consent management
- **AI Service**: Federated learning and health insight generation
- **Encryption Service**: End-to-end encryption for sensitive data

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /me` - Get current user profile
- `POST /logout` - User logout

#### Patient Portal (`/api/patient`)
- `GET /dashboard` - Patient dashboard data
- `GET /health-data` - Health metrics and records
- `POST /health-data` - Add new health data
- `GET /medical-records` - Medical history
- `GET /consents` - Data sharing permissions
- `POST /consents/grant` - Grant data access
- `POST /consents/revoke` - Revoke data access
- `GET /insights` - AI health insights

#### Doctor Portal (`/api/doctor`)
- `GET /dashboard` - Doctor dashboard with patient overview
- `GET /patients` - Patient list with consent status
- `GET /patients/:id` - Detailed patient information
- `POST /data-request` - Request patient data access
- `GET /ai-insights` - AI insights for patients
- `GET /analytics` - Population health analytics

#### Researcher Portal (`/api/researcher`)
- `GET /dashboard` - Research metrics and model status
- `GET /datasets` - Available anonymized datasets
- `GET /models` - Federated learning models
- `POST /models/:id/train` - Initiate model training
- `POST /query` - Execute research queries
- `GET /publications` - Research publications

#### Admin Portal (`/api/admin`)
- `GET /dashboard` - System overview and health
- `GET /nodes` - Blockchain network nodes
- `GET /transactions` - Blockchain transactions
- `GET /smart-contracts` - Smart contract status
- `GET /compliance` - Compliance reports
- `GET /users` - System user management

#### Blockchain (`/api/blockchain`)
- `GET /transactions` - Transaction history
- `GET /network-stats` - Network statistics
- `GET /verify-consent` - Verify data access consent
- `POST /record-access` - Record data access event

#### AI Services (`/api/ai`)
- `GET /models` - Available AI models
- `GET /insights/:patientId` - Patient-specific insights
- `POST /predict-risk` - Disease risk prediction
- `GET /population-trends` - Population health trends
- `POST /federated-training/:modelId` - Initiate federated training

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions by user role
- **Data Encryption**: AES-256 encryption for sensitive data
- **Rate Limiting**: API rate limiting to prevent abuse
- **Audit Logging**: Comprehensive logging of all system activities
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection

## Installation

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and Start**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/medchain_ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Blockchain Configuration
BLOCKCHAIN_NETWORK_URL=http://localhost:8545
BLOCKCHAIN_PRIVATE_KEY=your-blockchain-private-key

# AI/ML Configuration
FEDERATED_LEARNING_ENDPOINT=http://localhost:8080
AI_MODEL_STORAGE_PATH=./models

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Test Users

The system includes default test users for development:

- **Patient**: `patient@medchain.ai` / `password`
- **Doctor**: `doctor@medchain.ai` / `password`
- **Researcher**: `researcher@medchain.ai` / `password`
- **Admin**: `admin@medchain.ai` / `password`

## Development

### Project Structure

```
server/
├── src/
│   ├── middleware/     # Authentication, error handling
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── server.ts       # Main server file
├── logs/               # Application logs
└── package.json
```

### Adding New Features

1. Define types in `src/types/`
2. Create service logic in `src/services/`
3. Add route handlers in `src/routes/`
4. Update middleware if needed
5. Add validation schemas

## Compliance & Security

- **HIPAA Compliant**: Secure handling of protected health information
- **GDPR Compliant**: Privacy by design and data protection
- **FDA Guidelines**: Medical device software compliance
- **SOC 2 Type II**: Security and availability controls
- **End-to-End Encryption**: All sensitive data encrypted in transit and at rest

## Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Health Checks**: `/health` and `/health/detailed` endpoints
- **Performance Metrics**: Request timing and system resource monitoring
- **Error Tracking**: Comprehensive error logging and alerting

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.