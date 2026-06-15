import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import { useState, useEffect } from 'react';

const PrivacyPolicy = ({ isModal = false }) => {
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
            <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-2 rounded-full border-4 border-transparent border-b-green-500 border-l-green-500" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </div>
          <p className="text-gray-600 font-semibold animate-pulse">Loading...</p>
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
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Privacy Policy</h1>
          </div>


          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last Updated: December 12, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
              <p className="mb-4">
                VeAg ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural disease detection service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="mb-4">We may collect personal information that you provide to us, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Profile Photo</li>
                <li>Phone number</li>
                <li>Customer Uploaded Data</li>
                <li>Payment information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Data</h3>
              <p className="mb-4">We automatically collect certain information when you use our service:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Device information</li>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Crop images uploaded for analysis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing and maintaining our service</li>
                <li>Processing your disease detection requests</li>
                <li>Managing your account and subscription</li>
                <li>Improving our AI models and service quality</li>
                <li>Sending you payment-related communications</li>
                <li>Responding to your inquiries and support requests</li>
                <li>Detecting and preventing fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Service providers who assist in operating our platform</li>
                <li>Payment processors for handling transactions</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="mb-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Cookies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to improve your experience. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <a href="tel:+917501493146" className="text-orange-600 hover:text-orange-700">
                  +91 7501493146
                </a>
                <br />
                <a href="mailto:sarthak@vacantvectors.com" className="text-orange-600 hover:text-orange-700">
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
              <img src={veagLogo} alt="VeAg" className="w-10 h-10 border border-white/100 rounded-3xl" />
              <span className="text-2xl font-bold text-white">VeAg</span>
            </div>
            <motion.button
              onClick={() => navigate('/')}
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Privacy Policy</h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">Last Updated: December 12, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
              <p className="mb-4">
                VeAg ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural disease detection service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="mb-4">We may collect personal information that you provide to us, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Profile Photo</li>
                <li>Phone number</li>
                <li>Customer Uploaded Data</li>
                <li>Payment information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Usage Data</h3>
              <p className="mb-4">We automatically collect certain information when you use our service:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Device information</li>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Crop images uploaded for analysis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing and maintaining our service</li>
                <li>Processing your disease detection requests</li>
                <li>Managing your account and subscription</li>
                <li>Improving our AI models and service quality</li>
                <li>Sending you payment-related communications</li>
                <li>Responding to your inquiries and support requests</li>
                <li>Detecting and preventing fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Service providers who assist in operating our platform</li>
                <li>Payment processors for handling transactions</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="mb-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Cookies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to improve your experience. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                <a href="tel:+917501493146" className="text-orange-600 hover:text-orange-700">
                  +91 7501493146
                </a>
                <br />
                <a href="mailto:sarthak@vacantvectors.com" className="text-orange-600 hover:text-orange-700">
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

export default PrivacyPolicy;
