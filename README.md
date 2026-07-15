# VeAg - AI-Powered Crop Disease Detection Platform

<div align="center">

![VeAg Logo](client/src/assets/veag_logo.svg)

**Empowering Agriculture with Artificial Intelligence**

[![Version](https://img.shields.io/badge/version-5.5.5-blue.svg)](https://github.com/ok-sarthak/VeAg_Project)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)

</div>

---

## About VeAg

**VeAg** (Vacant Vectors Agriculture) is a comprehensive AI-powered platform designed to help farmers and agronomists detect and manage crop diseases efficiently. Using state-of-the-art deep learning models and advanced LLMs, VeAg provides:

- 🔍 **Accurate Disease Detection** - AI-powered analysis using ensemble of ConvNeXt, EfficientNetV2, and DeiT models via Gradio
- 📸 **Image-Based Diagnosis** - Upload crop images for instant analysis (backed by Cloudinary)
- 💡 **Fully Integrated Treatment, Causes & Prevention** - Deeply integrated insights powered by Gemini AI API directly in the main app
- 🤖 **Ask VeAg Chatbot** - A specialized AI agricultural assistant featuring Markdown rendering, offline detection, and history tracking
- 🛒 **Agricultural Marketplace** - Discover tools, fertilizers, and seeds with built-in search and click analytics tracking
- 📊 **Advanced Admin Panel** - Complete dashboard to manage cases, edit marketplace products, and track product editing history
- 📝 **Downloadable Reports** - Export detailed AI diagnostic case reports
- 💳 **Subscription Plans** - Flexible pricing for different user needs with robust Razorpay integration
- 🌐 **Web & Mobile Ready** - Responsive design with Mobile Bottom Navbar and a dedicated App Download Landing Page

## 🎯 Project Overview

VeAg is a **final year project** by **Sarthak Chakraborty** , demonstrating the practical application of:
- Deep Learning in Agriculture
- Full-Stack Web Development
- Cloud Computing, DevOps (Docker, Nginx)
- Advanced Security (Strict CORS, Firebase App Check, ReCaptcha)
- Payment Gateway Integration
- Real-time AI Model Deployment (Hugging Face Spaces + Gemini API)

### Current Implementation
- **Example Crop**: Rice Leaf Disease Detection
- **Diseases Detected**: Bacterial leaf blight, Brown spot, Leaf smut
- **Extensible**: Can be adapted for wheat, corn, tomato, potato, and other crops

## 🏗️ Architecture

VeAg follows a modern, secure, dockerized microservices architecture:

```
┌───────────────────────────────────────────────────────────────┐
│                        VeAg Platform                          │
└───────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│                  │     │                   │     │                  │
│  CLIENT (React)  │────▶│  SERVER (Node)    │────▶│  MODEL (Python)  │
│                  │     │                   │     │                  │
│  • React 18      │     │  • Express.js     │     │  • Gradio        │
│  • Vite (Proxy)  │     │  • MongoDB (12x)  │     │  • PyTorch       │
│  • Tailwind CSS  │     │  • Cloudinary     │     │  • TIMM          │
│  • Firebase Auth │     │  • Razorpay       │     │  • ConvNeXt      │
│  • Nginx Proxy   │     │  • Gradio Client  │     │  • EfficientNet  │
│  • App Check     │     │  • Gemini Service │     │  • DeiT          │
└──────────────────┘     └───────────────────┘     └──────────────────┘
         │                         │                         │
         │                         │                         │
         ▼                         ▼                         ▼
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Firebase        │     │  MongoDB Atlas    │     │  Hugging Face    │
│  Authentication  │     │  Database         │     │  Spaces          │
└──────────────────┘     └───────────────────┘     └──────────────────┘
```

## 📁 Project Structure

```
VeAg_Project/
├── app-download-page/           # Standalone Landing Page for Mobile App
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components (AskVeAg, Navbars)
│   │   ├── contexts/           # Auth and Language (i18n) contexts
│   │   ├── pages/              # App pages (Dashboard, AdminPanel, ProductSearch)
│   │   ├── config/             # Firebase configuration & App Check
│   │   └── utils/              # Translations and utility functions
│   ├── Dockerfile              # Docker container definition
│   └── nginx.conf              # Nginx reverse proxy configuration
│
├── server/                      # Node.js backend server
│   ├── config/                 # Admin, Auth, and Security Middlewares
│   ├── controllers/            # Request handlers (Admin, Ask, Case, Product)
│   ├── models/                 # 12 MongoDB schemas (Product, NameHistory, AskChat, etc.)
│   ├── routes/                 # API routes
│   ├── services/               # Gemini API and Gradio inference logic
│   └── Dockerfile              # Node.js container definition
│
├── model/                       # AI/ML components
│   ├── backend/                # Model training pipeline
│   ├── client/                 # Gradio inference application
│   └── README.md               # Model documentation
│
├── docker-compose.yml           # Multi-container orchestration
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **Python** 3.8 or higher
- **MongoDB** 6.x or higher
- **Docker** and **Docker Compose**
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ok-sarthak/VeAg_Project.git
   cd VeAg_Project
   ```

2. **Set up the Model (Optional - if training new models)**
   ```bash
   cd model/backend
   # Follow instructions in model/backend/README.md
   # Train models and copy .pth files to model/client/models/checkpoints/
   ```

3. **Set up the Model Client (Gradio)**
   ```bash
   cd model/client
   pip install -r requirements.txt
   # Configure classes.json for your crops
   python app.py
   # Or deploy to Hugging Face Spaces
   ```

4. **Set up the Backend Server (Without Docker)**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your credentials (see Environment Configuration)
   
   npm run dev
   ```

5. **Set up the Frontend Client (Without Docker)**
   ```bash
   cd client
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your Firebase and API credentials
   
   npm run dev
   ```

6. **Run with Docker Compose (Recommended for Production)**
   ```bash
   # Create .env files in both client/ and server/
   # Run the docker compose build
   docker-compose up --build -d
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173 (or http://localhost:80 via Docker)
   - Backend API: http://localhost:5000
   - Model Interface: http://localhost:7860

## 🔑 Environment Configuration

### Client (.env)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key # For Firebase App Check
VITE_API_URL=http://localhost:5000 # Leave empty if using Docker Nginx proxy
VITE_API_BASE_URL=http://localhost:5000/api
```

### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/veag
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GRADIO_SPACE_URL=sharkthak/VeAg
HF_TOKEN=your_hugging_face_token
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
ADMIN_ID=admin_username
ADMIN_PASSWORD=admin_password
JWT_SECRET=your_jwt_secret
```

### Model Client (.env)
```env
PORT=7860
```

## 💡 Features

### For Farmers & Agronomists

- **Easy Image Upload**: Take photos of affected crops and upload instantly
- **Quick Diagnosis**: Get AI-powered disease detection in seconds
- **Fully Integrated Treatment**: Detailed causes, treatments, and prevention guides dynamically generated using Gemini AI.
- **Ask VeAg Chatbot**: An intelligent, offline-aware AI agricultural assistant capable of rendering markdown, analyzing your crop, and answering specific disease-related questions.
- **Agricultural Marketplace**: Search and discover agricultural tools, fertilizers, and seeds right from the app.
- **Downloadable Reports**: Save your AI analysis as downloadable files for offline reference.
- **Case History**: Track all your submitted cases in one place
- **Multi-Language Support**: Fully integrated English and Hindi (हिंदी) UI dictionaries - Making agriculture accessible across India.

### For Researchers & Students

- **Training Pipeline**: Complete notebook for training custom models
- **Model Comparison**: Evaluate different architectures (ConvNeXt, EfficientNetV2, DeiT)
- **Ensemble Methods**: Combine models for improved accuracy
- **Extensible Design**: Adapt for different crops and diseases
- **Open Architecture**: Learn from complete implementation

### Technical Features

- **Authentication**: Secure Google Sign-In via Firebase
- **Bot Protection**: Firebase App Check initialized with ReCaptcha Enterprise.
- **Image Storage & Temporary Buffering**: Cloud-based storage with Cloudinary. The backend temporarily buffers images locally before routing to the Gradio Space for inference.
- **AI Processing**: Gradio-powered ML inference + Gemini LLM dynamic generation.
- **Admin Panel**: Dedicated dashboard for monitoring cases and managing marketplace products, tracking edit history.
- **Strict Route Protection**: Comprehensive middlewares checking headers (`Origin`, `Referer`) to block non-browser programmatic access.
- **Payment Gateway**: Razorpay integration for subscriptions
- **Responsive Design**: Works on desktop, tablet, and mobile (featuring a custom mobile Bottom Navbar).
- **Real-time Updates**: Track case processing status
- **RESTful API**: Clean, documented API endpoints
- **Database**: 12 MongoDB collections for hyper-granular scalable data tracking (including SearchAnalytics, ClickAnalytics, NameHistory).
- **Progressive Web App (PWA)**: Install and use offline capabilities

### Multilingual Support 🌍

VeAg supports major Indian languages to make agricultural technology accessible to farmers across India:

- **🇬🇧 English** - Primary language for international users and technical documentation
- **🇮🇳 Hindi (हिंदी)** - India's most widely spoken language, serving millions of farmers

**Language Features:**
- ✅ Full UI translation for all pages and components
- ✅ Disease names and descriptions in local languages
- ✅ Treatment recommendations in user's preferred language
- ✅ Easy language switching from settings
- ✅ Automatic language detection based on browser settings


## 📊 Disease Detection Models

### Supported Architectures

1. **ConvNeXt-Base** (88M parameters)
   - Modern CNN architecture
   - Excellent overall accuracy
   - Balanced performance

2. **EfficientNetV2-M** (54M parameters)
   - Optimized for efficiency
   - Fast inference time
   - Production-ready

3. **DeiT-Small** (22M parameters)
   - Vision Transformer
   - Attention mechanisms
   - Captures global features

4. **Ensemble Model**
   - Combines all three architectures
   - Customizable weights
   - Best overall performance

### Detection Capabilities

**Current Implementation (Rice):**
- Bacterial leaf blight
- Brown spot
- Leaf smut
- Healthy leaf detection

**Extensible to Other Crops:**
- Wheat: Rust, blight, powdery mildew
- Tomato: Early blight, late blight, leaf mold
- Potato: Early blight, late blight, black scurf
- Corn: Northern corn leaf blight, gray leaf spot

## 💳 Subscription Plans

| Feature | Free Plan | Premium Plan |
|---------|-----------|--------------|
| Cases per month | ❌  | Unlimited |
| AI Analysis | ❌  | ✅ |
| Treatment Advice | ❌  | ✅ |
| Ask VeAg Chatbot | ❌ | ✅ |
| Priority Support | ❌ | ✅ |
| Advanced Analytics | ❌ | ✅ |
| Export Reports | ❌ | ✅ |
| **Price** | ₹0 | ₹9/month |

**Note**: Currently, there is no free plan. All users require a premium subscription.

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI library
- **Vite 5.1** - Build tool (with proxy for Nginx)
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Firebase** - Authentication & App Check

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Cloudinary** - Image storage
- **Razorpay** - Payments
- **Firebase Admin SDK** - Token verification

### AI/ML
- **Python 3.8+** - Programming language
- **PyTorch** - Deep learning framework
- **TIMM** - Model architectures
- **Gradio** - Web interface
- **Gemini API** - Conversational LLM

## 📖 Documentation

Detailed documentation for each component:

- **[Client Documentation](client/README.md)** - Frontend setup and features
- **[Server Documentation](server/README.md)** - Backend API and deployment
- **[Model Documentation](model/README.md)** - AI/ML training and inference
- **[Model Backend](model/backend/README.md)** - Training pipeline
- **[Model Client](model/client/README.md)** - Gradio deployment
- **[App Download Page Documentation](app-download-page/README.md)** - App landing page overview

## 🚀 Deployment

### Docker (Recommended)
```bash
# Deploys both frontend (Nginx) and backend services seamlessly on a unified network
docker-compose up --build -d
```

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd server
# Push to platform
# Set environment variables
```

### Model (Hugging Face Spaces)
```bash
cd model/client
# Create new Space
# Upload files
# Set secrets
```

## 🧪 Testing

### Client
```bash
cd client
npm test
```

### Server
```bash
cd server
npm test
```

### Model
```bash
cd model/client
python -m pytest tests/
```

## 📈 Performance

- **Detection Accuracy**: 95%+ (ensemble model)
- **Response Time**: < 15 seconds for analysis
- **Uptime**: 99.9% availability target
- **Concurrent Users**: Supports 1000+ simultaneous users

## 🔒 Security

- **Authentication**: Firebase Auth with JWT tokens & Firebase Admin SDK.
- **Bot Protection**: Firebase App Check powered by ReCaptcha Enterprise.
- **Data Protection**: Strict Origin and Referer checkers blocking programmatic non-browser access in production.
- **Payment Security**: PCI-compliant Razorpay integration.
- **Input Validation**: Server-side validation for all inputs.
- **Rate Limiting**: API rate limits to prevent abuse.
- **CORS**: Configured rigidly for enhanced security.

## 🤝 Contributing

This is a final year academic project of Sarthak Chakraborty. I welcome feedback and suggestions!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

### MIT License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

#### Why MIT License?

We chose the MIT License for VeAg because:

1. **🌍 Maximum Accessibility**
   - Anyone can use, modify, and distribute VeAg
   - Perfect for educational institutions and research
   - Enables farmers and NGOs to deploy without legal concerns

2. **🚀 Encourages Innovation**
   - Developers can build upon VeAg for commercial use
   - Startups can integrate our disease detection models
   - Academic researchers can extend and improve the system

3. **📚 Educational Purpose**
   - Students can learn from production-ready code
   - Great for portfolio and resume projects
   - Demonstrates best practices in full-stack development

4. **🤝 Community Collaboration**
   - Simple and permissive - easy to understand
   - No complex restrictions or copyleft requirements
   - Encourages contributions and forks

5. **💼 Business-Friendly**
   - Can be used in proprietary software
   - No obligation to open-source derivatives
   - Suitable for commercial agricultural technology companies

**What the MIT License Allows:**
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**Requirements:**
- 📋 Include original copyright notice
- 📋 Include copy of MIT License text

**Limitations:**
- ❌ No warranty provided
- ❌ No liability for damages

**Our Vision:** We believe agricultural technology should be accessible to everyone. By using MIT License, we ensure VeAg can benefit the maximum number of farmers worldwide, whether through direct use, derivative works, or commercial applications.

## 🙏 Acknowledgments

- **PyTorch Team** - Deep learning framework
- **TIMM Library** - Pre-trained models
- **Gradio** - ML interface framework
- **Gemini** - LLM Generative AI
- **Firebase** - Authentication services
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **MongoDB** - Database
- Open-source crop disease datasets

## 📞 Contact & Support

- **GitHub**: [@ok-sarthak](https://github.com/ok-sarthak)
- **Project Repository**: [VeAg_Project](https://github.com/ok-sarthak/VeAg_Project)
- **Issues**: [Report a Bug](https://github.com/ok-sarthak/VeAg_Project/issues)

## 🗺️ Roadmap

### Current Version (v5.5.5)
- ✅ Rice disease detection
- ✅ User authentication & Route Protection
- ✅ Case management & Admin Panels
- ✅ Marketplace / Product Search Analytics
- ✅ Ask VeAg AI Chatbot & Treatment Generation
- ✅ Subscription system with Payment integration

### Upcoming Features (v6.0.0 and later)
- 🔄 Multi-crop support (10+ crops)
- 🔄 Mobile app (React Native - iOS & Android)
- 🔄 Community forum for farmers
- 🔄 Expert consultation system (connect with agronomists)
- 🔄 SMS/WhatsApp notifications for case updates
- 🔄 Voice input for disease descriptions
- 🔄 Weather integration for prevention advice
- 🔄 Crop calendar and farming tips
- 🔄 More languages (Tamil, Telugu, Marathi, Punjabi, etc.)
- 🔄 Blockchain-based disease tracking
- 🔄 Farmer-to-farmer marketplace

## ⚠️ Disclaimer

VeAg provides automated crop disease predictions and treatment suggestions for **educational and informational purposes only**. It is **not a substitute for professional agricultural advice**. Always consult with agricultural experts and local extension services for critical farming decisions.

## 📊 Project Statistics

- **Lines of Code**: 45,000+
- **Components**: 35+ React components
- **API Endpoints**: 30+ REST endpoints
- **ML Models**: 3 architectures + ensemble
- **Database Collections**: 12 MongoDB collections
- **Deployment Ready**: ✅ Production-grade Docker Compose Support

---

<div align="center">

**Built by Sarthak Chakraborty**

*Empowering farmers with AI-driven crop disease detection*

[⬆ Back to Top](#veag---ai-powered-crop-disease-detection-platform)

</div>
