import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";
import { useState, useEffect } from "react";

const TermsAndConditions = ({ isModal = false }) => {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Terms and Conditions
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using VeAg's agricultural disease detection
                service, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily use VeAg services for
                personal, non-commercial purposes. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or public display
                </li>
                <li>
                  Attempt to decompile or reverse engineer any software
                  contained in VeAg
                </li>
                <li>
                  Remove any copyright or proprietary notations from the
                  materials
                </li>
                <li>
                  Transfer the materials to another person or "mirror" the
                  materials on any other server
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Service Description
              </h2>
              <p className="mb-4">
                VeAg provides AI-powered crop disease detection services. While
                we strive for accuracy, we do not guarantee that our diagnoses
                are 100% accurate. Users should consult with agricultural
                experts for critical decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. User Responsibilities
              </h2>
              <p className="mb-4">Users are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing accurate information and clear images</li>
                <li>Maintaining the confidentiality of their account</li>
                <li>All activities that occur under their account</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Subscription and Payments
              </h2>
              <p className="mb-4">
                All features of VeAg require a paid subscription. By
                subscribing, you agree to pay all fees and charges according to
                the pricing and payment terms in effect at the time the fee or
                charge becomes payable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Disclaimer
              </h2>
              <p className="mb-4">
                The materials on VeAg's service are provided on an 'as is'
                basis. VeAg makes no warranties, expressed or implied, and
                hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. Limitations
              </h2>
              <p className="mb-4">
                In no event shall VeAg or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use VeAg's services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Modifications
              </h2>
              <p className="mb-4">
                VeAg may revise these terms of service at any time without
                notice. By using this service you are agreeing to be bound by
                the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions,
                please contact us at:
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
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden">
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Terms and Conditions
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using VeAg's agricultural disease detection
                service, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily use VeAg services for
                personal, non-commercial purposes. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or public display
                </li>
                <li>
                  Attempt to decompile or reverse engineer any software
                  contained in VeAg
                </li>
                <li>
                  Remove any copyright or proprietary notations from the
                  materials
                </li>
                <li>
                  Transfer the materials to another person or "mirror" the
                  materials on any other server
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Service Description
              </h2>
              <p className="mb-4">
                VeAg provides AI-powered crop disease detection services. While
                we strive for accuracy, we do not guarantee that our diagnoses
                are 100% accurate. Users should consult with agricultural
                experts for critical decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. User Responsibilities
              </h2>
              <p className="mb-4">Users are responsible for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing accurate information and clear images</li>
                <li>Maintaining the confidentiality of their account</li>
                <li>All activities that occur under their account</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Subscription and Payments
              </h2>
              <p className="mb-4">
                All features of VeAg require a paid subscription. By
                subscribing, you agree to pay all fees and charges according to
                the pricing and payment terms in effect at the time the fee or
                charge becomes payable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Disclaimer
              </h2>
              <p className="mb-4">
                The materials on VeAg's service are provided on an 'as is'
                basis. VeAg makes no warranties, expressed or implied, and
                hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property or other violation of
                rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. Limitations
              </h2>
              <p className="mb-4">
                In no event shall VeAg or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use VeAg's services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Modifications
              </h2>
              <p className="mb-4">
                VeAg may revise these terms of service at any time without
                notice. By using this service you are agreeing to be bound by
                the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions about these Terms and Conditions,
                please contact us at:
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

export default TermsAndConditions;