# VeAg Client - Frontend Application

The client-side application for VeAg (Vacant Vectors Agriculture), a comprehensive platform for crop disease detection and management using AI-powered analysis.

## 🌟 Overview

VeAg Client is a modern, responsive React-based web application that provides farmers and agronomists with an intuitive interface to:
- Register and manage crop disease cases
- Upload crop images for AI-powered disease detection
- View detailed analysis results and dynamically generated treatment plans
- Interact with the **Ask VeAg** AI agricultural chatbot
- Search for products via the **Agricultural Marketplace**
- Manage user profiles, name histories, and subscriptions
- Track case history and export downloadable reports
- Access the **Admin Panel** for management and analytics

## 🏗️ Tech Stack

### Core Technologies
- **React 18.3** - UI library
- **Vite 5.1** - Build tool and development server (with Nginx proxy support)
- **React Router v6** - Client-side routing
- **Firebase** - Authentication (Google Sign-In) & App Check (ReCaptcha Enterprise)
- **Tailwind CSS** - Utility-first CSS framework

### Key Libraries
- **Axios** - HTTP client for API requests
- **Framer Motion** - Animations and transitions
- **Lucide React** - Modern icon library
- **PostCSS & Autoprefixer** - CSS processing

## 📁 Project Structure

```
client/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, fonts, icons
│   ├── components/              # Reusable React components
│   │   ├── AskVeAg.jsx         # Custom AI chatbot component with Markdown rendering
│   │   ├── BottomNavbar.jsx    # Mobile responsive bottom navigation
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Layout.jsx          # Page layout wrapper
│   │   ├── PageHeader.jsx      # Page title component
│   │   ├── ProtectedRoute.jsx  # Authentication guard
│   │   ├── CookieConsent.jsx   # GDPR compliance banner
│   │   └── withSubscription.jsx # Subscription check HOC
│   ├── config/
│   │   └── firebase.js         # Firebase Auth & App Check configuration
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Authentication state
│   │   └── LanguageContext.jsx # Full i18n support (English & Hindi)
│   ├── pages/                   # Application pages
│   │   ├── Landing.jsx         # Home page
│   │   ├── Login.jsx           # Authentication page
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── RegisterCase.jsx    # Case registration form
│   │   ├── ManageCases.jsx     # Cases list view
│   │   ├── CaseDetail.jsx      # Single case view with Treatment insights
│   │   ├── ProductSearch.jsx   # Agricultural marketplace
│   │   ├── AdminLogin.jsx      # Admin authentication
│   │   ├── AdminPanel.jsx      # Admin management dashboard
│   │   ├── EditProfile.jsx     # User profile editing (with name history)
│   │   ├── ManageSubscription.jsx # Subscription management
│   │   ├── NotFound.jsx        # 404 page
│   │   ├── PrivacyPolicy.jsx   # Privacy policy
│   │   ├── TermsAndConditions.jsx
│   │   ├── ReturnRefundCancellation.jsx
│   │   └── ShippingAndDelivery.jsx
│   ├── utils/
│   │   └── translations.js     # Comprehensive en/hi translation strings
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── Dockerfile                   # Docker production image build
├── nginx.conf                   # Nginx reverse proxy routing rules
├── firebase.json                # Firebase hosting config
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase project with Google Authentication and App Check enabled
- Docker (optional but recommended for production)
- VeAg backend server running (see `../server/README.md`)

### Installation

1. **Clone the repository**
   ```bash
   cd VeAg_Project/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `client/` directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Bot Protection
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
   
   # Backend API URL (Empty if running via Docker/Nginx Proxy)
   VITE_API_URL=http://localhost:5000
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🔑 Key Features

### Authentication & Security
- **Google Sign-In** via Firebase Authentication
- **Firebase App Check** integration with ReCaptcha Enterprise for bot protection.
- Protected routes requiring authentication
- Automatic token management and user session persistence

### Case Management
- **Register New Cases**: Upload up to 10 crop images with disease observations
- **View All Cases**: List of all registered cases with status and pagination
- **Case Details**: Detailed view with analysis results, causes, and prevention
- **Downloadable Reports**: Generate diagnostic reports offline.
- **Status Tracking**: Monitor processing status (pending/processing/completed/failed)

### AI-Powered Analysis & Chat
- Integration with Gradio-based ML model via backend
- Deep Gemini API integration for automated disease treatment, causes, and prevention.
- **Ask VeAg Chatbot**: An offline-aware chat interface featuring custom Markdown rendering, message queuing, and history tracking.

### User Profile
- Edit personal information
- Track name change history
- Manage account settings
- View subscription status

### Marketplace & Admin Panel
- **Agricultural Marketplace**: Search and browse fertilizers, seeds, and equipment with built-in click and search analytics tracking.
- **Admin Panel**: Secure dashboard to edit marketplace products, track product edit histories, and monitor user searches.

### Subscription Management
- Free and Premium tiers
- Razorpay payment integration
- Case limit tracking
- Automatic subscription renewal and robust transaction history

### Responsive Design
- Mobile-first approach featuring a newly added `BottomNavbar`
- Tablet and desktop optimized
- Smooth animations with Framer Motion
- Modern UI with Tailwind CSS

### Deep Multi-Language Support
- The frontend features fully integrated `LanguageContext` switching dynamically between English and Hindi based on user preference or browser settings, loading extensive JSON dictionaries via `translations.js`.

## 🎨 Styling

The application uses **Tailwind CSS** for styling with a custom configuration:

- **Color Scheme**: Green-based theme representing agriculture
- **Typography**: System fonts with fallbacks
- **Dark Mode**: Ready for implementation
- **Animations**: Framer Motion for smooth transitions

### Key Design Elements
- Gradient backgrounds
- Glass-morphism effects
- Consistent spacing and sizing
- Accessible color contrasts

## 🔒 Security

- **Environment Variables**: Sensitive data in `.env` files
- **Protected Routes**: Authentication required for sensitive pages
- **Firebase Rules**: Secure authentication flow & App check verified requests.
- **XSS Protection**: React's built-in XSS prevention
- **CORS Configuration**: Strict routing policies handled by backend Origin and Referer checks.

## 🌐 API Integration

The client communicates with the backend API for:

### User Management
- `POST /api/users/auth` - Authenticate/create user
- `PUT /api/users/:userId` - Update user profile
- `GET /api/users/:userId/name-history` - Get name change history
- `GET /api/users/verify` - Verify server JWT token on reload

### Case Management
- `POST /api/cases` - Create new case
- `GET /api/cases/user/:userId` - Get user's cases
- `GET /api/cases/:caseId` - Get case details
- `GET /api/cases/:caseId/result` - Get processed AI case result
- `POST /api/cases/:caseId/process` - Process case with AI
- `DELETE /api/cases/:caseId` - Delete case

### AI Services
- `POST /api/ask/:caseId/messages` - Chat with Ask VeAg
- `GET /api/cases/:caseId/treatment-info` - Fetch all AI treatments
- `POST /api/cases/:caseId/treatment-info/:type` - Generate granular AI treatment (treatment, causes, prevention)

### Product & Admin Services
- `GET /api/products` - Search marketplace
- `POST /api/products/track-search` - Track search queries
- `POST /api/admin/login` - Authenticate Admin
- `PUT /api/admin/products/:productId` - Edit a marketplace item

### Subscription Management
- `GET /api/subscriptions/:userId` - Get subscription status
- `POST /api/subscriptions/create-order` - Create payment order
- `POST /api/subscriptions/verify-payment` - Verify payment
- `GET /api/subscriptions/:userId/transactions` - Get transaction history

### Crop Information
- `GET /api/crops` - Get all available crops

## 🏛️ Architectural & Caching Patterns

- **Optimistic Auth Caching**: `AuthContext.jsx` caches the user session and JWT in `localStorage` (`veag_auth_user` and `veag_jwt_token`) with a 7-day expiry to optimistically load the UI while silently verifying the token in the background.
- **Background Polling & State Recovery**: `CaseDetail.jsx` uses `localStorage` (`veag_treatment_${caseId}_${type}`) to persist the state of AI treatment generation across page reloads. If a user refreshes the page while generation is "started", the component resumes polling the backend every 5 seconds until completion or timeout.
- **Dynamic CSS Injection**: `ProductSearch.jsx` programmatically injects global CSS keyframes (`veagShimmer`, `veagSpin`) directly into the document `<head>` on mount, bypassing standard Tailwind configuration.

## 📱 Pages Overview

### Public Pages
- **Landing (`/`)** - Welcome page with features and call-to-action
- **Login (`/login`)** - Google Sign-In authentication
- **Policy Pages** - Terms, Privacy, Return Policy, Shipping

### Protected Pages (Require Authentication)
- **Dashboard (`/dashboard`)** - User overview, quick stats
- **Register Case (`/register-case`)** - Submit new crop disease case
- **Manage Cases (`/manage-cases`)** - View all cases
- **Case Detail (`/case/:caseId`)** - Detailed case information
- **Product Search (`/dashboard/products`)** - Agricultural shop
- **Edit Profile (`/edit-profile`)** - Update user information
- **Manage Subscription (`/manage-subscription`)** - Subscription and payments
- **Ask VeAg** - Chat interface modal available on Case Details

### Admin Pages
- **Admin Login (`/dashboard/admin`)** - Secure login for admins
- **Admin Panel (`/dashboard/admin/panel`)** - Control panel for editing app resources

## 🧩 Components

### Layout Components
- **Header** - Navigation bar with auth status
- **BottomNavbar** - Mobile navigation bar
- **Layout** - Consistent page wrapper
- **PageHeader** - Page title with breadcrumbs

### Utility Components
- **ProtectedRoute** - Authentication guard HOC
- **withSubscription** - Subscription check HOC

### Context Providers
- **AuthContext** - Global authentication state
- **LanguageContext** - Full English/Hindi app internationalization

## 🔧 Configuration Files

### vite.config.js
- React plugin configuration
- Build optimization
- Proxy routing configuration for Nginx Docker deployments

### tailwind.config.js
- Custom color palette
- Extended utilities
- Plugin configuration

### firebase.json
- Hosting configuration
- Redirect rules
- Header settings

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

2. **Firebase Authentication Issues**
   - Verify Firebase configuration in `.env`
   - Check Firebase Console for authorized domains
   - Ensure Google Auth is enabled in Firebase

3. **API Connection Issues**
   - Verify backend server is running
   - Check `VITE_API_URL` in `.env`
   - Verify CORS configuration on backend

4. **Environment Variables Not Loading**
   - Ensure `.env` file is in the `client/` directory
   - Restart development server after changing `.env`
   - Variables must start with `VITE_` prefix

## 📦 Dependencies

### Production Dependencies
```json
{
  "axios": "^1.6.7",
  "firebase": "^10.8.0",
  "framer-motion": "^12.23.25",
  "jspdf": "^4.2.0",
  "lucide-react": "^0.556.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.17",
  "postcss": "^8.4.35",
  "tailwindcss": "^3.4.1",
  "vite": "^5.1.4"
}
```

## 🚢 Deployment

### Docker (Recommended for Production)
The frontend contains a `Dockerfile` and `nginx.conf`. When run via Docker Compose in the project root, the React app is built and served via Nginx. Nginx handles proxying API requests to the Node server seamlessly, meaning `VITE_API_URL` should be left empty.

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Vercel / Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in platform settings
5. Deploy

## 🔄 Version History

- **v5.5.5** - Current version
  - Massive overhaul introducing Ask VeAg, Admin Panel, Marketplace, integrated Gemini Insights, comprehensive i18n, and Docker/Nginx support.
- **v3.3.3** - Previous version

## 📄 License

This project is part of the VeAg platform. All rights reserved.

## 🤝 Contributing

This is a final year project. For contributions or suggestions, please contact the project maintainers.

## 📞 Support

For issues or questions:
1. Check this README and troubleshooting section
2. Review backend documentation (`../server/README.md`)
3. Check model documentation (`../model/README.md`)

---

**VeAg Client** - Empowering agriculture with AI-powered crop disease detection.
