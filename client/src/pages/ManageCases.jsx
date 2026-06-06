import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import withSubscription from '../components/withSubscription';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, FileText, Loader, Search } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ManageCases = ({ daysRemaining }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      if (!currentUser?.userId) {
        // console.log('No currentUser.userId available yet');
        setLoading(false);
        return;
      }

      try {
        // console.log('Fetching cases for user:', currentUser.userId);
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/cases/user/${currentUser.userId}`);
        // console.log('Cases response:', response.data);
        setCases(response.data.cases || []);
        setError(null);
      } catch (err) {
        // console.error('Error fetching cases:', err);
        setError(err.response?.data?.error || 'Failed to load cases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [currentUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-600/80 border-yellow-400/50 text-white',
      processing: 'bg-blue-600/80 border-blue-400/50 text-white',
      completed: 'bg-green-600/80 border-green-400/50 text-white',
      failed: 'bg-red-600/80 border-red-400/50 text-white'
    };

    const statusLabels = {
      pending: t.status.pending,
      processing: t.status.processing,
      completed: t.status.completed,
      failed: t.status.failed
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-xl ${statusClasses[status] || statusClasses.pending}`}>
        {statusLabels[status] || statusLabels.pending}
      </span>
    );
  };

  const filteredCases = cases
    .filter(c => searchQuery.trim() === '' || String(c.caseId).includes(searchQuery.trim()))
    .sort((a, b) =>
      sortOrder === 'latest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  if (pageLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 flex items-center justify-center z-50">
        <div className="relative w-24 h-24">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 relative overflow-hidden">
      {/* Background Mountains - Fixed Position */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <svg className="w-full h-64" viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 250 L300 100 L500 180 L700 80 L900 140 L1200 60 L1200 300 L0 300 Z" fill="#a0522d" opacity="0.3"/>
          <path d="M0 270 L200 150 L400 200 L600 130 L800 170 L1000 120 L1200 180 L1200 300 L0 300 Z" fill="#d97706" opacity="0.2"/>
        </svg>
      </div>

      {/* Grass Layer */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-green-600 to-green-700 pointer-events-none"></div>

      {/* Animated Clouds */}
      <motion.div 
        className="fixed top-20 left-0 w-32 h-16 bg-white/30 rounded-full blur-xl"
        animate={{ x: [0, 1200] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed top-40 right-0 w-40 h-20 bg-white/30 rounded-full blur-xl"
        animate={{ x: [1200, -200] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* Header */}
      <header className="sticky top-0 bg-black/30 backdrop-blur-2xl border-b border-white/20 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={veagLogo} alt="VeAg" className="w-10 h-10 rounded-full" />
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
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <img 
                  src={currentUser?.photoURL} 
                  alt={currentUser?.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
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
            <h3 className="text-xl font-bold text-white">{t.manageCases.needHelp}</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">
            {t.manageCases.supportText}
          </p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.manageCases.contactSupport}
          </a>
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{t.manageCases.title}</h2>
            <p className="text-white/70">{t.manageCases.subtitle}</p>
          </div>
          <button
            onClick={() => navigate('/register-case')}
            className="px-6 py-2 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
          >
            {t.manageCases.newCase}
          </button>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Case ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 backdrop-blur-2xl border border-white/40 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/70 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder('latest')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm border backdrop-blur-xl transition-colors ${
                sortOrder === 'latest'
                  ? 'bg-white/30 border-white/60 text-white'
                  : 'bg-black/30 border-white/30 text-white/70 hover:bg-white/20'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortOrder('oldest')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm border backdrop-blur-xl transition-colors ${
                sortOrder === 'oldest'
                  ? 'bg-white/30 border-white/60 text-white'
                  : 'bg-black/30 border-white/30 text-white/70 hover:bg-white/20'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {daysRemaining && daysRemaining > 0 && (
          <div className="bg-green-600/80 border border-green-400/50 backdrop-blur-xl rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">
                {t.manageCases.activeSubscription}: {daysRemaining} {t.manageCases.daysRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
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
                <motion.div
                  className="absolute inset-4 border-4 border-transparent border-t-orange-300 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-white font-semibold text-lg">{t.manageCases.loadingCases}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-black/30 backdrop-blur-2xl border border-red-400/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-400/50 flex items-center justify-center backdrop-blur-xl">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
              >
                {t.manageCases.retry}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cases.length === 0 && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">{t.manageCases.noCases}</h3>
              <p className="text-white/70">{t.manageCases.noCasesMessage}</p>
              <button
                onClick={() => navigate('/register-case')}
                className="mt-4 px-8 py-3 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
              >
                {t.manageCases.registerFirst} {t.manageCases.registerCase}
              </button>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && cases.length > 0 && filteredCases.length === 0 && (
          <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-12 text-center shadow-2xl mb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-xl">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <p className="text-white font-semibold text-lg">No cases found for Case ID &quot;{searchQuery}&quot;</p>
            </div>
          </div>
        )}

        {/* Cases Grid */}
        {!loading && !error && filteredCases.length > 0 && (
          <>
            {/* Cases Summary */}
              <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">{t.manageCases.summary}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{filteredCases.length}</p>
                    <p className="text-sm text-white/70">{t.manageCases.totalCases}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">
                      {filteredCases.filter(c => c.status === 'pending').length}
                    </p>
                    <p className="text-sm text-white/70">{t.status.pending}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">
                      {filteredCases.filter(c => c.status === 'processing').length}
                    </p>
                    <p className="text-sm text-white/70">{t.status.processing}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">
                      {filteredCases.filter(c => c.status === 'completed').length}
                    </p>
                    <p className="text-sm text-white/70">{t.status.completed}</p>
                  </div>
                </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCases.map((caseItem) => (
                <motion.div
                  key={caseItem._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl overflow-hidden hover:border-white/60 transition-all cursor-pointer group shadow-2xl"
                  onClick={() => navigate(`/case/${caseItem.caseId}`)}
                >
                  {/* Case Image */}
                  <div className="relative h-48 bg-black/20 overflow-hidden">
                    {caseItem.images && caseItem.images.length > 0 ? (
                      <img
                        src={caseItem.images[0].url}
                        alt={`${caseItem.cropName} case`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <FileText className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {/* Image Count Badge */}
                    {caseItem.images && caseItem.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xl text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/30">
                        {caseItem.images.length} {t.caseDetail.photos}
                      </div>
                    )}
                  </div>

                  {/* Case Details */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Case #{caseItem.caseId}
                        </h3>
                        <p className="text-sm text-white/70">{formatDate(caseItem.createdAt)}</p>
                      </div>
                      {getStatusBadge(caseItem.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                        <span className="font-semibold text-white">
                          {caseItem.cropName
                            ? caseItem.cropName.charAt(0).toUpperCase() + caseItem.cropName.slice(1)
                            : ""}
                        </span>

                      </div>
                      {caseItem.diseaseObservation && (
                        <p className="text-sm text-white/70">
                          {caseItem.diseaseObservation
                            .split(" ")
                            .slice(0, 5)
                            .join(" ") + "..."}
                        </p>
                      )}
                    </div>
                    <button className="w-full px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl">
                      {t.manageCases.viewDetails}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            
          </>
        )}
      </div>
    </div>
  );
};

export default withSubscription(ManageCases);
