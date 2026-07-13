import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { Home, FileText, FolderOpen, HelpCircle } from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/translations";

const NotFound = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setPageLoading(false), 800);
  }, []);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 flex items-center justify-center relative overflow-hidden">
        {/* Mountains */}
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#a0522d"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <path
            fill="#d97706"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>

        {/* Grass */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700"></div>

        {/* Loader */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-transparent border-t-orange-400 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border-4 border-transparent border-t-green-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="mt-6 text-white text-lg font-semibold">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden">
      {/* Mountains */}
      <svg
        className="fixed bottom-0 w-full z-0"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#a0522d"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
        <path
          fill="#d97706"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>

      {/* Grass */}
      <div className="fixed bottom-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-0"></div>

      {/* Clouds */}
      <motion.div
        className="fixed top-20 left-10 w-24 h-12 bg-white/30 rounded-full blur-sm z-0"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed top-40 right-20 w-32 h-14 bg-white/20 rounded-full blur-sm z-0"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      {currentUser && (
        <header className="relative z-10 bg-black/30 backdrop-blur-2xl border-b border-white/20">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white flex items-center justify-center overflow-hidden">
                <img
                  src={veagLogo}
                  alt="VeAg"
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <span className="text-2xl font-bold text-white">VeAg</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSupport(!showSupport)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={currentUser?.photoURL}
                  alt={currentUser?.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Support Popup */}
      {showSupport && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-[10000] bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl w-80"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">
              {t.notFound.needHelp}
            </h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">{t.notFound.supportText}</p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.notFound.contactSupport}
          </a>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-2xl rounded-2xl shadow-2xl p-12 text-center border border-white/40">
          <div className="flex flex-col items-center gap-6">
            {/* 404 Icon */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/40">
                <span className="text-6xl font-bold text-white">404</span>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-red-500/30 backdrop-blur-xl flex items-center justify-center border-2 border-red-400/50">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">
                {t.notFound.title}
              </h1>
              <p className="text-lg text-white/90 mb-2">{t.notFound.message}</p>
              <p className="text-sm text-white/70">{t.notFound.subtitle}</p>
            </div>

            {/* Auto-redirect Notice */}
            <div className="bg-orange-500/20 border-2 border-orange-400/50 backdrop-blur-xl rounded-lg p-4 w-full">
              <p className="text-white text-sm">
                <span className="font-semibold">{t.notFound.redirecting}</span>{" "}
                {t.notFound.in5Seconds}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                {t.notFound.goHome}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors backdrop-blur-xl"
              >
                {t.goBack}
              </button>
            </div>

            {/* Helpful Links */}
            <div className="pt-6 border-t border-white/20 w-full">
              <p className="text-sm text-white/70 mb-3">
                {t.notFound.quickLinks}:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/register-case")}
                  className="text-sm text-white hover:text-white/80 font-semibold transition-colors flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  {t.notFound.registerCase}
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={() => navigate("/manage-cases")}
                  className="text-sm text-white hover:text-white/80 font-semibold transition-colors flex items-center gap-1"
                >
                  <FolderOpen className="w-4 h-4" />
                  {t.notFound.manageCases}
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="text-sm text-white hover:text-white/80 font-semibold transition-colors"
                >
                  {t.notFound.editProfile}
                </button>
                <span className="text-white/40">|</span>
                <button
                  onClick={() => navigate("/manage-subscription")}
                  className="text-sm text-white hover:text-white/80 font-semibold transition-colors"
                >
                  {t.notFound.subscription}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;