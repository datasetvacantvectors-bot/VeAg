import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Globe, Zap, CheckCircle, Upload, Brain, FileCheck, Users, Mail, ChevronDown, Menu, X, Leaf, Shield, Award } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const faqRef = useRef(null);
  const contactRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  const { scrollY } = useScroll();
  const logoY = useTransform(scrollY, [0, 300], [0, -150]);
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.6]);
  const titleY = useTransform(scrollY, [0, 300], [0, -120]);
  const buttonY = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200, 300], [1, 0.5, 0]);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingNav(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center no-blur-theme">
        {/* Sky background with clouds */}
        <motion.div
          className="absolute top-12 left-12 w-32 h-16 bg-white rounded-full opacity-70 blur-xl"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-24 right-20 w-40 h-20 bg-white rounded-full opacity-60 blur-xl"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Mountains - Back Layer */}
        <svg
          className="absolute bottom-0 left-0 w-full h-80 opacity-50"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#a0522d"
            d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z"
          />
        </svg>

        {/* Mountains - Middle Layer */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64 opacity-70"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#d97706"
            d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z"
          />
        </svg>

        {/* Grass */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />

        {/* Loading Content */}
        <motion.div
          className="relative z-30 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Beautiful Loader */}
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-2 border-transparent border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-white font-semibold text-lg drop-shadow-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t.loading}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden no-blur-theme">
      {/* Hero Section with Original Theme */}
      <section ref={heroRef} className="min-h-screen relative flex items-center justify-center">
        {/* Language Selector - Top Right with Liquid Glass Design */}
        <div className="absolute top-6 right-6 z-50">
          <motion.button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="group relative p-3 rounded-2xl bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Globe className="w-6 h-6 text-white relative z-10" />
          </motion.button>

          <AnimatePresence>
            {showLanguageDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLanguageDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/40"
                >
                  {languages.map((lang, index) => (
                    <motion.button
                      key={lang.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-orange-100/50 hover:to-yellow-100/50 transition-all duration-300 ${
                        language === lang.code ? 'bg-gradient-to-r from-orange-100/70 to-yellow-100/70' : ''
                      }`}
                    >
                      <span className="text-gray-800 font-medium">{lang.name}</span>
                      {language === lang.code && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="w-4 h-4 ml-auto text-orange-600" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Sky background with clouds */}
        <motion.div
          className="absolute top-12 left-12 w-32 h-16 bg-white rounded-full opacity-70 blur-xl"
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-24 right-20 w-40 h-20 bg-white rounded-full opacity-60 blur-xl"
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Mountains - Back Layer (Sunset Brown) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-80 opacity-50"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#a0522d"
            d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z"
          />
        </svg>

        {/* Mountains - Middle Layer (Burnt Orange) */}
        <svg
          className="absolute bottom-0 left-0 w-full h-64 opacity-70"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#d97706"
            d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z"
          />
        </svg>

        {/* Grass at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />

        {/* Detailed Grass */}
        <svg
          className="absolute bottom-24 left-0 w-full h-16"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ zIndex: 15 }}
        >
          <path
            fill="#22c55e"
            d="M0,20L20,25C40,30,80,40,120,38C160,36,200,20,240,22C280,24,320,40,360,42C400,44,440,32,480,28C520,24,560,28,600,30C640,32,680,32,720,30C760,28,800,24,840,26C880,28,920,36,960,38C1000,40,1040,36,1080,32C1120,28,1160,24,1200,26C1240,28,1280,36,1320,38C1360,40,1400,36,1440,34L1440,80L0,80Z"
          />
        </svg>

        {/* Trees - Left side (Fixed to ground) */}
        <div className="absolute bottom-24 left-10 z-20">
          <svg width="120" height="200" viewBox="0 0 60 100">
            <rect x="24" y="70" width="12" height="30" fill="#8b4513" />
            <circle cx="30" cy="40" r="25" fill="#10b981" />
            <circle cx="15" cy="50" r="20" fill="#059669" />
            <circle cx="45" cy="50" r="20" fill="#059669" />
          </svg>
        </div>

        {/* Trees - Right side (Fixed to ground) */}
        <div className="absolute bottom-20 right-16 z-20">
          <svg width="100" height="180" viewBox="0 0 50 90">
            <rect x="20" y="60" width="10" height="30" fill="#8b4513" />
            <circle cx="25" cy="35" r="22" fill="#10b981" />
            <circle cx="12" cy="45" r="18" fill="#059669" />
            <circle cx="38" cy="45" r="18" fill="#059669" />
          </svg>
        </div>

        {/* Farmer - Left side (Fixed to ground) */}
        <div className="absolute bottom-24 left-32 z-20">
          <svg width="80" height="120" viewBox="0 0 40 60">
            <circle cx="20" cy="12" r="6" fill="#f4a460" />
            <rect x="17" y="19" width="6" height="15" fill="#4169e1" />
            <line x1="12" y1="22" x2="5" y2="28" stroke="#f4a460" strokeWidth="2" />
            <line x1="28" y1="22" x2="35" y2="28" stroke="#f4a460" strokeWidth="2" />
            <line x1="18" y1="34" x2="16" y2="45" stroke="#8b4513" strokeWidth="2" />
            <line x1="22" y1="34" x2="24" y2="45" stroke="#8b4513" strokeWidth="2" />
            <circle cx="20" cy="9" r="4" fill="#d2691e" opacity="0.6" />
          </svg>
        </div>

        {/* Farmer - Right side (Fixed to ground) */}
        <div className="absolute bottom-20 right-40 z-20">
          <svg width="80" height="120" viewBox="0 0 40 60">
            <circle cx="20" cy="12" r="6" fill="#f4a460" />
            <rect x="17" y="19" width="6" height="15" fill="#228b22" />
            <line x1="12" y1="22" x2="5" y2="28" stroke="#f4a460" strokeWidth="2" />
            <line x1="28" y1="22" x2="35" y2="28" stroke="#f4a460" strokeWidth="2" />
            <line x1="18" y1="34" x2="16" y2="45" stroke="#8b4513" strokeWidth="2" />
            <line x1="22" y1="34" x2="24" y2="45" stroke="#8b4513" strokeWidth="2" />
            <circle cx="20" cy="9" r="4" fill="#d2691e" opacity="0.6" />
          </svg>
        </div>

        {/* Content - Center with Parallax */}
        <div className="relative z-30 flex flex-col items-center justify-center text-center px-4">
          {/* Logo with Parallax */}
          <motion.div
            className="mb-8 relative"
            style={{ y: logoY, scale: logoScale, opacity }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 blur-2xl opacity-60 animate-pulse" style={{ width: '160px', height: '160px', marginLeft: 'auto', marginRight: 'auto', left: '50%', transform: 'translateX(-50%)' }} />
            
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-orange-300 via-orange-200 to-yellow-200 flex items-center justify-center shadow-2xl border-8 border-orange-400/50 overflow-hidden">
              {!isLogoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-orange-100/50 z-10">
                  <div className="relative w-12 h-12">
                    <motion.div
                      className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-1 border-4 border-transparent border-b-green-500 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
              <img
                src={veagLogo}
                alt="VeAg Logo"
                onLoad={() => setIsLogoLoaded(true)}
                className={`w-32 h-32 object-contain rounded-full relative z-20 transition-opacity duration-500 ${isLogoLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-40 h-20 rounded-full bg-gradient-to-b from-orange-400/40 to-orange-200/10 blur-xl" />
          </motion.div>

          {/* Heading with Parallax */}
          <motion.div style={{ y: titleY, opacity }}>
            <motion.h1
              className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white mb-8 drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              VeAg
            </motion.h1>
            
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-white mb-4 max-w-4xl mx-auto leading-tight drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.landing.hero?.title || 'AI-Powered Crop Disease Detection'}
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t.landing.hero?.subtitle || 'Protect your crops with intelligent disease detection'}
            </motion.p>
          </motion.div>

          {/* Get Started Button with Liquid Glass Design and Parallax */}
          <motion.div style={{ y: buttonY, opacity }} className="flex justify-center">
            <motion.button
              onClick={() => navigate('/login')}
              className="group relative px-16 sm:px-20 py-5 bg-emerald-500/70 backdrop-blur-2xl text-white font-bold rounded-full text-2xl sm:text-3xl shadow-2xl flex items-center gap-4 overflow-hidden border border-white/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">{t.landing.getStarted}</span>
              <ArrowRight className="w-7 h-7 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => scrollToSection(featuresRef)}
              className="cursor-pointer"
            >
              <ChevronDown className="w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating Get Started Button */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              onClick={() => navigate('/login')}
              className="group relative px-10 py-4 bg-emerald-500/70 backdrop-blur-2xl text-white font-bold rounded-full text-lg shadow-2xl flex items-center gap-3 overflow-hidden border border-white/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">{t.landing.getStarted}</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section with Liquid Glass Design */}
      <section ref={featuresRef} className="py-20 px-4 relative overflow-hidden">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50"
          animate={{
            background: [
              'linear-gradient(to bottom right, rgb(254 215 170), rgb(254 249 195), rgb(240 253 244))',
              'linear-gradient(to bottom right, rgb(254 249 195), rgb(240 253 244), rgb(204 251 241))',
              'linear-gradient(to bottom right, rgb(240 253 244), rgb(204 251 241), rgb(254 215 170))',
              'linear-gradient(to bottom right, rgb(254 215 170), rgb(254 249 195), rgb(240 253 244))'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4 py-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t.landing.features?.title || 'Features'}
            </motion.h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t.landing.features?.subtitle || 'Advanced technology for your crops'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { key: 'feature1', gradient: 'from-emerald-400 to-green-500', title: 'AI Analysis', desc: 'Advanced disease detection' },
              { key: 'feature2', gradient: 'from-green-400 to-teal-500', title: 'Instant Results', desc: 'Get results in minutes' },
              { key: 'feature3', gradient: 'from-teal-400 to-cyan-500', title: 'Multiple Crops', desc: 'Support for various crops' }
            ].map((feature, index) => {
              return (
                <motion.div
                  key={feature.key}
                  className="group relative p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 hover:border-white/80 transition-all cursor-pointer overflow-hidden h-full min-h-[280px] flex flex-col"
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -10, scale: 1.03 }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    animate={{
                      background: [
                        `linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.1) 100%)`,
                        `linear-gradient(225deg, transparent 0%, rgba(16, 185, 129, 0.1) 100%)`,
                        `linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.1) 100%)`
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-2xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  />
                  
                  <div className="flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">
                      {t.landing.features?.[feature.key]?.title || feature.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed relative z-10 flex-1">
                      {t.landing.features?.[feature.key]?.description || feature.desc}
                    </p>
                  </div>
                  
                  {/* Bottom shine effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section with Liquid Flow Design */}
      <section ref={howItWorksRef} className="py-20 px-4 relative overflow-hidden bg-white">
        {/* Animated liquid background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-3xl"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"
            animate={{ 
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {t.landing.howItWorks?.title || 'How It Works'}
            </motion.h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t.landing.howItWorks?.subtitle || 'Simple process to protect your crops'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Flow Line */}
            <svg className="hidden lg:block absolute top-24 left-0 w-full h-2" style={{ zIndex: 0 }}>
              <motion.path
                d="M 0 0 Q 200 -20 400 0 T 800 0 T 1200 0"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {[
              { icon: Users, key: 'step1', number: '01', gradient: 'from-emerald-400 via-green-400 to-teal-400', title: 'Sign Up', desc: 'Create your account' },
              { icon: Upload, key: 'step2', number: '02', gradient: 'from-green-400 via-teal-400 to-cyan-400', title: 'Upload Images', desc: 'Take photos of plants' },
              { icon: Brain, key: 'step3', number: '03', gradient: 'from-teal-400 via-cyan-400 to-sky-400', title: 'AI Analysis', desc: 'AI processes images' },
              { icon: FileCheck, key: 'step4', number: '04', gradient: 'from-cyan-400 via-sky-400 to-blue-400', title: 'Get Results', desc: 'Receive diagnosis' }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.key}
                  className="relative"
                  initial={{ opacity: 0, y: 50, rotateY: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 80
                  }}
                >
                  <motion.div
                    className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/80 cursor-pointer overflow-hidden h-full min-h-[320px] flex flex-col"
                    whileHover={{ y: -12, scale: 1.05, rotateZ: 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Number watermark with gradient */}
                    <motion.div
                      className={`absolute -top-6 -right-6 text-9xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20 group-hover:opacity-30 transition-opacity`}
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {step.number}
                    </motion.div>

                    {/* Animated glow */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      animate={{
                        background: [
                          `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)`,
                          `radial-gradient(circle at 60% 60%, rgba(20, 184, 166, 0.1) 0%, transparent 70%)`,
                          `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)`
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    <div className="relative z-10 flex flex-col flex-1">
                      <motion.div
                        className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg relative overflow-hidden`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <Icon className="w-10 h-10 text-white relative z-10" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {t.landing.howItWorks?.[step.key]?.title || step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed flex-1">
                        {t.landing.howItWorks?.[step.key]?.description || step.desc}
                      </p>
                    </div>

                    {/* Bottom accent line */}
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section with Liquid Accordion Design */}
      <section ref={faqRef} className="py-20 px-4 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-yellow-50/50 to-green-50/50" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {t.landing.faq?.title || 'FAQ'}
            </motion.h2>
            <p className="text-xl text-gray-700">
              {t.landing.faq?.subtitle || 'Common questions'}
            </p>
          </motion.div>

          <div className="space-y-4">
            {['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map((q, index) => (
              <motion.div
                key={q}
                className="group relative bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/80 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                {/* Gradient accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 via-green-400 to-teal-400 transform origin-left transition-transform ${
                  openFaq === q ? 'scale-y-100' : 'scale-y-0'
                }`} />

                <motion.button
                  onClick={() => setOpenFaq(openFaq === q ? null : q)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {t.landing.faq?.[q] || `Question ${index + 1}`}
                  </span>
                  <motion.div
                    animate={{ 
                      rotate: openFaq === q ? 180 : 0,
                      scale: openFaq === q ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  >
                    <ChevronDown className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {openFaq === q && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -10 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        className="px-6 pb-5 text-gray-700 leading-relaxed bg-gradient-to-r from-emerald-50/30 to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {t.landing.faq?.[`a${q.slice(1)}`] || 'Answer coming soon'}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with Premium Liquid Design */}
      <section ref={contactRef} className="py-20 px-4 relative overflow-hidden">
        {/* Dynamic gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600"
          animate={{
            background: [
              'linear-gradient(to bottom right, rgb(5 150 105), rgb(22 163 74), rgb(20 184 166))',
              'linear-gradient(to bottom right, rgb(22 163 74), rgb(20 184 166), rgb(6 182 212))',
              'linear-gradient(to bottom right, rgb(20 184 166), rgb(6 182 212), rgb(5 150 105))',
              'linear-gradient(to bottom right, rgb(5 150 105), rgb(22 163 74), rgb(20 184 166))'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              {t.landing.contact?.title || 'Contact Us'}
            </motion.h2>
            <p className="text-xl text-emerald-50">
              {t.landing.contact?.subtitle || 'Get in touch'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                icon: Mail, 
                title: t.landing.contact?.general?.title || 'General Inquiries',
                desc: t.landing.contact?.general?.description || 'For support and questions',
                delay: 0
              },
              { 
                icon: Shield, 
                title: t.landing.contact?.payment?.title || 'Payment Related',
                desc: t.landing.contact?.payment?.description || 'For billing queries',
                delay: 0.2
              }
            ].map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 hover:border-white/50 transition-all overflow-hidden"
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.7,
                    delay: contact.delay,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -10, scale: 1.03 }}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.5 }}
                  />

                  {/* Floating particles */}
                  <motion.div
                    className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                  />

                  <motion.div
                    className="relative w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-white relative z-10">
                    {contact.title}
                  </h3>
                  <p className="text-emerald-50 mb-6 relative z-10">
                    {contact.desc}
                  </p>
                  
                  <motion.a
                    href="mailto:sarthak@vacantvectors.com"
                    className="inline-flex items-center gap-2 text-lg font-semibold text-white hover:text-emerald-100 transition-colors relative z-10 group/link"
                    whileHover={{ x: 5 }}
                  >
                    <span>sarthak@vacantvectors.com</span>
                    <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                  </motion.a>

                  {/* Bottom shine effect */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                <img src={veagLogo} alt="VeAg" className="w-10 h-10 border border-white/100 rounded-3xl" />
                <div>
                  <div className="text-2xl font-bold">VeAg</div>
                  <div className="text-sm text-gray-400">
                    {t.landing.footer?.tagline || 'Protecting crops with AI'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => scrollToSection(featuresRef)} className="text-gray-400 hover:text-white transition-colors text-left">
                  {t.landing.features?.title || 'Features'}
                </button>
                <button onClick={() => scrollToSection(howItWorksRef)} className="text-gray-400 hover:text-white transition-colors text-left">
                  {t.landing.howItWorks?.title || 'How It Works'}
                </button>
                <button onClick={() => scrollToSection(faqRef)} className="text-gray-400 hover:text-white transition-colors text-left">
                  FAQ
                </button>
                <button onClick={() => scrollToSection(contactRef)} className="text-gray-400 hover:text-white transition-colors text-left">
                  {t.landing.contact?.title || 'Contact'}
                </button>
              </div>
            </div>

            {/* Legal Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-4">Policies</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate('/terms-and-conditions')} className="text-gray-400 hover:text-white transition-colors text-left">
                  Terms and Conditions
                </button>
                <button onClick={() => navigate('/privacy-policy')} className="text-gray-400 hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
                <button onClick={() => navigate('/return-refund-cancellation')} className="text-gray-400 hover:text-white transition-colors text-left">
                  Return/Refund/Cancellation
                </button>
                <button onClick={() => navigate('/shipping-and-delivery')} className="text-gray-400 hover:text-white transition-colors text-left">
                  Shipping & Delivery
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} VeAg. {t.landing.footer?.rights || 'All rights reserved'}</p>
            <p className="text-sm text-gray-500 mt-2">Version 5.4.5</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
