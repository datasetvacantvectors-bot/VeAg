import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, CreditCard, Calendar, History, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function ManageSubscription() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  // State for subscription data
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // State for purchase
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for history
  const [transactions, setTransactions] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingSubStatus, setLoadingSubStatus] = useState(true);
  const [loadingPlanHistory, setLoadingPlanHistory] = useState(true);
  
  // Pagination State
  const [transactionPage, setTransactionPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  
  // UI State
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [navImageLoaded, setNavImageLoaded] = useState(false);
  const [navImageError, setNavImageError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // Payment notification state
  const [paymentNotification, setPaymentNotification] = useState({
    show: false,
    type: '', // 'success', 'failed', 'cancelled'
    message: '',
    details: null
  });

  // Plan configuration
  const PLAN = {
    name: 'Premium Plan',
    basePrice: 10,
    discount: 10,
    finalPrice: 9,
    maxMonths: 12,
    minMonths: 1
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch subscription data
  useEffect(() => {
    if (currentUser) {
      fetchActiveSubscription();
      fetchTransactionHistory();
      fetchSubscriptionHistory();
    }
  }, [currentUser]);
  
  // Page loading
  useEffect(() => {
    setTimeout(() => setPageLoading(false), 800);
  }, []);

  const fetchActiveSubscription = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/${currentUser.userId}/active`);
      setHasActivePlan(response.data.hasActivePlan);
      setActiveSubscription(response.data.subscription);
      setDaysRemaining(response.data.subscription?.daysRemaining || 0);
    } catch (error) {
      // console.error('Error fetching active subscription:', error);
    } finally {
      setLoadingSubStatus(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/${currentUser.userId}/transactions`);
      setTransactions(response.data.transactions);
    } catch (error) {
      // console.error('Error fetching transactions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/${currentUser.userId}/history`);
      setSubscriptionHistory(response.data.subscriptions);
    } catch (error) {
      // console.error('Error fetching subscription history:', error);
    } finally {
      setLoadingPlanHistory(false);
    }
  };

  const calculateTotal = () => {
    return PLAN.finalPrice * selectedMonths;
  };

  const handlePurchase = async () => {
    if (selectedMonths < PLAN.minMonths || selectedMonths > PLAN.maxMonths) {
      alert(`Please select between ${PLAN.minMonths} to ${PLAN.maxMonths} months`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderResponse = await axios.post(`${API_BASE_URL}/subscriptions/create-order`, {
        userId: currentUser.userId,
        userEmail: currentUser.email,
        months: selectedMonths
      });

      const { orderId, amount, currency, key } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key,
        amount,
        currency,
        name: 'VeAg',
        description: `${PLAN.name} - ${selectedMonths} Month${selectedMonths > 1 ? 's' : ''}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post(`${API_BASE_URL}/subscriptions/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: currentUser.userId
            });

            if (verifyResponse.data.success) {
              setPaymentNotification({
                show: true,
                type: 'success',
                message: t.manageSubscription.paymentSuccessful,
                details: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  months: selectedMonths,
                  amount: amount / 100
                }
              });
              // Refresh data
              fetchActiveSubscription();
              fetchTransactionHistory();
              fetchSubscriptionHistory();
              setSelectedMonths(1);
            }
          } catch (error) {
            // console.error('Payment verification failed:', error);
            setPaymentNotification({
              show: true,
              type: 'failed',
              message: t.manageSubscription.paymentVerificationFailed,
              details: {
                error: t.manageSubscription.errorVerifyPayment,
                orderId: response.razorpay_order_id
              }
            });
            fetchTransactionHistory();
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: async () => {
            // Handle payment cancellation
            try {
              await axios.post(`${API_BASE_URL}/subscriptions/payment-failure`, {
                razorpay_order_id: orderId,
                error: { description: 'Payment cancelled by user' }
              });
              fetchTransactionHistory();
            } catch (err) {
              // console.error('Error logging cancellation:', err);
            }
            setPaymentNotification({
              show: true,
              type: 'cancelled',
              message: t.manageSubscription.paymentCancelled,
              details: {
                info: t.manageSubscription.infoCancelledPayment,
                orderId: orderId
              }
            });
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      // console.error('Error initiating payment:', error);
      setPaymentNotification({
        show: true,
        type: 'failed',
        message: t.manageSubscription.failedToInitiatePayment,
        details: {
          error: error.response?.data?.message || t.manageSubscription.errorStartPayment,
          info: t.manageSubscription.errorCheckConnection
        }
      });
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-100 border-green-400/50';
      case 'failed':
        return 'bg-red-500/20 text-red-100 border-red-400/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-100 border-yellow-400/50';
      case 'created':
        return 'bg-red-900/20 text-red-300 border-red-700/40';
      default:
        return 'bg-white/10 text-white/70 border-white/30';
    }
  };

  // Transaction Pagination
  const transactionsPerPage = 5;
  const indexOfLastTransaction = transactionPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalTransactionPages = Math.ceil(transactions.length / transactionsPerPage);

  // Plan History Pagination
  const planHistoryPerPage = 10;
  const indexOfLastPlan = historyPage * planHistoryPerPage;
  const indexOfFirstPlan = indexOfLastPlan - planHistoryPerPage;
  const currentPlanHistory = subscriptionHistory.slice(indexOfFirstPlan, indexOfLastPlan);
  const totalPlanPages = Math.ceil(subscriptionHistory.length / planHistoryPerPage);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 flex items-center justify-center relative overflow-hidden">
        {/* Mountains */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#a0522d" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#d97706" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
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
          <p className="mt-6 text-white text-lg font-semibold">{t.manageSubscription.loadingSubscription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden">
      {/* Mountains */}
      <svg className="fixed bottom-0 w-full z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#a0522d" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        <path fill="#d97706" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
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
      <header className="relative z-20 bg-black/30 backdrop-blur-2xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white/20 backdrop-blur-xl flex items-center justify-center">
              {!logoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="relative w-6 h-6">
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-0.5 border-2 border-transparent border-t-orange-400 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              )}
              <img 
                src={veagLogo} 
                alt="VeAg Logo" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLogoLoaded(true)}
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
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white/20 backdrop-blur-xl flex items-center justify-center">
              {currentUser?.photoURL && !navImageError ? (
                <>
                  {!navImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="relative w-5 h-5">
                        <motion.div
                          className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute inset-0.5 border-2 border-transparent border-t-orange-400 rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.name}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${navImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setNavImageLoaded(true)}
                    onError={() => setNavImageError(true)}
                  />
                </>
              ) : (
                <span className="text-white font-bold text-lg">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Support Popup */}
      {showSupport && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-6 z-50 bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl w-80"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{t.manageSubscription.needHelp}</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">
            {t.manageSubscription.helpText}
          </p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.manageSubscription.contactSupport}
          </a>
        </motion.div>
      )}

      {/* Payment Notification Popup */}
      {paymentNotification.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPaymentNotification({ show: false, type: '', message: '', details: null })}
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className={`bg-black/40 backdrop-blur-2xl border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 ${
              paymentNotification.type === 'success' ? 'border-green-400/50' :
              paymentNotification.type === 'cancelled' ? 'border-yellow-400/50' :
              'border-red-400/50'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {paymentNotification.type === 'success' ? (
                <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-400/50 flex items-center justify-center backdrop-blur-xl">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              ) : paymentNotification.type === 'cancelled' ? (
                <div className="w-20 h-20 rounded-full bg-yellow-600/20 border-2 border-yellow-400/50 flex items-center justify-center backdrop-blur-xl">
                  <XCircle className="w-12 h-12 text-yellow-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-400/50 flex items-center justify-center backdrop-blur-xl">
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
              )}
            </div>

            {/* Message */}
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              {paymentNotification.message}
            </h3>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {paymentNotification.type === 'success' && paymentNotification.details && (
                <>
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.manageSubscription.paymentId}</p>
                    <p className="text-white font-mono text-xs break-all">{paymentNotification.details.paymentId}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.manageSubscription.orderId}</p>
                    <p className="text-white font-mono text-xs break-all">{paymentNotification.details.orderId}</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-600/20 backdrop-blur-xl rounded-lg p-4 border border-green-400/30">
                      <p className="text-white/70 text-sm mb-1">{t.manageSubscription.duration}</p>
                      <p className="text-white font-bold">{paymentNotification.details.months} {paymentNotification.details.months > 1 ? t.manageSubscription.monthPlural : t.manageSubscription.month}</p>
                    </div>
                    <div className="flex-1 bg-green-600/20 backdrop-blur-xl rounded-lg p-4 border border-green-400/30">
                      <p className="text-white/70 text-sm mb-1">{t.manageSubscription.amount}</p>
                      <p className="text-green-400 font-bold">₹{paymentNotification.details.amount}</p>
                    </div>
                  </div>
                  <div className="bg-green-600/10 backdrop-blur-xl rounded-lg p-3 border border-green-400/20">
                    <p className="text-green-400 text-sm text-center">
                      {t.manageSubscription.subscriptionActivated}
                    </p>
                  </div>
                </>
              )}

              {paymentNotification.type === 'cancelled' && paymentNotification.details && (
                <>
                  <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
                    <p className="text-white/70 text-sm mb-1">{t.manageSubscription.orderId}</p>
                    <p className="text-white font-mono text-xs break-all">{paymentNotification.details.orderId}</p>
                  </div>
                  <div className="bg-yellow-600/10 backdrop-blur-xl rounded-lg p-3 border border-yellow-400/20">
                    <p className="text-yellow-400 text-sm text-center">
                      {paymentNotification.details.info}
                    </p>
                  </div>
                  <p className="text-white/70 text-sm text-center">
                    {t.manageSubscription.noChargesMade}
                  </p>
                </>
              )}

              {paymentNotification.type === 'failed' && paymentNotification.details && (
                <>
                  {paymentNotification.details.orderId && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
                      <p className="text-white/70 text-sm mb-1">{t.manageSubscription.orderId}</p>
                      <p className="text-white font-mono text-xs break-all">{paymentNotification.details.orderId}</p>
                    </div>
                  )}
                  <div className="bg-red-600/10 backdrop-blur-xl rounded-lg p-3 border border-red-400/20">
                    <p className="text-red-400 text-sm">
                      {paymentNotification.details.error}
                    </p>
                  </div>
                  {paymentNotification.details.info && (
                    <p className="text-white/70 text-sm text-center">
                      {paymentNotification.details.info}
                    </p>
                  )}
                  <p className="text-white/70 text-sm text-center">
                    {t.manageSubscription.amountRefund}
                  </p>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setPaymentNotification({ show: false, type: '', message: '', details: null })}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors backdrop-blur-xl ${
                paymentNotification.type === 'success' 
                  ? 'bg-green-600/80 hover:bg-green-600 border border-green-400/50' 
                  : paymentNotification.type === 'cancelled'
                  ? 'bg-white/20 hover:bg-white/30 border border-white/40'
                  : 'bg-white/20 hover:bg-white/30 border border-white/40'
              }`}
            >
              {paymentNotification.type === 'success' ? t.manageSubscription.continue : t.manageSubscription.close}
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Button */}
        {/* <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-veag-green hover:text-veag-dark-green font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button> */}

        {/* Subscription Days Banner - Only show if active */}
        {hasActivePlan && daysRemaining > 0 && (
          <div className="bg-green-600/80 backdrop-blur-xl text-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-lg border border-green-400/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t.manageSubscription.activePremiumSubscription}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <div className="text-sm opacity-90">{t.manageSubscription.daysRemaining}</div>
            </div>
          </div>
        )}

        {/* Active Subscription Status */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              {t.manageSubscription.currentSubscriptionStatus}
            </h2>
            <button
              onClick={() => {
                setLoadingSubStatus(true);
                fetchActiveSubscription();
              }}
              disabled={loadingSubStatus}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors backdrop-blur-xl w-full md:w-auto ${
                loadingSubStatus
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
              }`}
            >
              <motion.div
                animate={loadingSubStatus ? { rotate: 360 } : {}}
                transition={loadingSubStatus ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw className="h-5 w-5" />
              </motion.div>
              {loadingSubStatus ? t.manageSubscription.refreshing || 'Refreshing...' : t.manageSubscription.refresh || 'Refresh'}
            </button>
          </div>
          {loadingSubStatus ? (
             <div className="text-center py-8">
               <div className="relative w-16 h-16 mx-auto">
                 <motion.div
                   className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 />
                 <motion.div
                   className="absolute inset-2 border-4 border-transparent border-t-green-400 rounded-full"
                   animate={{ rotate: -360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
               </div>
             </div>
          ) : hasActivePlan && daysRemaining > 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{PLAN.name}</h3>
                  <p className="text-white/70">{t.manageSubscription.activeSubscription}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{daysRemaining}</div>
                  <div className="text-sm text-white/70">{t.manageSubscription.daysRemaining}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white font-semibold">{t.manageSubscription.startDate}:</span>
                  <span className="ml-2 text-white/70">{formatDate(activeSubscription.startDate)}</span>
                </div>
                <div>
                  <span className="text-white font-semibold">{t.manageSubscription.endDate}:</span>
                  <span className="ml-2 text-white/70">{formatDate(activeSubscription.endDate)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 text-center border border-white/30">
              <div className="text-white/40 mb-2">
                <XCircle className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-white mb-2">{t.manageSubscription.noActiveSubscription}</p>
              <p className="text-sm text-white/70">{t.manageSubscription.purchasePlanToStart}</p>
            </div>
          )}
        </div>

        {/* Purchase Plan */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {hasActivePlan ? t.manageSubscription.extendYourPlan : t.manageSubscription.purchasePremiumPlan}
          </h2>
          
          <div className="bg-gradient-to-br from-green-600/80 to-green-700/80 backdrop-blur-xl rounded-lg p-6 mb-6 border border-green-400/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{PLAN.name}</h3>
                <p className="text-white/90">{t.manageSubscription.unlimitedAccess}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 line-through">₹{PLAN.basePrice}/month</div>
                <div className="text-2xl font-bold text-white">₹{PLAN.finalPrice}/month</div>
                <div className="text-xs text-white/90 bg-white/20 px-2 py-1 rounded-full inline-block">{PLAN.discount}% OFF</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              {t.manageSubscription.selectDuration}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={PLAN.minMonths}
                max={PLAN.maxMonths}
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(Math.max(PLAN.minMonths, Math.min(PLAN.maxMonths, parseInt(e.target.value) || PLAN.minMonths)))}
                className="w-32 px-4 py-2 bg-white/10 border-2 border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-xl"
              />
              <div className="flex-1 text-right">
                <div className="text-sm text-white/70">{t.manageSubscription.totalAmount}</div>
                <div className="text-3xl font-bold text-green-400">₹{calculateTotal()}</div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors backdrop-blur-xl ${
              isProcessing
                ? 'bg-white/10 cursor-not-allowed border border-white/20'
                : 'bg-green-600/80 hover:bg-green-600 border border-green-400/50'
            }`}
          >
            {isProcessing ? t.manageSubscription.processing : hasActivePlan ? t.manageSubscription.extendPlan : t.manageSubscription.purchasePlan}
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6" />
              {t.manageSubscription.transactionHistory}
            </h2>
            <button
              onClick={() => {
                setLoadingHistory(true);
                fetchTransactionHistory();
              }}
              disabled={loadingHistory}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors backdrop-blur-xl w-full md:w-auto ${
                loadingHistory
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
              }`}
            >
              <motion.div
                animate={loadingHistory ? { rotate: 360 } : {}}
                transition={loadingHistory ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw className="h-5 w-5" />
              </motion.div>
              {loadingHistory ? t.manageSubscription.refreshing : t.manageSubscription.refresh}
            </button>
          </div>
          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto">
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 border-4 border-transparent border-t-green-400 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10 backdrop-blur-xl">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.dateTime}</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.orderId}</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.transactionId}</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.months}</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.amount}</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">{t.manageSubscription.paymentStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-white/90">{formatDate(transaction.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/70">{transaction.orderId}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/70">
                        {transaction.razorpayPaymentId || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/90">{transaction.monthsPurchased}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-400">₹{transaction.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(transaction.status)}`}>
                          {transaction.status === 'created' ? 'FAILED' : transaction.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalTransactionPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                    disabled={transactionPage === 1}
                    className={`p-2 rounded-lg border backdrop-blur-xl transition-colors ${
                      transactionPage === 1 
                        ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white/80 text-sm font-medium px-4">
                    {t.manageSubscription.page} {transactionPage} {t.manageSubscription.of} {totalTransactionPages}
                  </span>
                  <button
                    onClick={() => setTransactionPage(p => Math.min(totalTransactionPages, p + 1))}
                    disabled={transactionPage === totalTransactionPages}
                    className={`p-2 rounded-lg border backdrop-blur-xl transition-colors ${
                      transactionPage === totalTransactionPages 
                        ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-white/70">
              {t.manageSubscription.noTransactions}
            </div>
          )}
        </div>

        {/* Plan History Timeline */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6" />
              {t.manageSubscription.planHistory}
            </h2>
            <button
              onClick={() => {
                setLoadingPlanHistory(true);
                fetchSubscriptionHistory();
              }}
              disabled={loadingPlanHistory}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors backdrop-blur-xl w-full md:w-auto ${
                loadingPlanHistory
                  ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/40'
              }`}
            >
              <motion.div
                animate={loadingPlanHistory ? { rotate: 360 } : {}}
                transition={loadingPlanHistory ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw className="h-5 w-5" />
              </motion.div>
              {loadingPlanHistory ? t.manageSubscription.refreshing || 'Refreshing...' : t.manageSubscription.refresh || 'Refresh'}
            </button>
          </div>
          {loadingPlanHistory ? (
             <div className="text-center py-8">
               <div className="relative w-16 h-16 mx-auto">
                 <motion.div
                   className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 />
                 <motion.div
                   className="absolute inset-2 border-4 border-transparent border-t-green-400 rounded-full"
                   animate={{ rotate: -360 }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
               </div>
             </div>
          ) : subscriptionHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-400"></div>
              
              <div className="space-y-6">
                {currentPlanHistory.map((sub, index) => (
                  <div key={sub._id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-4 ${
                      sub.isActive ? 'bg-green-400 border-green-400' : 'bg-white/20 border-green-400'
                    }`}></div>
                    
                    {/* Content card */}
                    <div className={`rounded-lg p-4 backdrop-blur-xl ${
                      sub.isActive ? 'bg-green-600/20 border-2 border-green-400/50' : 'bg-white/5 border border-white/20'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white flex items-center gap-2">
                            {sub.purchaseType === 'new' ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                {t.manageSubscription.newPlanPurchased}
                              </>
                            ) : (
                              <>
                                <Calendar className="w-5 h-5 text-orange-400" />
                                {t.manageSubscription.planExtended}
                              </>
                            )}
                          </h3>
                          <p className="text-sm text-white/70">{formatDate(sub.createdAt)}</p>
                        </div>
                        {sub.isActive && !sub.isExpired && (
                          <span className="px-3 py-1 bg-green-600/80 text-white text-xs font-semibold rounded-full border border-green-400/50">
                            {t.manageSubscription.active.toUpperCase()}
                          </span>
                        )}
                        {sub.isExpired && (
                          <span className="px-3 py-1 bg-white/10 text-white/70 text-xs font-semibold rounded-full border border-white/30">
                            {t.manageSubscription.expired}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-white/70">{t.manageSubscription.duration}:</span>
                          <span className="ml-2 font-semibold text-white">{sub.monthsPurchased} {sub.monthsPurchased > 1 ? t.manageSubscription.monthPlural : t.manageSubscription.month}</span>
                        </div>
                        <div>
                          <span className="text-white/70">{t.manageSubscription.amount}:</span>
                          <span className="ml-2 font-semibold text-green-400">₹{sub.amountPaid}</span>
                        </div>
                        <div>
                          <span className="text-white/70">{t.manageSubscription.start}:</span>
                          <span className="ml-2 text-white/90">{new Date(sub.startDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-white/70">{t.manageSubscription.end}:</span>
                          <span className="ml-2 text-white/90">{new Date(sub.endDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      {sub.isActive && !sub.isExpired && (
                        <div className="mt-2 pt-2 border-t border-veag-green">
                          <span className="text-sm font-semibold text-white">
                            {sub.daysRemaining} {t.manageSubscription.daysRemainingLower}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPlanPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    className={`p-2 rounded-lg border backdrop-blur-xl transition-colors ${
                      historyPage === 1 
                        ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white/80 text-sm font-medium px-4">
                    {t.manageSubscription.page} {historyPage} {t.manageSubscription.of} {totalPlanPages}
                  </span>
                  <button
                    onClick={() => setHistoryPage(p => Math.min(totalPlanPages, p + 1))}
                    disabled={historyPage === totalPlanPages}
                    className={`p-2 rounded-lg border backdrop-blur-xl transition-colors ${
                      historyPage === totalPlanPages 
                        ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-white/40 mb-4">
                <History className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-white mb-2">{t.manageSubscription.noPlanHistory}</p>
              <p className="text-sm text-white/70">{t.manageSubscription.purchaseFirstPlan}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageSubscription;
