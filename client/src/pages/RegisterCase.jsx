import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, Upload, X, CheckCircle, XCircle, Loader, Camera } from 'lucide-react';
import veagLogo from '../assets/veag_logo.svg';
import withSubscription from '../components/withSubscription';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const RegisterCase = ({ daysRemaining }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  // Form state
  const [selectedCrop, setSelectedCrop] = useState('');
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [symptomDescription, setSymptomDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [createdCase, setCreatedCase] = useState(null);
  
  // UI State
  const [showSupport, setShowSupport] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [navImageLoaded, setNavImageLoaded] = useState(false);
  const [navImageError, setNavImageError] = useState(false);

  useEffect(() => {
    setNavImageLoaded(false);
    setNavImageError(false);
  }, [currentUser?.photoURL]);

  // console.log('RegisterCase - daysRemaining:', daysRemaining);

  // Page loading
  useEffect(() => {
    setTimeout(() => setPageLoading(false), 800);
  }, []);

  // Fetch crops from backend
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/crops`);
        setCrops(response.data.crops);
      } catch (error) {
        // console.error('Error fetching crops:', error);
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding new images would exceed the limit
    if (uploadedImages.length + files.length > 10) {
      alert(t.registerCase.maxImagesAlert);
      return;
    }
    
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setUploadedImages(prev => [...prev, ...imageUrls]);
  };

  const handleAddImageClick = () => {
    setShowCaptureModal(true);
  };

  const handleUploadFiles = () => {
    setShowCaptureModal(false);
    fileInputRef.current?.click();
  };

  const handleCaptureNow = async () => {
    setShowCaptureModal(false);
    setIsCapturing(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      // console.error('Error accessing camera:', error);
      alert(t.registerCase.cameraError);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setUploadedImages(prev => [...prev, imageUrl]);
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Convert image URL to base64
  const convertToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const handleSubmit = async () => {
    if (!selectedCrop || uploadedImages.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setProgressMessage('Preparing images...');
    setSubmissionError('');

    try {
      // Convert all images to base64
      setProgressMessage('Converting images...');
      const base64Images = [];
      for (let i = 0; i < uploadedImages.length; i++) {
        setUploadProgress(((i + 1) / uploadedImages.length) * 30);
        const base64 = await convertToBase64(uploadedImages[i]);
        base64Images.push(base64);
      }

      // Submit to backend
      setProgressMessage(t.registerCase.uploadingCloud);
      setUploadProgress(40);

      const response = await axios.post(`${API_BASE_URL}/cases`, {
        userId: currentUser.userId,
        cropName: selectedCrop,
        diseaseObservation: symptomDescription,
        images: base64Images
      });

      setUploadProgress(100);
      setProgressMessage(t.registerCase.caseCreated);
      
      if (response.data.success) {
        setCreatedCase(response.data.case);
        setSubmissionSuccess(true);
      } else {
        throw new Error(response.data.error || 'Failed to create case');
      }
    } catch (error) {
      // console.error('Error submitting case:', error);
      setSubmissionError(error.response?.data?.error || error.message || 'Failed to create case. Please try again.');
      setUploadProgress(0);
      setProgressMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedCrop('');
    setSymptomDescription('');
    setUploadedImages([]);
    setSubmissionSuccess(false);
    setSubmissionError('');
    setCreatedCase(null);
    setUploadProgress(0);
    setProgressMessage('');
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
          <p className="mt-6 text-white text-lg font-semibold">{t.loading}</p>
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
          className="fixed top-20 right-6 z-[10000] bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl w-80"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{t.registerCase.needHelp}</h3>
            <button
              onClick={() => setShowSupport(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-white/90 mb-4">
            {t.registerCase.supportText}
          </p>
          <a
            href="mailto:sarthak@vacantvectors.com"
            className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
          >
            {t.registerCase.contactSupport}
          </a>
        </motion.div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* Subscription Status Banner */}
        {daysRemaining && daysRemaining > 0 && (
          <div className="bg-green-600/80 backdrop-blur-xl text-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-lg border border-green-400/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t.registerCase.activeSubscription}: {daysRemaining} {t.registerCase.daysRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Register Case Form */}
        <div className="bg-black/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">{t.registerCase.title}</h2>
          
          {/* Crop Selection Dropdown */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3 text-lg">
              {t.registerCase.selectCrop} <span className="text-red-400">*</span>
            </label>
            {loadingCrops ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg">
                <div className="relative w-5 h-5">
                  <motion.div
                    className="absolute inset-0 border-3 border-transparent border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <span className="text-white/70">{t.registerCase.loadingCrops}</span>
              </div>
            ) : (
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg text-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                required
              >
                <option value="" className="bg-gray-800">-- {t.registerCase.chooseCrop} --</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop.name} className="bg-gray-800">
                    {crop.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Form Section - Only show if crop is selected */}
          {selectedCrop && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Image Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="text-lg font-semibold text-white self-start">
                    {t.registerCase.uploadImages} <span className="text-red-400">*</span>
                    <span className="text-sm text-white/70 ml-2">({uploadedImages.length}/10)</span>
                  </h3>
                  
                  {/* Horizontal Scrollable Image Previews */}
                  <div className="w-full overflow-x-auto flex space-x-2 py-2">
                    {uploadedImages.length > 0 ? uploadedImages.map((src, index) => (
                      <div key={index} className="relative flex-shrink-0 w-20 h-20 border-2 border-white/40 rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center group">
                        <img src={src} alt={`preview ${index}`} className="h-full w-full object-cover rounded-md" />
                        {/* Delete button on hover */}
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 backdrop-blur-xl"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )) : (
                      <div className="flex justify-center gap-2 w-full">
                        {Array(3).fill(null).map((_, index) => (
                          <div key={index} className="w-20 h-20 border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center">
                            <span className="text-white/50 text-xs">{t.registerCase.empty}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                
                  <button
                    type="button"
                    onClick={handleAddImageClick}
                    disabled={uploadedImages.length >= 10}
                    className="w-full h-48 border-2 border-white/40 rounded-lg flex flex-col items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-12 w-12" />
                    <span className="mt-2 text-lg font-semibold">{t.registerCase.addPhotos}</span>
                    <span className="text-sm text-white/70 mt-1">{t.registerCase.maxImages}</span>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploadedImages.length >= 10}
                  />
                </div>

                {/* Right Column: Symptom Description */}
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {t.registerCase.diseaseObservation}
                  </h3>
                  <textarea
                    value={symptomDescription}
                    onChange={(e) => setSymptomDescription(e.target.value)}
                    placeholder={t.registerCase.observationPlaceholder}
                    className="w-full flex-grow px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    rows="10"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedCrop || uploadedImages.length === 0}
                  className={`px-10 py-3 font-bold text-lg rounded-lg transition-colors backdrop-blur-xl ${
                    selectedCrop && uploadedImages.length > 0
                      ? 'bg-green-600/80 text-white hover:bg-green-600 border border-green-400/50'
                      : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
                  }`}
                >
                  {t.registerCase.submitCase}
                </button>
              </div>
            </>
          )}

          {/* Message when no crop selected */}
          {!selectedCrop && !loadingCrops && (
            <div className="text-center py-12 text-white/70">
              <p className="text-lg">{t.registerCase.selectCropMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Modal */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
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
                <h3 className="text-xl font-bold text-white mb-2">{t.registerCase.submittingCase}</h3>
                <p className="text-white/70 mb-4 text-center">{progressMessage}</p>
                <div className="w-full bg-white/10 backdrop-blur-xl rounded-full h-2.5 mb-2">
                  <motion.div 
                    className="bg-green-400 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
                <span className="text-sm text-white/70">{uploadProgress}%</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
        {submissionSuccess && createdCase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black/40 backdrop-blur-2xl border border-green-400/50 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Green Checkmark Animation */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-400/50 flex items-center justify-center backdrop-blur-xl">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-white mt-4 mb-2">{t.registerCase.successTitle}</h2>
                <p className="text-lg text-white/70">{t.registerCase.successMessage}</p>
              </div>

              {/* Case Details */}
              <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 mb-6 border border-white/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-white/70">{t.registerCase.caseId}</label>
                    <p className="text-xl font-bold text-green-400">{createdCase.caseId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white/70">{t.registerCase.crop}</label>
                    <p className="text-lg font-semibold text-white">
                      {createdCase.cropName
                        ? createdCase.cropName.charAt(0).toUpperCase() + createdCase.cropName.slice(1)
                        : ""
                      }
                    </p>
                  </div>
                  {createdCase.diseaseObservation && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-white/70">{t.registerCase.diseaseObservation}</label>
                      <p className="text-white/90 mt-1">{createdCase.diseaseObservation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Images */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {t.registerCase.uploadedImages} ({createdCase.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {createdCase.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Case image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-white/40"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
                >
                  {t.registerCase.goToDashboard}
                </button>
                <button
                  onClick={() => navigate('/manage-cases')}
                  className="flex-1 px-6 py-3 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
                >
                  {t.registerCase.viewAllCases}
                </button>
              </div>

              <button
                onClick={() => navigate(`/case/${createdCase.caseId}`, { replace: true })}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-amber-300/90 via-yellow-400/90 to-amber-500/90 text-black font-semibold rounded-xl hover:from-amber-200 hover:via-yellow-300 hover:to-amber-400 transition-all duration-300 border border-yellow-100/60 backdrop-blur-xl shadow-[0_12px_30px_rgba(245,158,11,0.28)]"
              >
                {t.registerCase.viewThisCase}
              </button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Error Modal */}
        <AnimatePresence>
        {submissionError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/40 backdrop-blur-2xl border border-red-400/50 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-400/50 flex items-center justify-center mb-4 backdrop-blur-xl">
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t.registerCase.submissionFailed}</h2>
                <p className="text-white/70 text-center mb-6">{submissionError}</p>
                <button
                  onClick={() => setSubmissionError(null)}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
                >
                  {t.registerCase.tryAgain}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Capture Choice Modal */}
        <AnimatePresence>
        {showCaptureModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={() => setShowCaptureModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">{t.registerCase.addPhotos}</h3>
              <div className="space-y-4">
                <button
                  onClick={handleCaptureNow}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl"
                >
                  <Camera className="w-6 h-6" />
                  {t.registerCase.captureNow}
                </button>
                <button
                  onClick={handleUploadFiles}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
                >
                  <Upload className="w-6 h-6" />
                  {t.registerCase.uploadFiles}
                </button>
                <button
                  onClick={() => setShowCaptureModal(false)}
                  className="w-full px-6 py-3 bg-transparent text-white/70 font-semibold rounded-lg hover:text-white transition-colors"
                >
                  {t.registerCase.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Camera View Modal */}
        <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-black/60 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4 text-center">{t.registerCase.capturePhoto}</h3>
              
              {/* Video Preview */}
              <div className="relative mb-4 rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Controls */}
              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  disabled={uploadedImages.length >= 10}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600/80 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors border border-green-400/50 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600/80"
                >
                  <Camera className="w-5 h-5" />
                  {t.registerCase.capture} {uploadedImages.length >= 10 ? '(10/10)' : `(${uploadedImages.length}/10)`}
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40 backdrop-blur-xl"
                >
                  {t.registerCase.closeCamera}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
};

export default withSubscription(RegisterCase);
