import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Truck } from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";
import { useState, useEffect } from "react";

const ShippingAndDelivery = ({ isModal = false }) => {
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
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Shipping & Delivery Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Service Nature
              </h2>
              <p className="mb-4">
                VeAg is a digital service platform that provides AI-powered
                agricultural disease detection through our web application. As
                we offer digital services rather than physical products,
                traditional shipping and delivery terms do not apply to our core
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Digital Service Delivery
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Instant Access
              </h3>
              <p className="mb-4">
                Upon successful registration and payment (if applicable), you
                will receive immediate access to our platform and its features:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Account activation is instantaneous</li>
                <li>
                  Premium features are available immediately after subscription
                  purchase
                </li>
                <li>No waiting period for service delivery</li>
                <li>Access 24/7 from any internet-connected device</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Service Availability
              </h3>
              <p className="mb-4">Our digital services are available:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>24 hours a day, 7 days a week</li>
                <li>Subject to scheduled maintenance (notified in advance)</li>
                <li>Through web browsers on desktop and mobile devices</li>
                <li>With internet connectivity required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Analysis Results Delivery
              </h2>
              <p className="mb-4">
                When you submit crop images for disease detection:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Results are typically available within minutes</li>
                <li>
                  Processing time may vary based on image quality and system
                  load
                </li>
                <li>Results remain accessible in your account dashboard</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Email Communications
              </h2>
              <p className="mb-4">
                Digital communications from VeAg are delivered via email:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Support inquiries and responses</li>
                <li>
                  Payment confirmations delivered within minutes of transaction
                  by the payment processor
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Service Interruptions
              </h2>
              <p className="mb-4">
                While we strive for 99.9% uptime, service may be temporarily
                unavailable due to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Scheduled maintenance (notified at least 24 hours in advance)
                </li>
                <li>Emergency system updates</li>
                <li>Force majeure events beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Technical Requirements
              </h2>
              <p className="mb-4">To access VeAg services, you need:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>A stable internet connection</li>
                <li>
                  A modern web browser (Chrome, Firefox, Safari, Edge, or any
                  other up-to-date browser)
                </li>
                <li>A device with camera capability for image uploads</li>
                <li>Minimum recommended bandwidth: 2 Mbps</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Data Delivery and Storage
              </h2>
              <p className="mb-4">Your data and analysis results are:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Stored securely on our cloud providers</li>
                <li>Accessible through your account at any time</li>
                <li>Backed up regularly to prevent data loss</li>
                <li>Retained according to our data retention policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Support and Assistance
              </h2>
              <p className="mb-4">
                If you experience any issues accessing our digital services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Check our FAQ</li>
                <li>Contact support at sarthak@vacantvectors.com</li>
                <li>
                  Response time: Within 24 hours or more for standard inquiries
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="mb-4">
                We reserve the right to update this Shipping & Delivery Policy
                at any time. Changes will be posted on this page with an updated
                revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                11. Contact Information
              </h2>
              <p className="mb-4">
                For questions about service delivery or access issues, please
                contact:
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
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Shipping & Delivery Policy
            </h1>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: December 12, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. Service Nature
              </h2>
              <p className="mb-4">
                VeAg is a digital service platform that provides AI-powered
                agricultural disease detection through our web application. As
                we offer digital services rather than physical products,
                traditional shipping and delivery terms do not apply to our core
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. Digital Service Delivery
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Instant Access
              </h3>
              <p className="mb-4">
                Upon successful registration and payment (if applicable), you
                will receive immediate access to our platform and its features:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Account activation is instantaneous</li>
                <li>
                  Premium features are available immediately after subscription
                  purchase
                </li>
                <li>No waiting period for service delivery</li>
                <li>Access 24/7 from any internet-connected device</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Service Availability
              </h3>
              <p className="mb-4">Our digital services are available:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>24 hours a day, 7 days a week</li>
                <li>Subject to scheduled maintenance (notified in advance)</li>
                <li>Through web browsers on desktop and mobile devices</li>
                <li>With internet connectivity required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. Analysis Results Delivery
              </h2>
              <p className="mb-4">
                When you submit crop images for disease detection:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Results are typically available within minutes</li>
                <li>
                  Processing time may vary based on image quality and system
                  load
                </li>
                <li>Results remain accessible in your account dashboard</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. Email Communications
              </h2>
              <p className="mb-4">
                Digital communications from VeAg are delivered via email:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Support inquiries and responses</li>
                <li>
                  Payment confirmations delivered within minutes of transaction
                  by the payment processor
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. Service Interruptions
              </h2>
              <p className="mb-4">
                While we strive for 99.9% uptime, service may be temporarily
                unavailable due to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  Scheduled maintenance (notified at least 24 hours in advance)
                </li>
                <li>Emergency system updates</li>
                <li>Force majeure events beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. Technical Requirements
              </h2>
              <p className="mb-4">To access VeAg services, you need:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>A stable internet connection</li>
                <li>
                  A modern web browser (Chrome, Firefox, Safari, Edge, or any
                  other up-to-date browser)
                </li>
                <li>A device with camera capability for image uploads</li>
                <li>Minimum recommended bandwidth: 2 Mbps</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. Data Delivery and Storage
              </h2>
              <p className="mb-4">Your data and analysis results are:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Stored securely on our cloud providers</li>
                <li>Accessible through your account at any time</li>
                <li>Backed up regularly to prevent data loss</li>
                <li>Retained according to our data retention policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                9. Support and Assistance
              </h2>
              <p className="mb-4">
                If you experience any issues accessing our digital services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Check our FAQ</li>
                <li>Contact support at sarthak@vacantvectors.com</li>
                <li>
                  Response time: Within 24 hours or more for standard inquiries
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="mb-4">
                We reserve the right to update this Shipping & Delivery Policy
                at any time. Changes will be posted on this page with an updated
                revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                11. Contact Information
              </h2>
              <p className="mb-4">
                For questions about service delivery or access issues, please
                contact:
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

export default ShippingAndDelivery;