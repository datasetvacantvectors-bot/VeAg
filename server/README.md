# VeAg Server - Backend API

The backend server for VeAg (Vacant Vectors Agriculture), providing RESTful APIs for crop disease detection, user management, case processing, dynamic AI Chat generation, and secure payment integration.

## 🌟 Overview

VeAg Server is a Node.js/Express backend that powers the VeAg platform with:
- Secure User authentication and profile management (Firebase Admin integration)
- Case registration, processing, and comprehensive case result management
- Deep AI Integration (Gradio for ML models + Gemini APIs for conversational chatbots and treatments)
- Agricultural Marketplace product tracking, edits, and search analytics
- Subscription and payment handling (Razorpay)
- Cloud image buffering and storage (Cloudinary & Local Temp Storage)
- 12 comprehensive MongoDB databases for granular system monitoring
- Advanced Route Protection via strict Origin checks and Firebase App Check

## 🏗️ Tech Stack

### Core Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Key Services
- **Gemini API Service** - Dynamic treatment generation and chatbot logic
- **Cloudinary** - Image storage and management
- **Gradio Client** - ML model integration (via secure `HF_TOKEN`)
- **Razorpay** - Payment gateway
- **Firebase Admin SDK** - Authentication verification and secure session handling

### Utilities & Security
- **Strict Origin Checker** - Blocking programmatic Non-Browser requests in production
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **express-validator** - Request validation
- **multer** - File upload handling
- **form-data** - Multipart form data

## 📁 Project Structure

```
server/
├── config/
│   ├── adminMiddleware.js      # Admin route guard
│   ├── appCheckMiddleware.js   # ReCaptcha Bot protection
│   ├── authMiddleware.js       # JWT & Firebase Token validation
│   ├── cloudinary.js           # Cloudinary configuration
│   ├── db.js                   # MongoDB connection
│   ├── firebaseAdmin.js        # Firebase Admin SDK Configuration
│   └── subscriptionMiddleware.js# Paywall logic
├── controllers/
│   ├── adminController.js      # Marketplace edits, search analytics & case management
│   ├── askController.js        # Ask VeAg Gemini Chat logic
│   ├── caseController.js       # AI analysis triggers & Case management
│   ├── cropController.js       # Crop data operations
│   ├── productController.js    # Marketplace Product endpoints
│   ├── subscriptionController.js # Payment & subscription
│   └── userController.js       # User management
├── models/
│   ├── AskChat.js              # Ask VeAg Chatbot conversations
│   ├── Case.js                 # Case schema
│   ├── CaseResult.js           # Analysis results schema
│   ├── ClickAnalytics.js       # Product click heatmaps
│   ├── Crop.js                 # Crop information schema
│   ├── NameHistory.js          # User profile name changes
│   ├── Product.js              # Marketplace schema with editHistory
│   ├── SearchAnalytics.js      # Keyword tracking
│   ├── Subscription.js         # Subscription plans
│   ├── Transaction.js          # Payment transactions
│   ├── TreatmentInfo.js        # Cached Gemini AI treatments
│   └── User.js                 # User schema
├── routes/
│   ├── adminRoutes.js          # Admin endpoints
│   ├── askRoutes.js            # Chatbot endpoints
│   ├── caseRoutes.js           # Case endpoints
│   ├── cropRoutes.js           # Crop endpoints
│   ├── productRoutes.js        # Product endpoints
│   ├── subscriptionRoutes.js   # Subscription endpoints
│   └── userRoutes.js           # User endpoints
├── services/
│   ├── geminiService.js        # Centralized LLM Generation Service
│   └── gradioService.js        # Gradio ML integration with Temp Buffer logic
├── temp/                       # Temporary local file storage for Model uploads
├── Dockerfile                  # Node.js production image build
├── server.js                   # Application entry point
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.x or higher (local or Atlas)
- Docker & Docker Compose (optional but recommended)
- Cloudinary account
- Razorpay account (for payments)
- Gradio space deployed (for ML inference)
- Firebase Admin SDK Service Account JSON credentials
- Gemini API Key

### Installation

1. **Navigate to server directory**
   ```bash
   cd VeAg_Project/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/veag
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/veag
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Gradio Configuration
   GRADIO_SPACE_URL=sharkthak/VeAg
   HF_TOKEN=your_huggingface_token
   
   # Gemini API
   GEMINI_API_KEY=your_gemini_key
   GEMINI_MODEL=gemini-2.0-flash
   
   # Firebase Admin Configuration
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   
   # Security
   ADMIN_ID=your_admin_id
   ADMIN_PASSWORD=your_admin_password
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the server**

   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```
   
   The server will be available at `http://localhost:5000`

5. **Seed the database with default crops**
   
   After starting the server, seed initial crops using one of these methods:
   
   **Option 1: Using the provided script**
   ```bash
   # Linux/Mac
   chmod +x seed-crops.sh
   ./seed-crops.sh
   
   # Windows
   seed-crops.bat
   ```
   
   **Option 2: Using curl**
   ```bash
   curl -X POST http://localhost:5000/api/crops/seed
   ```
   
   **Option 3: Using Postman or similar tool**
   - Method: POST
   - URL: `http://localhost:5000/api/crops/seed`
   
   This adds default crops: Rice, Wheat, Maize

### Verify Installation

Check if the server is running. (Note: The Health endpoint is intentionally exposed globally without strict origin checks so uptime bots can monitor it).
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "VeAg Server is running",
  "timestamp": "2024-12-15T10:30:00.000Z"
}
```

## 📡 API Endpoints

### User Management

#### Authenticate/Create User
```http
POST /api/users/auth
Content-Type: application/json

{
  "firebaseUid": "string",
  "email": "user@example.com",
  "name": "John Doe",
  "photoURL": "https://..."
}
```

#### Get User Profile
```http
GET /api/users/:userId
```

#### Update User Profile
```http
PUT /api/users/:userId
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

#### Get Name History
```http
GET /api/users/:userId/name-history
```

#### Verify Token
```http
GET /api/users/verify
```

#### Get User by Email
```http
GET /api/users/email/:email
```

### Case Management

#### Create New Case
```http
POST /api/cases
Content-Type: application/json

{
  "userId": "string",
  "cropName": "Rice",
  "diseaseObservation": "Brown spots on leaves",
  "images": ["data:image/jpeg;base64,...", "..."]
}
```

#### Get User Cases
```http
GET /api/cases/user/:userId
```

#### Get Case Details
```http
GET /api/cases/:caseId
```

#### Process Case with AI
```http
POST /api/cases/:caseId/process
```

#### Get Case Result
```http
GET /api/cases/:caseId/result
```

#### Delete Case
```http
DELETE /api/cases/:caseId
```

### AI Services

#### Chat with Ask VeAg
```http
POST /api/ask/:caseId/messages
Content-Type: application/json

{
  "message": "How do I fix this disease?"
}
```

#### Generate/Fetch Granular Treatment Info
```http
GET /api/cases/:caseId/treatment-info
POST /api/cases/:caseId/treatment-info/:type
```
*(where type is 'treatment', 'causes', or 'prevention')*

### Product & Admin Services

#### Search Marketplace
```http
GET /api/products/search
```

#### Track Analytics
```http
POST /api/products/track-search
POST /api/products/track-click
```

#### Authenticate Admin
```http
POST /api/admin/login
Content-Type: application/json

{
  "adminId": "string",
  "password": "password"
}
```

#### Admin Product Endpoints
```http
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:productId
DELETE /api/admin/products/:productId
```

#### Admin Analytics Endpoints
```http
GET /api/admin/analytics/searches
GET /api/admin/analytics/clicks
```

#### Verify Admin Session
```http
GET /api/admin/verify
```

### Subscription Management

#### Get Subscription Status
```http
GET /api/subscriptions/:userId/active
```

#### Create Payment Order
```http
POST /api/subscriptions/create-order
Content-Type: application/json

{
  "userId": "string",
  "planType": "premium"
}
```

#### Verify Payment
```http
POST /api/subscriptions/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string",
  "userId": "string",
  "planType": "premium"
}
```

#### Payment Failure Event
```http
POST /api/subscriptions/payment-failure
```

#### Get Transaction & Subscription History
```http
GET /api/subscriptions/:userId/history
GET /api/subscriptions/:userId/transactions
```

### Crop Information

#### Get All Crops
```http
GET /api/crops
```

#### Add New Crop
```http
POST /api/crops
Content-Type: application/json

{
  "name": "Wheat",
  "scientificName": "Triticum aestivum",
  "commonDiseases": ["Rust", "Blight"]
}
```

#### Seed Default Crops (Development)
```http
POST /api/crops/seed
```

Seeds the database with default crops (Rice, Wheat, Maize). Only works if no crops exist.

## 🗄️ Database Models

The backend now relies on 12 highly specialized schemas to run the expanded feature set. Here are the core models:

### User Model
```javascript
{
  userId: String (unique),
  email: String (unique),
  name: String,
  photoURL: String,
  firebaseUid: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Case Model
```javascript
{
  caseId: String (unique),
  userId: String,
  cropName: String,
  diseaseObservation: String,
  images: [{
    url: String,
    publicId: String
  }],
  status: String (pending|processing|completed|failed),
  createdAt: Date,
  updatedAt: Date
}
```

### CaseResult Model
```javascript
{
  caseId: String (unique),
  diseaseDetected: String,
  confidence: Number,
  recommendations: String,
  causes: [String],
  treatment: [String],
  prevention: [String],
  processedAt: Date
}
```

### Subscription Model
```javascript
{
  userId: String (unique),
  planType: String (free|premium),
  startDate: Date,
  endDate: Date,
  casesUsed: Number,
  casesLimit: Number,
  isActive: Boolean
}
```

### Transaction Model
```javascript
{
  userId: String,
  orderId: String,
  paymentId: String,
  amount: Number,
  currency: String,
  status: String (created|success|failed),
  planType: String,
  createdAt: Date
}
```

### Crop Model
```javascript
{
  name: String (unique),
  scientificName: String,
  description: String,
  commonDiseases: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Additional specialized schemas (v5.5.5):**
- `AskChat`: Chatbot logs
- `ClickAnalytics`: Heatmap of marketplace interactions
- `NameHistory`: Complete log of User profile username changes
- `Product`: Marketplace items (featuring an `editHistory` schema tracking who changed the product and when)
- `SearchAnalytics`: Tracking keywords typed into the marketplace
- `TreatmentInfo`: Saved Gemini LLM generation data

## 🤖 AI Model Integration

### Gradio Service & Temp Buffers

The server integrates with a Gradio-hosted ML model for disease detection:

**Process Flow:**
1. Client uploads images (base64)
2. Server uploads to Cloudinary
3. Server downloads images to local `temp/` directory
4. Gradio client securely processes images via `HF_TOKEN`
5. Results saved to database
6. Temp files scrubbed to avoid disk bloat

**Configuration:**
- Default Space: `sharkthak/VeAg`
- Custom spaces supported via `GRADIO_SPACE_URL`
- Automatic connection management
- Error handling and retry logic

**Supported Models:**
- Best Overall (automatic selection)
- ConvNeXt-Base
- EfficientNetV2-M
- DeiT-Small
- Ensemble (with custom weights)

### Gemini Flow (Treatments & Chatbot)
1. Server receives Gradio Result.
2. Server requests `geminiService.generateTreatment(diseaseName, cropName)`.
3. Gemini yields comprehensive Markdown string.
4. Markdown saved into `TreatmentInfo` collection and relayed to client.

## 💳 Payment Integration

### Razorpay Setup

1. **Create Razorpay Account**
   - Sign up at https://razorpay.com
   - Get API keys from Dashboard

2. **Configure Plans**
   ```javascript
   const plans = {
     free: {
       casesLimit: 5,
       price: 0
     },
     premium: {
       casesLimit: -1, // unlimited
       price: 999, // INR
       duration: 30 // days
     }
   };
   ```

3. **Payment Flow**
   - Create order → Get order_id
   - Client completes payment
   - Verify signature on server
   - Activate subscription

## ☁️ Cloudinary Configuration

### Setup

1. **Create Cloudinary Account**
   - Sign up at https://cloudinary.com
   - Get cloud name and API credentials

2. **Folder Structure**
   ```
   veag_cases/
   ├── <caseId>/
   │   ├── image_0
   │   ├── image_1
   │   └── ...
   ```

3. **Upload Configuration**
   - Format: JPEG/PNG
   - Max size: 50MB per request payload (handled via express.json payload limit)
   - Automatic optimization
   - Secure URLs

## 🔒 Security

### Environment Variables
- Never commit `.env` to version control
- Use different keys for development/production
- Rotate API keys regularly

### Data Validation
- Input validation with express-validator
- Mongoose schema validation
- File type and size checks

### Advanced Route Protection Middlewares (v5.5.5)
1. **`appCheckMiddleware.js`**: Enforces Firebase App Check verification using ReCaptcha Enterprise headers.
2. **`authMiddleware.js`**: Verifies incoming `Authorization` headers using Firebase Admin.
3. **`adminMiddleware.js`**: Highly secure barrier checking explicit Admin session tokens.
4. **`strict-origin-checker.js`**: Enforces that requests arrive from actual browsers by verifying the `Origin` and `Referer` headers. Postman and Curl are rejected in production.
5. **`subscriptionMiddleware.js`**: Validates the user's Razorpay subscription status before allowing cases to process.

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting (Recommended)
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB is running
   mongod --version
   
   # Or use MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://...
   ```

2. **Cloudinary Upload Errors**
   - Verify API credentials
   - Check image size (max 10MB)
   - Ensure base64 format is correct

3. **Gradio Connection Issues**
   - Verify Gradio space is running
   - Check `GRADIO_SPACE_URL` in `.env`
   - Ensure space is public or accessible

4. **Payment Verification Failed**
   - Verify Razorpay credentials
   - Check signature verification logic
   - Ensure webhook secret is correct

5. **CORS Errors**
   - Add client URL to CORS configuration
   - Verify `CLIENT_URL` in `.env`
   - Check browser console for specific errors

## 📦 Dependencies

### Production Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "@gradio/client": "^2.0.0",
  "cloudinary": "^2.5.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "express-validator": "^7.0.1",
  "firebase-admin": "^13.1.0",
  "form-data": "^4.0.5",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^8.9.5",
  "multer": "^1.4.5-lts.1",
  "node-fetch": "^2.7.0",
  "razorpay": "^2.9.5"
}
```

## 🚀 Deployment

### Railway / Render / Heroku

1. **Prepare for deployment**
   ```bash
   # Ensure package.json has start script
   "scripts": {
     "start": "node server.js"
   }
   ```

2. **Set environment variables**
   - Add all `.env` variables in platform settings
   - Use production MongoDB URI
   - Update `CLIENT_URL` to production URL

3. **Deploy**
   ```bash
   git push railway main
   # or
   git push heroku main
   ```

### Docker Deployment (Recommended)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t veag-server .
docker run -p 5000:5000 --env-file .env veag-server
```

### MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

## 📊 Monitoring

### Logging
```javascript
// Development
console.log('Request received:', req.body);

// Production - use logging service
import winston from 'winston';
```

### Health Checks
- Endpoint: `/api/health`
- Monitor uptime
- Check database connectivity

## 🔄 Version History

- **v5.5.5** - Current version
  - Massive overhaul introducing Gemini LLM Service, Ask VeAg endpoints, Product/Admin endpoints, App Check ReCaptcha protection, and robust 12-Collection Database mapping.
- **v3.3.3** - Previous version
  - Gradio integration
  - Subscription system
  - Enhanced error handling
  - Performance optimizations

## 📄 License

This project is part of the VeAg platform. All rights reserved.

## 🤝 Contributing

This is a final year project. For contributions or suggestions, please contact the project maintainers.

## 📞 Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review client documentation (`../client/README.md`)
3. Check model documentation (`../model/README.md`)

---

**VeAg Server** - Powering AI-driven agriculture solutions.
