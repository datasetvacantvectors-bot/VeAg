import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Smartphone,
  Settings,
  ArrowDownToLine,
  PlayCircle,
  Leaf,
  Zap,
  Clock,
  Search,
  HelpCircle,
  Mail,
  CreditCard,
  ChevronDown,
  UserPlus,
  UploadCloud,
  Activity,
  MessageSquare,
  Shield,
  Lock,
  ArrowUp,
} from "lucide-react";

// Grab the download link from your .env file
const APK_DOWNLOAD_URL =
  import.meta.env.VITE_APK_DOWNLOAD_URL ||
  "https://drive.google.com/uc?export=download&id=1E8tsukkS7T-PCoQlHrK6eG-xJhTd4upE";

const DownloadPage = () => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedRefund, setAgreedRefund] = useState(false);
  const [agreedShipping, setAgreedShipping] = useState(false);

  const [downloadState, setDownloadState] = useState("idle"); // 'idle', 'downloading', 'success', 'error'
  const [openFaq, setOpenFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle scroll listener for the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const allAgreed =
    agreedTerms && agreedPrivacy && agreedRefund && agreedShipping;

  const handleDownload = () => {
    if (!allAgreed) return;

    setDownloadState("downloading");

    // Simulate a brief delay to show the downloading state, then trigger the actual download
    setTimeout(() => {
      try {
        // This is the most reliable way to trigger a file download across browsers
        const link = document.createElement("a");
        link.href = APK_DOWNLOAD_URL;
        link.setAttribute("download", "VeAg.apk"); // Try to force download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // After attempting download, show success, but allow them to retry if it blocked
        setDownloadState("success");
      } catch (err) {
        console.error("Download failed:", err);
        setDownloadState("error");
      }
    }, 2000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const faqs = [
    {
      question: "Which crops are currently supported?",
      answer:
        "VeAg currently supports Rice with highly accurate disease detection. We are continuously training our AI and will be adding support for wheat, corn, and many other crops soon.",
    },
    {
      question: "Is an internet connection required?",
      answer:
        "Yes, an internet connection is required to upload images and receive instant AI analysis from our advanced cloud-based models.",
    },
    {
      question: "How accurate is the AI detection?",
      answer:
        "Our AI models have been trained on vast agricultural datasets and achieve over 95% accuracy in identifying common crop diseases.",
    },
    {
      question: "Is the app available on iOS?",
      answer:
        "Currently, VeAg is exclusively available for Android devices (Android 10 and above).",
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Animated Background Orbs */}
      <div className="ambient-bg-container">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      <header className="top-nav">
        <div className="logo-container">
          <img src="/veag_logo.png" alt="VeAg Logo" className="logo" />
          <span className="brand-name">VeAg</span>
        </div>
        <div className="nav-badges">
          <motion.span
            className="android-badge"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Smartphone className="icon-tiny" /> Only for Android
          </motion.span>
        </div>
      </header>

      <main className="main-content">
        {/* HERO SECTION */}
        <section className="hero-section">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="badge-row">
              <div className="version-badge">Version 4.5</div>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="hero-title">
              Smart farming <br />
              <span className="text-gradient">starts here.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Download the VeAg app — your AI-powered gateway to smarter
              agriculture.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="download-card interactive-card"
              whileHover={{
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
              }}
            >
              <h3 className="card-title">Ready to install?</h3>
              <p className="card-desc">
                Review and accept our policies to begin your secure download.
              </p>

              <div className="agreements-list">
                <label className="checkbox-item group">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                  />
                  <span className="custom-checkbox group-hover:border-primary"></span>
                  <span className="checkbox-label">
                    I agree to the{" "}
                    <a
                      href="https://veag.tech/terms-and-conditions"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Terms & Conditions
                    </a>
                  </span>
                </label>

                <label className="checkbox-item group">
                  <input
                    type="checkbox"
                    checked={agreedPrivacy}
                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  />
                  <span className="custom-checkbox group-hover:border-primary"></span>
                  <span className="checkbox-label">
                    I agree to the{" "}
                    <a
                      href="https://veag.tech/privacy-policy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <label className="checkbox-item group">
                  <input
                    type="checkbox"
                    checked={agreedRefund}
                    onChange={(e) => setAgreedRefund(e.target.checked)}
                  />
                  <span className="custom-checkbox group-hover:border-primary"></span>
                  <span className="checkbox-label">
                    I agree to the{" "}
                    <a
                      href="https://veag.tech/return-refund-cancellation"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Refund Policy
                    </a>
                  </span>
                </label>

                <label className="checkbox-item group">
                  <input
                    type="checkbox"
                    checked={agreedShipping}
                    onChange={(e) => setAgreedShipping(e.target.checked)}
                  />
                  <span className="custom-checkbox group-hover:border-primary"></span>
                  <span className="checkbox-label">
                    I agree to the{" "}
                    <a
                      href="https://veag.tech/shipping-and-delivery"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Shipping Policy
                    </a>
                  </span>
                </label>
              </div>

              <div className="action-area">
                <AnimatePresence mode="wait">
                  {downloadState === "idle" && (
                    <motion.button
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`download-btn ${!allAgreed ? "disabled" : ""}`}
                      onClick={handleDownload}
                      disabled={!allAgreed}
                      whileHover={allAgreed ? { scale: 1.02 } : {}}
                      whileTap={allAgreed ? { scale: 0.98 } : {}}
                    >
                      <Download className="icon" /> Download APK
                    </motion.button>
                  )}

                  {downloadState === "downloading" && (
                    <motion.div
                      key="downloading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="status-box loading"
                    >
                      <RefreshCw className="icon spinning text-primary" />
                      <span>Preparing your download...</span>
                    </motion.div>
                  )}

                  {downloadState === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="status-box success"
                    >
                      <CheckCircle2 className="icon success-icon" />
                      <span>Download initiated!</span>
                      <p className="status-subtext">
                        If your download didn't start automatically:
                      </p>
                      <button className="text-btn" onClick={handleDownload}>
                        Click here to try again
                      </button>
                    </motion.div>
                  )}

                  {downloadState === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="status-box error"
                    >
                      <ShieldCheck className="icon error-icon" />
                      <span>Download failed or was blocked.</span>
                      <button className="retry-btn" onClick={handleDownload}>
                        <RefreshCw className="icon-small" /> Retry Download
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-mockup"
            initial={{ opacity: 0, x: 100, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="android-phone-frame float-animation">
              <div className="punch-hole-camera"></div>

              {!imageLoaded && (
                <div className="image-loader-container">
                  <div className="pulse-loader"></div>
                </div>
              )}

              <motion.img
                src="/mobile_interface.png"
                alt="VeAg Interface"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="phone-glare"></div>
            </div>
          </motion.div>
        </section>

        {/* DIAGNOSIS FEATURES (NEW SECTION) */}
        <section className="info-section">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2>Comprehensive Crop Care</h2>
              <p>
                You don't just get a diagnosis. VeAg provides a complete action
                plan to save your harvest.
              </p>
            </motion.div>

            <div className="diagnosis-grid">
              {[
                {
                  icon: Search,
                  title: "Detailed Causes",
                  desc: "Understand exactly what pathogen or environmental factor is attacking your crops.",
                },
                {
                  icon: ShieldCheck,
                  title: "Prevention Strategies",
                  desc: "Learn proven methods to stop the disease from spreading to healthy plants.",
                },
                {
                  icon: Activity,
                  title: "Treatment Plans",
                  desc: "Step-by-step instructions on how to treat the current infection immediately.",
                },
                {
                  icon: Search,
                  title: "Product Recommendations",
                  desc: "Get highly specific, market-available fungicide and pesticide recommendations.",
                },
                {
                  icon: MessageSquare,
                  title: "AI Disease Chatbot",
                  desc: "Have follow-up questions? Chat directly with our AI assistant about your specific diagnosis.",
                },
                {
                  icon: Leaf,
                  title: "Accurate Disease Identification",
                  desc: "Instantly recognize the exact disease affecting your plants with our state-of-the-art computer vision.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="diag-card interactive-card"
                  whileHover={{ y: -5 }}
                >
                  <div className="diag-icon-wrapper">
                    <item.icon className="diag-icon" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* WHY CHOOSE VEAG */}
        <section className="info-section alternate-bg">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2>Why Choose VeAg?</h2>
              <p>Advanced AI technology meets agricultural expertise</p>
            </motion.div>

            <div className="features-grid">
              <motion.div
                variants={fadeInUp}
                className="feature-card interactive-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon-box">
                  <Zap className="feature-icon" />
                </div>
                <h3>AI-Powered Analysis</h3>
                <p>
                  Our advanced AI model analyzes crop images and identifies
                  diseases with ultra-high accuracy in real-time.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="feature-card interactive-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon-box">
                  <Clock className="feature-icon" />
                </div>
                <h3>Instant Results</h3>
                <p>
                  Stop waiting for manual inspections. Get detailed disease
                  detection reports within seconds.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="feature-card interactive-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon-box">
                  <Leaf className="feature-icon" />
                </div>
                <h3>Multiple Crops</h3>
                <p>
                  Expert support for crucial crops including Rice, with ongoing
                  updates adding more plant varieties constantly.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="feature-card interactive-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="feature-icon-box">
                  <ShieldCheck className="feature-icon" />
                </div>
                <h3>The VeAg Platform</h3>
                <p>
                  VeAg isn't just a scanner—it's a comprehensive agricultural
                  ecosystem built to maximize your harvest and ensure
                  sustainable farming.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS (Install + Usage) */}
        <section className="info-section">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2>How It Works</h2>
              <p>A simple process to protect your entire yield</p>
            </motion.div>

            <div className="timeline-steps">
              {[
                {
                  num: "01",
                  icon: UserPlus,
                  title: "Sign Up",
                  desc: "Create your secure account with Google in seconds.",
                },
                {
                  num: "02",
                  icon: UploadCloud,
                  title: "Upload Images",
                  desc: "Take clear photos of affected plants and upload up to 10 images at once.",
                },
                {
                  num: "03",
                  icon: Cpu,
                  title: "AI Analysis",
                  desc: "Our neural network processes your images against thousands of disease markers.",
                },
                {
                  num: "04",
                  icon: Activity,
                  title: "Get Results",
                  desc: "Receive your comprehensive diagnosis, treatment plan, and product suggestions.",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="timeline-step interactive-card"
                  whileHover={{ x: 10 }}
                >
                  <div className="step-num">{step.num}</div>
                  <div className="step-content">
                    <div className="step-header">
                      <step.icon className="step-icon" />
                      <h3>{step.title}</h3>
                    </div>
                    <p>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* SECURE PAYMENTS (NEW SECTION) */}
        <section className="info-section alternate-bg">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="payment-banner interactive-card"
              whileHover={{ scale: 1.01 }}
            >
              <div className="payment-content">
                <h2>
                  <Shield className="inline-icon" /> Industry Standard Secure
                  Payments
                </h2>
                <p>
                  Your transactions are protected with military-grade 256-bit
                  encryption. We support all major payment gateways for a
                  seamless experience.
                </p>
                <div className="payment-methods">
                  <span className="pay-badge">UPI</span>
                  <span className="pay-badge">Credit Cards</span>
                  <span className="pay-badge">Debit Cards</span>
                  <span className="pay-badge">Net Banking</span>
                  <span className="pay-badge">Wallets</span>
                </div>
              </div>
              <div className="payment-icon-bg">
                <Lock className="bg-lock" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* HOW TO INSTALL (APK) */}
        <section className="info-section">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2>APK Installation Guide</h2>
              <p>
                Follow these steps to get VeAg running on your Android device.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="install-grid">
              {[
                {
                  icon: ArrowDownToLine,
                  title: "1. Download",
                  desc: "Tap the Download APK button above and save the file.",
                },
                {
                  icon: Settings,
                  title: "2. Allow installs",
                  desc: "Go to Settings > Security and enable 'Install unknown apps'.",
                },
                {
                  icon: Smartphone,
                  title: "3. Open the APK",
                  desc: "Find VeAg.apk in your notifications or Downloads and tap it.",
                },
                {
                  icon: PlayCircle,
                  title: "4. Launch",
                  desc: "Open the app and start managing your farm smarter.",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="install-card interactive-card"
                  whileHover={{ y: -5 }}
                >
                  <step.icon className="install-icon" />
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* FAQ SECTION */}
        <section className="info-section alternate-bg">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <div className="icon-wrapper">
                <HelpCircle className="large-icon" />
              </div>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about VeAg</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="faq-list">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className={`faq-item interactive-card ${openFaq === index ? "open" : ""}`}
                  onClick={() => toggleFaq(index)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="faq-question">
                    <h3>{faq.question}</h3>
                    <ChevronDown className="faq-chevron" />
                  </div>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="faq-answer-container"
                      >
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* GET IN TOUCH */}
        <section className="info-section">
          <motion.div
            className="info-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="section-header">
              <h2>Get In Touch</h2>
              <p>Have questions? We're here to help</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="contact-grid">
              <motion.div
                className="contact-card interactive-card"
                whileHover={{ y: -5 }}
              >
                <div className="contact-icon-wrapper">
                  <Mail className="contact-icon" />
                </div>
                <h3>General Inquiries</h3>
                <p>For support and general questions</p>
                <a
                  href="mailto:sarthak@vacantvectors.com"
                  className="contact-link"
                >
                  sarthak@vacantvectors.com
                </a>
              </motion.div>

              <motion.div
                className="contact-card interactive-card"
                whileHover={{ y: -5 }}
              >
                <div className="contact-icon-wrapper">
                  <CreditCard className="contact-icon" />
                </div>
                <h3>Payment Related</h3>
                <p>For billing and subscription queries</p>
                <a
                  href="mailto:sarthak@vacantvectors.com"
                  className="contact-link"
                >
                  sarthak@vacantvectors.com
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="page-footer">
        <p>
          By downloading, you agree to our policies. Available exclusively for
          Android 10+.
        </p>
        <p>&copy; All rights reserved 2026. VeAg Tech.</p>
      </footer>

      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp className="icon" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloadPage;