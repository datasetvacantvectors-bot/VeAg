import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, RefreshCw, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserName } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [name, setName] = useState(currentUser?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nameHistory, setNameHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const historyRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (historyRef.current) {
      const yOffset = -100;
      const y = historyRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage]);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [navImageLoaded, setNavImageLoaded] = useState(false);
  const [navImageError, setNavImageError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchNameHistory(currentPage);
    // Simulate page load
    setTimeout(() => setPageLoading(false), 800);
  }, []);

  useEffect(() => {
    setProfileImageLoaded(false);
    setProfileImageError(false);
    setNavImageLoaded(false);
    setNavImageError(false);
  }, [currentUser?.photoURL]);

  const fetchNameHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${currentUser.userId}/name-history?page=${page}&limit=5`
      );
      setNameHistory(response.data.history || []);
      setCurrentPage(response.data.currentPage || page);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      // console.error('Error fetching name history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchNameHistory(p);
  };

  const getPageNumbers = (maxVisible = 5) => {
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (name.trim() === currentUser?.name) {
      setMessage(t.editProfile.noChanges || 'No changes made');
      return;
    }

    if (name.trim().length < 2) {
      setMessage(t.editProfile.nameTooShort || 'Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${currentUser.userId}`,
        { name: name.trim() }
      );

      // Update name in context
      if (updateUserName) {
        updateUserName(name.trim());
      }

      setMessage(t.editProfile.profileUpdated);
      setIsEditing(false);
      
      // Refresh name history
      fetchNameHistory(1);
    } catch (error) {
      // console.error('Error updating name:', error);
      setMessage('Failed to update name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || '');
    setIsEditing(false);
    setMessage('');
  };

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
          <p className="mt-6 text-white text-lg font-semibold">{t.editProfile.loadingProfile}</p>
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
      <header className="relative z-10 bg-black/30 backdrop-blur-2xl border-b border-white/20">
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
                <span className="text-white font-bold text-lg">{currentUser?.name?.charAt(0).toUpperCase()}</span>
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
            <h3 className="text-xl font-bold text-white">{t.editProfile.needHelp}</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">
            {t.editProfile.supportText}
          </p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.editProfile.contactSupport}
          </a>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-2xl p-8 rounded-2xl shadow-xl border border-white/40">
          {/* <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-veag-green hover:text-veag-dark-green flex items-center gap-2"
          >
            ← Back to Dashboard
          </button> */}
          <h2 className="text-3xl font-bold text-white mb-6">{t.editProfile.title}</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded-lg border ${message.includes('success') ? 'bg-green-500/20 border-green-400/50 text-green-100' : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-100'}`}>
              {message}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              {currentUser?.photoURL && !profileImageError ? (
                <div className="relative w-32 h-32">
                  {!profileImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-full border border-white/30">
                      <div className="relative w-16 h-16">
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
                      </div>
                    </div>
                  )}
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className={`w-32 h-32 rounded-full border-4 border-white object-cover transition-opacity duration-200 ${profileImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setProfileImageLoaded(true)}
                    onError={() => setProfileImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <span className="text-white font-bold text-5xl">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleUpdateName}>
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t.editProfile.name}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || loading}
                    className="flex-1 min-w-0 w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex-1 sm:flex-none whitespace-nowrap px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 backdrop-blur-xl"
                      >
                        {t.editProfile.edit}
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 sm:flex-none whitespace-nowrap px-6 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-xl border border-white/40"
                        >
                          {loading ? t.editProfile.saving : t.editProfile.save}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={loading}
                          className="flex-1 sm:flex-none whitespace-nowrap px-6 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 backdrop-blur-xl border border-white/30"
                        >
                          {t.editProfile.cancel}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">{t.editProfile.email}</label>
              <input 
                type="email" 
                value={currentUser?.email || ''} 
                readOnly
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white/70"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">{t.editProfile.userId}</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={currentUser?.userId || ''} 
                  readOnly
                  className="flex-1 min-w-0 w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white/70"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser?.userId || '');
                    setMessage(t.editProfile.copied || 'User ID copied to clipboard!');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 backdrop-blur-xl flex items-center justify-center gap-2"
                  title={t.editProfile.copyUserId || "Copy User ID"}
                >
                  <Copy className="w-5 h-5" />
                  <span className="sm:hidden">{t.editProfile.copyUserId || "Copy User ID"}</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8" ref={historyRef}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-xl font-semibold text-white">{t.editProfile.nameHistory || 'Name History'}</h3>
                <button
                  onClick={() => fetchNameHistory(currentPage)}
                  disabled={historyLoading}
                  className="px-4 py-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20 disabled:opacity-50 w-full sm:w-auto"
                  title={t.editProfile.refresh || "Refresh"}
                >
                  <RefreshCw className={`w-4 h-4 text-white ${historyLoading ? 'animate-spin' : ''}`} />
                  <span className="text-white text-sm font-medium">
                    {historyLoading 
                      ? t.editProfile.refreshing || 'Refreshing...' 
                      : t.editProfile.refresh || 'Refresh'}
                  </span>
                </button>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="relative w-12 h-12">
                    <motion.div
                      className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-1 border-4 border-transparent border-t-orange-400 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-2 border-4 border-transparent border-t-green-600 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              ) : nameHistory.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {nameHistory.map((history, index) => (
                      <div key={index} className="p-4 bg-white/10 backdrop-blur-xl rounded-lg border border-white/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-white/90">
                              <span className="font-medium">{t.editProfile.from || 'From'}:</span> {history.oldName}
                            </p>
                            <p className="text-sm text-white/90">
                              <span className="font-medium">{t.editProfile.to || 'To'}:</span> {history.newName}
                            </p>
                          </div>
                          <p className="text-xs text-white/70">
                            {new Date(history.changedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center gap-2">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors border ${
                          currentPage === 1
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                        }`}
                        title="First page"
                      >
                        <span className="font-bold text-xs">{'<<'}</span>
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors border ${
                          currentPage === 1
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                        }`}
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {getPageNumbers(5).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors border ${
                            page === currentPage
                              ? 'bg-white text-orange-600 border-white'
                              : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors border ${
                          currentPage === totalPages
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                        }`}
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors border ${
                          currentPage === totalPages
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                        }`}
                        title="Last page"
                      >
                        <span className="font-bold text-xs">{'>>'}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 bg-white/5 backdrop-blur-xl rounded-lg border border-white/20 text-center">
                  <p className="text-white/70">{t.editProfile.noNameHistory || 'No name history found.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
