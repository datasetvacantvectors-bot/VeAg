import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import { X, ShieldCheck, FileText, RefreshCw, Truck, Lock } from 'lucide-react';
import veagLogo from '../assets/veag_logo.png';

import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import ReturnRefundCancellation from './ReturnRefundCancellation';
import ShippingAndDelivery from './ShippingAndDelivery';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, currentUser, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'refund' | 'shipping' | null
  const [agreed, setAgreed] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  // Slide-to-sign-in state
  const controls = useAnimation();
  const x = useMotionValue(0);
  const trackRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (trackRef.current) {
        setDragConstraints({ left: 0, right: trackRef.current.offsetWidth - 56 }); // 48px handle + 8px padding
      }
    };
    updateConstraints();
    setTimeout(updateConstraints, 100);
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [agreed]);

  const handleDragEnd = () => {
    const maxX = dragConstraints.right;
    if (x.get() > maxX * 0.7) {
      controls.start({ x: maxX });
      handleGoogleSignIn();
    } else {
      controls.start({ x: 0 });
    }
  };

  useEffect(() => {
    if (!loading && x.get() > 0) {
      controls.start({ x: 0 });
    }
  }, [loading, x, controls]);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!authLoading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  // Show loading screen while checking authentication or redirecting
  if (authLoading || currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center">
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

        {/* Mountains */}
        <svg className="absolute bottom-0 left-0 w-full h-80 opacity-50" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#a0522d" d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#d97706" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z" />
        </svg>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />

        {/* Loading Content */}
        <motion.div className="relative z-30 flex flex-col items-center justify-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative w-20 h-20">
            <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-4 rounded-full border-2 border-transparent border-t-white" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
          </div>
          <motion.p className="text-white font-semibold text-lg drop-shadow-lg" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            {t.loading}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError(t.login.errorSignIn || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'privacy': return <PrivacyPolicy isModal={true} />;
      case 'terms': return <TermsAndConditions isModal={true} />;
      case 'refund': return <ReturnRefundCancellation isModal={true} />;
      case 'shipping': return <ShippingAndDelivery isModal={true} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center">
      {/* Animated Sky */}
      <motion.div className="absolute top-12 left-12 w-48 h-24 bg-white rounded-full opacity-60 blur-2xl" animate={{ x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute top-32 right-20 w-64 h-32 bg-white rounded-full opacity-50 blur-3xl" animate={{ x: [0, -60, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      
      {/* Sun glow effect */}
      <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-300 rounded-full opacity-30 blur-[100px]" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

      {/* Mountains */}
      <svg className="absolute bottom-0 left-0 w-full h-80 opacity-50" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#a0522d" d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full h-64 opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#d97706" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z" />
      </svg>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />

      {/* Main Login Card Container */}
      <motion.div
        className="relative z-30 w-full min-h-[100dvh] sm:min-h-0 sm:h-auto sm:max-w-md md:max-w-lg lg:max-w-xl sm:px-4 sm:py-8 flex flex-col justify-center"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full min-h-[100dvh] sm:min-h-0 sm:h-auto bg-white/40 backdrop-blur-3xl sm:backdrop-blur-2xl border-none sm:border sm:border-white/50 shadow-none sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-none sm:rounded-[2.5rem] overflow-hidden relative flex flex-col justify-center">
          {/* Top banner accent */}
          <div className="hidden sm:block absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 opacity-90" />
          
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col items-center h-full sm:h-auto justify-center sm:justify-start">
            {/* Logo */}
            <div className="relative mb-8 sm:mb-10">
              <motion.div 
                animate={loading ? { scale: [1, 0.95, 1] } : {}}
                transition={{ duration: 1.5, repeat: loading ? Infinity : 0, ease: "easeInOut" }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/60 backdrop-blur-md shadow-xl flex items-center justify-center p-3 sm:p-4 relative border-4 border-double border-white z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-transparent rounded-full opacity-70"></div>
                
                <img 
                  src={veagLogo} 
                  alt="VeAg Logo" 
                  onLoad={() => setIsLogoLoaded(true)}
                  onError={() => setIsLogoLoaded(true)}
                  className={`w-full h-full object-contain drop-shadow-md relative z-10 transition-opacity duration-300 ${!isLogoLoaded ? 'opacity-0' : (loading ? 'opacity-60' : 'opacity-100')}`} 
                />
                
                {!isLogoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-[3px] border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                  </div>
                )}
                
                <AnimatePresence>
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: "linear" } }}
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-b-orange-500 z-20"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-3 flex flex-wrap justify-center items-baseline gap-x-2">
              <span className="drop-shadow-sm">Welcome to</span>
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-extrabold py-1">VeAg</span>
            </h2>
            <p className="text-gray-700 text-center text-sm sm:text-base mb-10 font-medium">
              {t.login.subtitle}
            </p>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="w-full mb-6 overflow-hidden"
                >
                  <div className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-900 rounded-2xl text-center text-sm shadow-inner font-semibold">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agreement Checkbox */}
            <div className="w-full mb-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                    agreed 
                      ? 'bg-green-600 border-green-600' 
                      : 'bg-white/50 border-gray-400 group-hover:border-gray-600'
                  }`}>
                    <motion.svg
                      initial={false}
                      animate={{ scale: agreed ? 1 : 0, opacity: agreed ? 1 : 0 }}
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </div>
                <span className="text-xs text-gray-800 font-medium leading-tight">
                  I agree to the Terms, Privacy, Refund, and Shipping policies.
                </span>
              </label>
            </div>

            {/* Desktop Google Sign In Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={loading || !agreed}
              className="hidden sm:flex w-full relative group overflow-hidden items-center justify-center gap-3 px-6 py-3.5 bg-white/90 hover:bg-white text-gray-900 font-bold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/50"
              whileHover={agreed && !loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={agreed && !loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-5 h-5">
                    <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 border-r-orange-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    <motion.div className="absolute inset-1 rounded-full border-2 border-transparent border-b-green-500 border-l-green-500" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                  </div>
                  <span className="text-base">{t.login.signingIn}</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-base">{t.login.signInGoogle}</span>
                </>
              )}
            </motion.button>

            {/* Mobile Slide-to-Sign-In */}
            <div className="sm:hidden w-full relative h-14 bg-white/20 rounded-full border border-white/40 shadow-inner overflow-hidden flex items-center" ref={trackRef}>
              <motion.div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-400 to-green-500 opacity-80"
                style={{ width: useTransform(x, (val) => val + 56) }} 
              />
              
              <div className="absolute w-full text-center pointer-events-none z-0 pl-10 pr-4">
                <span className={`text-sm font-bold transition-colors duration-300 ${agreed ? 'text-gray-900 drop-shadow-sm' : 'text-gray-400'}`}>
                  {loading ? t.login.signingIn : 'Slide to Sign In'}
                </span>
              </div>

              <motion.div
                drag={agreed && !loading ? "x" : false}
                dragConstraints={dragConstraints}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className={`w-12 h-12 ml-1 rounded-full flex items-center justify-center z-10 shadow-md ${agreed ? 'bg-white cursor-grab active:cursor-grabbing' : 'bg-white/50 cursor-not-allowed'} relative`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                ) : (
                  <svg className={`w-5 h-5 transition-opacity ${agreed ? 'opacity-100' : 'opacity-50 grayscale'}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
              </motion.div>
            </div>
            
            <p className="flex justify-center items-center gap-1.5 text-gray-600 text-xs sm:text-sm mt-6 font-bold">
              <Lock className="w-4 h-4" />
              {t.login.secureAccount}
            </p>

            {/* Quick Links for Policies */}
            <div className="w-full mt-8 pt-6 border-t border-gray-300 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[0.7rem] sm:text-xs text-gray-700 font-bold">
              <button onClick={() => setActiveModal('terms')} className="hover:text-gray-900 transition-colors underline decoration-gray-400 underline-offset-2">Terms</button>
              <span>•</span>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-gray-900 transition-colors underline decoration-gray-400 underline-offset-2">Privacy</button>
              <span>•</span>
              <button onClick={() => setActiveModal('refund')} className="hover:text-gray-900 transition-colors underline decoration-gray-400 underline-offset-2">Refund</button>
              <span>•</span>
              <button onClick={() => setActiveModal('shipping')} className="hover:text-gray-900 transition-colors underline decoration-gray-400 underline-offset-2">Shipping</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Global Modals overlaying everything */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-4xl bg-white/20 backdrop-blur-[40px] rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-white/40"
            >
              {/* Top Accent Line */}
              <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 shrink-0" />
              
              {/* Header with Close Button */}
              <div className="flex justify-end p-4 shrink-0 absolute top-2 right-2 z-10">
                <motion.button
                  onClick={() => setActiveModal(null)}
                  className="p-2 bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full transition-all shadow-sm backdrop-blur-md border border-white/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto overflow-x-hidden w-full h-full p-4 sm:p-8 custom-scrollbar">
                {renderModalContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Login;
