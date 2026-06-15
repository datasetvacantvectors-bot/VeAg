import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_KEY = 'veag_cookies_accepted';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="w-full max-w-6xl mx-auto rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Top accent line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-veag-dark-green via-veag-green to-veag-light-green" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
              {/* Left: icon + text */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl select-none shrink-0">🍪</span>
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold">VeAg uses cookies</span> to enhance your app and browsing experience, remember your preferences, ensure proper functionality of all features, and keep you securely signed in. By continuing to use this site, you agree to our use of cookies.
                </p>
              </div>

              {/* Right: button */}
              <button
                onClick={handleAccept}
                className="shrink-0 px-6 py-2 rounded-xl bg-gradient-to-r from-veag-dark-green to-veag-green text-white text-sm font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150 whitespace-nowrap"
              >
                Okay, I Understood
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
