import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/translations";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Higher-Order Component to protect routes that require active subscription
export const withSubscription = (Component) => {
  return function ProtectedComponent(props) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { language } = useLanguage();
    const t = translations[language];
    const [isChecking, setIsChecking] = useState(true);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
      const checkSubscription = async () => {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        try {
          const response = await axios.get(
            `${API_BASE_URL}/subscriptions/${currentUser.userId}/active`,
          );

          // console.log('Subscription response:', response.data);

          const hasActivePlan = response.data.hasActivePlan;
          const days = response.data.subscription?.daysRemaining || 0;

          // Only set as active if both conditions are true
          const isActive = hasActivePlan === true && days > 0;

          setHasActiveSubscription(isActive);
          setDaysRemaining(days); // Always set the days value

          // console.log('Has active plan:', hasActivePlan, 'Days:', days, 'Is Active:', isActive);
        } catch (error) {
          // console.error('Error checking subscription:', error);
          setHasActiveSubscription(false);
          setDaysRemaining(0);
        } finally {
          setIsChecking(false);
        }
      };

      checkSubscription();
    }, [currentUser, navigate]);

    if (isChecking) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden flex items-center justify-center">
          {/* Background Mountains */}
          <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
            <svg
              className="w-full h-64"
              viewBox="0 0 1200 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z"
                fill="#a0522d"
                opacity="0.3"
              />
              <path
                d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z"
                fill="#d97706"
                opacity="0.2"
              />
            </svg>
          </div>

          {/* Grass Layer */}
          <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>

          {/* Loader */}
          <div className="relative z-10 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-3 border-4 border-transparent border-t-green-400 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-6 border-4 border-transparent border-t-orange-300 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-white font-semibold text-lg">
              {t.noSubscription.checking}
            </p>
          </div>
        </div>
      );
    }

    if (!hasActiveSubscription) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden flex items-center justify-center p-4">
          {/* Background Mountains */}
          <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
            <svg
              className="w-full h-64"
              viewBox="0 0 1200 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z"
                fill="#a0522d"
                opacity="0.3"
              />
              <path
                d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z"
                fill="#d97706"
                opacity="0.2"
              />
            </svg>
          </div>

          {/* Grass Layer */}
          <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 max-w-md w-full bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-6">😞</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {t.noSubscription.title}
            </h2>
            <p className="text-white/80 mb-6">{t.noSubscription.message}</p>
            <div className="bg-green-600/80 border border-green-400/50 backdrop-blur-xl rounded-lg p-4 mb-6">
              <p className="text-white font-semibold">
                {t.noSubscription.getPremium}
              </p>
              <p className="text-sm text-white/90">
                {t.noSubscription.startingAt}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/manage-subscription")}
                className="w-full bg-green-600/80 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
              >
                {t.noSubscription.getSubscription}
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
              >
                {t.noSubscription.backToDashboard}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // console.log('withSubscription - Rendering component with daysRemaining:', daysRemaining);
    return <Component {...props} daysRemaining={daysRemaining} />;
  };
};

export default withSubscription;