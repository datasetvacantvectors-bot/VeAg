import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/translations";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  X,
  FileText,
  FolderOpen,
  User,
  CreditCard,
  Globe,
  Search,
  Clock,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";

const RECENT_SEARCHES_KEY = "veag_recent_searches";
const MAX_RECENT = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const t = translations[language];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const placeholders = [
    "Search for agricultural products...",
    "Find seeds, fertilizers, tools...",
    "Explore crop protection solutions...",
    "Discover farming equipment...",
    "Search organic products...",
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  ];

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentUser?.photoURL]);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close recent searches when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    const q = (query || searchQuery).trim();
    if (!q) return;
    // Save to recent searches
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(
      0,
      MAX_RECENT,
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setSearchFocused(false);
    // Navigate to product search results
    navigate(`/dashboard/products?q=${encodeURIComponent(q)}`);
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      // console.error('Failed to logout:', error);
    }
  };

  const navigationButtons = [
    {
      title: t.dashboard.registerCase,
      path: "/register-case",
      icon: FileText,
      color: "from-emerald-500/30 to-green-500/30",
      radius: "30px",
      tilt: "-0.5deg",
      accent: "rgba(167, 243, 208, 0.24)",
    },
    {
      title: t.dashboard.manageCases,
      path: "/manage-cases",
      icon: FolderOpen,
      color: "from-blue-500/30 to-cyan-500/30",
      radius: "30px",
      tilt: "0.5deg",
      accent: "rgba(147, 197, 253, 0.24)",
    },
    {
      title: t.dashboard.editProfile,
      path: "/edit-profile",
      icon: User,
      color: "from-purple-500/30 to-pink-500/30",
      radius: "30px",
      tilt: "-0.4deg",
      accent: "rgba(244, 171, 252, 0.24)",
    },
    {
      title: t.dashboard.manageSubscription,
      path: "/manage-subscription",
      icon: CreditCard,
      color: "from-orange-500/30 to-red-500/30",
      radius: "30px",
      tilt: "0.4deg",
      accent: "rgba(253, 186, 116, 0.24)",
    },
    // {
    //   title: 'Search Products',
    //   path: '/dashboard/products',
    //   icon: ShoppingBag,
    //   color: 'from-amber-500/30 to-yellow-500/30'
    // }
  ];

  // Loading State
  if (isLoading) {
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

        {/* Mountains - Back Layer (Sunset Brown) */}
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

        {/* Mountains - Middle Layer (Burnt Orange) */}
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

        {/* Grass at the bottom */}
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
            {t.dashboard?.loadingDashboard || "Loading Dashboard..."}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative">
      {/* Sky background with clouds */}
      <motion.div
        className="fixed top-12 left-12 w-32 h-16 bg-white rounded-full opacity-70 blur-xl"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="fixed top-24 right-20 w-40 h-20 bg-white rounded-full opacity-60 blur-xl"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Mountains - Back Layer */}
      <svg
        className="fixed bottom-0 left-0 w-full h-80 opacity-50 pointer-events-none"
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
        className="fixed bottom-0 left-0 w-full h-64 opacity-70 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#d97706"
          d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z"
        />
      </svg>

      {/* Grass at the bottom */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 bg-black/30 backdrop-blur-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white/20 backdrop-blur-md flex items-center justify-center">
                {!logoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="relative w-6 h-6">
                      <motion.div
                        className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <motion.div
                        className="absolute inset-0.5 border-2 border-transparent border-t-orange-400 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                )}
                <img
                  src={veagLogo}
                  alt="VeAg Logo"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${logoLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                VeAg
              </h1>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Language Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="p-2 sm:p-2.5 bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-full transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Change Language"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.button>

                {/* Language Dropdown */}
                <AnimatePresence>
                  {showLanguageDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowLanguageDropdown(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-black/40 backdrop-blur-2xl border border-white/40 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setShowLanguageDropdown(false);
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${
                              language === lang.code ? "bg-white/20" : ""
                            }`}
                          >
                            <span className="text-white font-medium">
                              {lang.name}
                            </span>
                            {language === lang.code && (
                              <span className="ml-auto text-green-400">✓</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Support Button */}
              <motion.button
                onClick={() => setShowSupportPopup(true)}
                className="p-2 sm:p-2.5 bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-full transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={t.dashboard?.support || "Support"}
              >
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.button>

              {/* User Profile */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white/20 backdrop-blur-xl flex items-center justify-center">
                {currentUser?.photoURL && !imageError ? (
                  <>
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="relative w-5 h-5">
                          <motion.div
                            className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <motion.div
                            className="absolute inset-0.5 border-2 border-transparent border-t-orange-400 rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </>
                ) : (
                  <span className="text-white font-bold text-lg">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Name - Hidden on small screens */}
              <span className="text-white font-medium hidden sm:inline">
                {currentUser?.name}
              </span>

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                className="px-4 sm:px-6 py-2 bg-black/30 hover:bg-black/40 backdrop-blur-md text-white font-semibold rounded-lg border border-white/30 hover:border-white/50 transition-all duration-300 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.logout}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mb-10 sm:mb-14 text-center relative"
        >
          {/* Subtle glow behind the text to make it pop against the background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-md h-24 bg-white/40 blur-3xl rounded-full pointer-events-none" />

          <h2 className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 tracking-tight mb-3 drop-shadow-sm">
            {t.dashboard.welcome},{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
              {currentUser?.name?.split(" ")[0]}
            </span>
            !
          </h2>
          <p className="relative z-10 text-lg sm:text-xl text-gray-700/90 font-medium max-w-2xl mx-auto drop-shadow-sm">
            {t.dashboard.title}
          </p>
        </motion.div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {navigationButtons.map((button, index) => (
            <motion.button
              key={index}
              onClick={() => navigate(button.path)}
              className={`relative aspect-square overflow-hidden p-3 sm:p-6 lg:p-8 bg-white/10 bg-gradient-to-br ${button.color} backdrop-blur-3xl border border-white/25 hover:border-white/60 text-white shadow-[0_18px_54px_rgba(0,0,0,0.14)] hover:shadow-[0_26px_72px_rgba(0,0,0,0.2)] transition-all duration-500 group will-change-transform`}
              style={{
                transform: `rotate(${button.tilt})`,
                borderRadius: button.radius,
                boxShadow: `0 18px 50px ${button.accent}, inset 0 1px 0 rgba(255,255,255,0.26)`,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 50, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: index * 0.12,
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 1.2,
              }}
              whileHover={{ scale: 1.06, y: -6 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Smooth glass highlights */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/18 via-white/5 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.34),transparent_28%),radial-gradient(circle_at_85%_86%,rgba(255,255,255,0.10),transparent_30%)] opacity-85 mix-blend-screen" />
              <div className="absolute inset-[1px] rounded-[inherit] border border-white/12 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-2 rounded-[inherit] bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500" />

              <div className="relative z-10 flex flex-col h-full w-full items-center justify-center text-center">
                {/* Icon */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/14 border border-white/24 rounded-full flex items-center justify-center mb-2 sm:mb-4 lg:mb-6 group-hover:bg-white/24 transition-all duration-500 group-hover:scale-105 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                  <div className="absolute inset-[18%] rounded-full bg-white/18 blur-md opacity-90" />
                  <button.icon
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white drop-shadow-md"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-white drop-shadow-md group-hover:text-white transition-all duration-300 tracking-[0.02em]">
                  {button.title}
                </h3>

                {/* Subtle bottom border animation */}
                <div className="absolute bottom-2 sm:bottom-0 h-1 w-2/3 bg-gradient-to-r from-transparent via-white/55 to-transparent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* ===== PROFESSIONAL SEARCH BAR ===== */}
        <motion.div
          ref={searchRef}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 mb-10 sm:mb-14 max-w-2xl mx-auto relative"
        >
          {/* Soft ambient glow */}
          <motion.div
            className="absolute -inset-3 rounded-[2rem] pointer-events-none"
            animate={{
              opacity: searchFocused ? [0.4, 0.6, 0.4] : [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: searchFocused
                ? "radial-gradient(ellipse at center, rgba(120,80,30,0.5) 0%, rgba(80,50,20,0.25) 50%, transparent 80%)"
                : "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, transparent 70%)",
              filter: "blur(20px)",
              transition: "background 0.6s ease",
            }}
          />

          {/* Border layer — subtle warm metallic */}
          <div
            className="absolute -inset-[1px] rounded-[1.75rem] pointer-events-none"
            style={{
              background: searchFocused
                ? "linear-gradient(135deg, rgba(180,130,50,0.8) 0%, rgba(140,90,30,0.4) 40%, rgba(255,255,255,0.2) 60%, rgba(180,130,50,0.7) 100%)"
                : "linear-gradient(135deg, rgba(60,40,20,0.5) 0%, rgba(40,30,15,0.3) 50%, rgba(60,40,20,0.5) 100%)",
              transition: "background 0.5s ease",
            }}
          />

          {/* Main glass body */}
          <div
            className={`relative rounded-[1.7rem] overflow-hidden transition-all duration-500 ${
              searchFocused
                ? "bg-black/60 backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
                : "bg-black/50 backdrop-blur-2xl shadow-xl"
            }`}
          >
            {/* Inner top highlight */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.3) 50%, transparent 90%)",
              }}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center gap-3 px-5 sm:px-7 py-4 sm:py-[1.15rem]"
            >
              {/* Search icon */}
              <Search
                className={`w-5 h-5 sm:w-[22px] sm:h-[22px] flex-shrink-0 transition-colors duration-400 ${
                  searchFocused ? "text-amber-300" : "text-white/60"
                }`}
              />

              {/* Divider */}
              <div
                className={`w-[1px] h-5 flex-shrink-0 transition-colors duration-400 ${
                  searchFocused ? "bg-white/30" : "bg-white/20"
                }`}
              />

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder={
                  (t.productSearch?.placeholders || placeholders)[
                    placeholderIndex
                  ]
                }
                className="flex-1 min-w-0 w-full bg-transparent text-white text-[15px] sm:text-base font-medium tracking-wide placeholder-white/50 outline-none caret-amber-300"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Clear button */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => {
                      setSearchQuery("");
                      inputRef.current?.focus();
                    }}
                    className="flex-shrink-0 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200"
                  >
                    <X className="w-3.5 h-3.5 text-white/70" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                className={`flex-shrink-0 whitespace-nowrap px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ${
                  searchQuery.trim()
                    ? "bg-gradient-to-r from-amber-500/80 to-orange-500/70 text-white border border-amber-400/40 hover:border-amber-300/60 shadow-lg shadow-amber-900/20"
                    : "bg-white/15 text-white/70 border border-white/20 hover:bg-white/25 hover:text-white"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.productSearch.searchButton}
              </motion.button>
            </form>

            {/* Scanning light — professional subtle sweep */}
            <motion.div
              className="absolute bottom-0 left-0 h-[1px] pointer-events-none"
              style={{
                width: "40%",
                background: searchFocused
                  ? "linear-gradient(90deg, transparent, rgba(217,160,80,0.5), rgba(255,255,255,0.2), transparent)"
                  : "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
              animate={{ left: ["-40%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Recent searches dropdown */}
            <AnimatePresence>
              {searchFocused && !searchQuery && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/15 mx-5 sm:mx-7" />
                  <div className="px-5 sm:px-7 pt-3 pb-2 flex items-center justify-between">
                    <span className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.12em] flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />{" "}
                      {t.productSearch.recentSearches}
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-white/60 hover:text-red-300 text-[11px] font-medium flex items-center gap-1 transition-colors duration-200"
                    >
                      <Trash2 className="w-3 h-3" /> {t.productSearch.clear}
                    </button>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <motion.button
                        key={term}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearch(term);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/15 hover:border-white/30 text-white/85 hover:text-white text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                      >
                        <Clock className="w-2.5 h-2.5 text-white/50" />
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle helper text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-stone-700 text-[10px] sm:text-[11px] md:text-xs mt-3 tracking-wide font-medium px-4 sm:px-0 leading-relaxed"
          >
            {t.productSearch.helperText}
          </motion.p>
        </motion.div>
      </div>

      {/* Support Popup */}
      <AnimatePresence>
        {showSupportPopup && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupportPopup(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Popup */}
            <motion.div
              className="relative bg-black/40 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setShowSupportPopup(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>

              {/* Content */}
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-white mx-auto mb-4 drop-shadow-lg" />
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {t.dashboard.needHelp}
                </h3>
                <p className="text-white/80 mb-8 drop-shadow-md">
                  {t.dashboard.helpDesc}
                </p>

                {/* Support Email Link */}
                <motion.a
                  href="mailto:sarthak@vacantvectors.com"
                  className="inline-flex items-center justify-center w-full px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 hover:border-white/50 text-white font-semibold rounded-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="drop-shadow-md">
                    {t.dashboard.contactSupport}
                  </span>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;