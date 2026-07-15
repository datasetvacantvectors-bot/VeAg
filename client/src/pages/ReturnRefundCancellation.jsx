import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";
import { useState, useEffect } from "react";

const ReturnRefundCancellation = ({ isModal = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    if (isModal) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-transparent">
          <div className="relative w-16 h-16 mb-4">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-green-500 border-l-green-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-gray-600 font-semibold animate-pulse">
            Loading...
          </p>
        </div>
      );
    }
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
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-2 border-transparent border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-white font-semibold text-lg drop-shadow-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (isModal) {
    return (
      <div className="bg-transparent">
        <div className="max-w-4xl mx-auto px-2 py-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Return, Refund & Cancellation Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Overview
              </h2>
              <p className="mb-4">
                At VeAg, we strive to provide the best agricultural disease
                detection service. This policy outlines the terms and conditions
                for returns, refunds, and cancellations of our subscription
                services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Plan Cancellation
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 How to Cancel
              </h3>
              <p className="mb-4">
                You can't cancel your plan, it wil automatically stop at the end
                of the plan purchased or extended plan purchased period.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Cancellation Effect
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Cancellations take effect at the end of the plan purchased or
                  extended plan purchased period
                </li>
                <li>
                  You will retain access to premium features until the end of
                  your paid period or extended plan period
                </li>
                <li>
                  No partial refunds will be provided for unused time in the
                  current plan period or extended plan period
                </li>
                <li>
                  After the plan purchased or extended plan purchased period
                  ends, your account will revert to the free tier (if available)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Refund Policy
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.1 Eligibility for Refunds
              </h3>
              <p className="mb-4">
                Refunds may be granted in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Technical issues preventing service access (if not resolved
                  within 1 week)
                </li>
                <li>Duplicate charges or billing errors</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.2 Non-Refundable Situations
              </h3>
              <p className="mb-4">Refunds will NOT be provided for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Change of mind after purchasing the Plan</li>
                <li>Services already consumed or utilized</li>
                <li>
                  Violation of Terms and Conditions leading to account
                  termination
                </li>
                <li>Partial month plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.3 Refund Processing
              </h3>
              <p className="mb-4">
                Approved refunds will be processed within 7-10 business days to
                the original payment method. The time it takes for the refund to
                appear in your account may vary depending on your financial
                institution.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Free Trial Cancellation
              </h2>
              <p className="mb-4">
                We don't offer free trials currently. However, if we do in the
                future, the following terms will apply:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  You can cancel anytime during the trial without being charged
                </li>
                <li>
                  Cancellation must be done at least 24 hours before the trial
                  ends
                </li>
                <li>
                  If you don't cancel, you'll be automatically charged for the
                  subscription
                </li>
                <li>Only one free trial per user</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Plan Changes
              </h2>
              <p className="mb-4">If you extend your plan period:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Upgrades take effect immediately, after you make the extension
                  purchase
                </li>
                <li>
                  Validity of the extended plan period is added to your existing
                  plan
                </li>
                <li>No refunds are provided for extensions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Service Interruptions
              </h2>
              <p className="mb-4">
                In case of prolonged service interruptions (more than 1 Week)
                due to issues on our end, we will provide:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Account credit for the duration of the interruption</li>
                <li>Extended subscription period at our discretion</li>
                <li>
                  Full or partial refund for significantly impacted services
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. How to Request a Refund
              </h2>
              <p className="mb-4">To request a refund (If you are eligible):</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Contact our support team at sarthak@vacantvectors.com</li>
                <li>
                  Provide your account details and reason for the refund request
                </li>
                <li>Include any relevant documentation or screenshots</li>
                <li>
                  Our team will review and respond within 7-10 business days
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Chargebacks
              </h2>
              <p className="mb-4">
                We encourage you to contact us before initiating a chargeback
                with your bank. Chargebacks may result in immediate account
                suspension. If you have a dispute, please reach out to us first
                so we can resolve it amicably.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Changes to This Policy
              </h2>
              <p className="mb-4">
                We reserve the right to modify this Return, Refund &
                Cancellation Policy at any time. Changes will be effective
                immediately upon posting on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Contact Information
              </h2>
              <p className="mb-4">
                For questions or concerns about returns, refunds, or
                cancellations, please contact us at:
                <br />
                <a
                  href="tel:+917501493146"
                  className="text-orange-600 hover:text-orange-700"
                >
                  +91 7501493146
                </a>
                <br />
                <a
                  href="mailto:sarthak@vacantvectors.com"
                  className="text-orange-600 hover:text-orange-700"
                >
                  sarthak@vacantvectors.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden no-blur-theme">
      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={veagLogo}
                alt="VeAg"
                className="w-10 h-10 border border-white/100 rounded-3xl"
              />
              <span className="text-2xl font-bold text-white">VeAg</span>
            </div>
            <motion.button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-white hover:bg-white/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center shrink-0">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Return, Refund & Cancellation Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Overview
              </h2>
              <p className="mb-4">
                At VeAg, we strive to provide the best agricultural disease
                detection service. This policy outlines the terms and conditions
                for returns, refunds, and cancellations of our subscription
                services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Plan Cancellation
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 How to Cancel
              </h3>
              <p className="mb-4">
                You can't cancel your plan, it wil automatically stop at the end
                of the plan purchased or extended plan purchased period.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Cancellation Effect
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Cancellations take effect at the end of the plan purchased or
                  extended plan purchased period
                </li>
                <li>
                  You will retain access to premium features until the end of
                  your paid period or extended plan period
                </li>
                <li>
                  No partial refunds will be provided for unused time in the
                  current plan period or extended plan period
                </li>
                <li>
                  After the plan purchased or extended plan purchased period
                  ends, your account will revert to the free tier (if available)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Refund Policy
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.1 Eligibility for Refunds
              </h3>
              <p className="mb-4">
                Refunds may be granted in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Technical issues preventing service access (if not resolved
                  within 1 week)
                </li>
                <li>Duplicate charges or billing errors</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.2 Non-Refundable Situations
              </h3>
              <p className="mb-4">Refunds will NOT be provided for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Change of mind after purchasing the Plan</li>
                <li>Services already consumed or utilized</li>
                <li>
                  Violation of Terms and Conditions leading to account
                  termination
                </li>
                <li>Partial month plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.3 Refund Processing
              </h3>
              <p className="mb-4">
                Approved refunds will be processed within 7-10 business days to
                the original payment method. The time it takes for the refund to
                appear in your account may vary depending on your financial
                institution.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Free Trial Cancellation
              </h2>
              <p className="mb-4">
                We don't offer free trials currently. However, if we do in the
                future, the following terms will apply:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  You can cancel anytime during the trial without being charged
                </li>
                <li>
                  Cancellation must be done at least 24 hours before the trial
                  ends
                </li>
                <li>
                  If you don't cancel, you'll be automatically charged for the
                  subscription
                </li>
                <li>Only one free trial per user</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Plan Changes
              </h2>
              <p className="mb-4">If you extend your plan period:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Upgrades take effect immediately, after you make the extension
                  purchase
                </li>
                <li>
                  Validity of the extended plan period is added to your existing
                  plan
                </li>
                <li>No refunds are provided for extensions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Service Interruptions
              </h2>
              <p className="mb-4">
                In case of prolonged service interruptions (more than 1 Week)
                due to issues on our end, we will provide:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Account credit for the duration of the interruption</li>
                <li>Extended subscription period at our discretion</li>
                <li>
                  Full or partial refund for significantly impacted services
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. How to Request a Refund
              </h2>
              <p className="mb-4">To request a refund (If you are eligible):</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Contact our support team at sarthak@vacantvectors.com</li>
                <li>
                  Provide your account details and reason for the refund request
                </li>
                <li>Include any relevant documentation or screenshots</li>
                <li>
                  Our team will review and respond within 7-10 business days
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Chargebacks
              </h2>
              <p className="mb-4">
                We encourage you to contact us before initiating a chargeback
                with your bank. Chargebacks may result in immediate account
                suspension. If you have a dispute, please reach out to us first
                so we can resolve it amicably.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Changes to This Policy
              </h2>
              <p className="mb-4">
                We reserve the right to modify this Return, Refund &
                Cancellation Policy at any time. Changes will be effective
                immediately upon posting on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Contact Information
              </h2>
              <p className="mb-4">
                For questions or concerns about returns, refunds, or
                cancellations, please contact us at:
                <br />
                <a
                  href="tel:+917501493146"
                  className="text-orange-600 hover:text-orange-700"
                >
                  +91 7501493146
                </a>
                <br />
                <a
                  href="mailto:sarthak@vacantvectors.com"
                  className="text-orange-600 hover:text-orange-700"
                >
                  sarthak@vacantvectors.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p>© {new Date().getFullYear()} VeAg. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default ReturnRefundCancellation;