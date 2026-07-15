# VeAg App Download Landing Page

A dedicated, standalone React/Vite landing page designed to direct users to download the VeAg Mobile Application.

## 🌟 Overview

The **App Download Page** is a highly polished, responsive marketing landing page built entirely separate from the main web application (`/client`). Its sole purpose is to serve as a fast-loading promotional page highlighting the core features of the VeAg Mobile App (coming in v6.0.0) and providing immediate download links for iOS and Android.

Recently overhauled in **v5.5.5**, this page features:
- A completely revamped UI/UX highlighting the agricultural focus of the app.
- Custom SVGs and complex CSS visual overhaul in `index.css`.
- High-conversion call-to-action buttons for Apple App Store and Google Play Store.

## 🏗️ Tech Stack

- **React 18.3** - UI component library
- **React Router Dom** - Client-side routing
- **Vite 5.1** - Build tool and fast development server
- **Tailwind CSS** - Utility-first styling framework
- **Framer Motion** (optional) - For smooth entrance animations
- **Lucide React** - Icon library

## 📁 Project Structure

```
app-download-page/
├── public/                 # Static assets (Favicons, store badges)
├── src/
│   ├── assets/             # Brand logos, mockups, custom SVGs
│   ├── App.jsx             # React Router configuration
│   ├── App.css             # Base application styles
│   ├── DownloadPage.jsx    # Main Landing Page Component
│   ├── NotFoundPage.jsx    # 404 Fallback Component
│   ├── main.jsx            # React mounting point
│   └── index.css           # Global styles and tailwind imports
├── index.html              # HTML template
├── package.json            # Dependencies
├── tailwind.config.js      # Custom theme colors and fonts
└── vite.config.js          # Vite config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Navigate to the directory**
   ```bash
   cd VeAg_Project/app-download-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The landing page will be available at `http://localhost:5173` (or whichever port Vite assigns if 5173 is in use by the main client).

### Build for Production

```bash
npm run build
```

This creates an optimized, minified static site in the `dist/` directory, perfect for deploying to Vercel, Netlify, or Firebase Hosting.

## 🎨 Design System

The landing page uses a custom **Tailwind CSS** configuration tailored for a premium agricultural brand feel:

- **Primary Colors**: Deep forest greens and vibrant leaf greens.
- **Backgrounds**: Soft gradients, glass-morphism effects, and bespoke SVG curves.
- **Typography**: Large, readable fonts optimized for mobile viewing.

## 🚢 Deployment

Because this is a completely standalone static site, it can be deployed independently of the main VeAg infrastructure.

### Firebase Hosting (Current Setup)

The project is currently configured to deploy natively to Firebase Hosting.
- Ensure you have the `firebase-tools` CLI installed.
- The `.firebaserc` and `firebase.json` configuration files are located at the root of the VeAg project.
- To deploy, run `npm run build` here, then run `firebase deploy --only hosting:veag-app-landing` from the root directory.

### Vercel / Netlify

1. Connect your GitHub repository to Vercel/Netlify.
2. Set the Root Directory to `app-download-page`.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy.

## 🔗 Integration with VeAg Platform

This page is meant to be hosted on a subdomain (e.g., `app.veag.in` or `download.veag.in`). The main web application (`/client`) will eventually link out to this page when prompting mobile users to switch to the native app experience.

---

**VeAg** - Empowering agriculture with AI-powered crop disease detection.
