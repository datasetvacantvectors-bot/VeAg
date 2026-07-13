import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/translations";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  X,
  SearchX,
  AlertCircle,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Clock,
  Trash2,
  ExternalLink,
  ShoppingCart,
  Info,
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  CalendarPlus,
  CalendarMinus,
  Loader2,
} from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const RECENT_SEARCHES_KEY = "veag_recent_searches";
const MAX_RECENT = 5;
const PRODUCTS_PER_PAGE = 12;

/* ──────────────────────── Shimmer keyframes (injected once) ──────────────── */
const shimmerStyleId = "veag-shimmer-style";
if (
  typeof document !== "undefined" &&
  !document.getElementById(shimmerStyleId)
) {
  const style = document.createElement("style");
  style.id = shimmerStyleId;
  style.textContent = `
    @keyframes veagShimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .veag-shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 800px 100%;
      animation: veagShimmer 1.6s ease-in-out infinite;
    }
    .veag-slim-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .veag-slim-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .veag-slim-scroll::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
    }
    .veag-slim-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }
    .veag-slim-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
    @keyframes veagSpin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .veag-spin {
      animation: veagSpin 0.8s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────── Helper: recent searches ────────────────────────── */
const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
  } catch {
    return [];
  }
};

const addRecentSearch = (term) => {
  if (!term?.trim()) return;
  const cleaned = term.trim();
  let recent = getRecentSearches().filter((s) => s !== cleaned);
  recent.unshift(cleaned);
  if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
};

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

/* ──────────────────────── Sort options config ────────────────────────────── */
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: ArrowUpDown },
  { value: "price_asc", label: "Price: Low → High", icon: ArrowUpNarrowWide },
  {
    value: "price_desc",
    label: "Price: High → Low",
    icon: ArrowDownNarrowWide,
  },
  { value: "newest", label: "Newest First", icon: CalendarPlus },
  { value: "oldest", label: "Oldest First", icon: CalendarMinus },
];

/* ──────────────────────── Skeleton Card ──────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden relative">
    <div className="aspect-video w-full veag-shimmer flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 rounded-md veag-shimmer" />
      <div className="h-3 w-full rounded-md veag-shimmer" />
      <div className="h-3 w-5/6 rounded-md veag-shimmer" />
      <div className="h-6 w-1/3 rounded-lg veag-shimmer mt-2" />
    </div>
  </div>
);

/* ──────────────────────── Product Card ───────────────────────────────────── */
const ProductCard = ({ product, index, onProductClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-black/30 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden
        hover:border-white/30 hover:shadow-[0_8px_40px_rgba(245,158,11,0.12)]
        transition-all duration-300 group cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-white/5 flex items-center justify-center">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 veag-shimmer flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        )}
        {(product.imageUrl || product.image) && !imgError ? (
          <>
            <img
              src={product.imageUrl || product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <Package className="w-10 h-10 text-white/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm line-clamp-1 drop-shadow-md group-hover:text-amber-200 transition-colors duration-300">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-white/60 text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-3 inline-block bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/20 rounded-lg px-3 py-1">
          <span className="text-amber-200 font-bold text-sm">
            ₹{product.price != null ? Number(product.price).toFixed(2) : "0.00"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════ MAIN COMPONENT ═════════════════════════════════── */
const ProductSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  /* ── State ────────────────────────────────────────────────────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [navImageLoaded, setNavImageLoaded] = useState(false);
  const [navImageError, setNavImageError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Search
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const inputRef = useRef(null);

  // Results
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const productsListRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (productsListRef.current) {
      const yOffset = -100;
      const y =
        productsListRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [currentPage]);

  // Sort
  const [sort, setSort] = useState("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  const abortRef = useRef(null);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalImgLoaded, setModalImgLoaded] = useState(false);

  /* ── Search products ───────────────────────────────────────────────── */
  const searchProducts = useCallback(
    async (searchQuery, page, sortBy) => {
      if (!searchQuery?.trim()) {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
        setIsSearching(false);
        setIsLoading(false);
        return;
      }

      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setIsSearching(true);
        setError(null);

        const params = {
          q: searchQuery.trim(),
          page,
          limit: PRODUCTS_PER_PAGE,
          sort: sortBy,
        };

        const { data } = await axios.get(`${API_BASE_URL}/products/search`, {
          params,
          signal: controller.signal,
        });

        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.currentPage || page);

        // Track search (fire-and-forget)
        axios
          .post(`${API_BASE_URL}/products/track-search`, {
            userId: currentUser?.userId,
            email: currentUser?.email,
            searchQuery: searchQuery.trim(),
            resultsCount: data.totalProducts || 0,
          })
          .catch(() => {});
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError") return;
        setError(
          err.response?.data?.message ||
            "Failed to search products. Please try again.",
        );
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
          setIsLoading(false);
        }
      }
    },
    [currentUser],
  );

  /* ── Trigger search on query / sort / page change ──────────────────── */
  useEffect(() => {
    setNavImageLoaded(false);
    setNavImageError(false);
  }, [currentUser?.photoURL]);

  useEffect(() => {
    searchProducts(query, currentPage, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, sort]);

  /* ── Submit search ─────────────────────────────────────────────────── */
  const handleSearch = useCallback(
    (term) => {
      const q = (term ?? inputValue).trim();
      if (!q) return;
      setQuery(q);
      setInputValue(q);
      setCurrentPage(1);
      setSearchParams({ q });
      addRecentSearch(q);
      setRecentSearches(getRecentSearches());
      setShowRecent(false);
    },
    [inputValue, setSearchParams],
  );

  /* ── Refresh handler ───────────────────────────────────────────────── */
  const handleRefresh = useCallback(() => {
    if (!query?.trim()) return;
    searchProducts(query, currentPage, sort);
  }, [query, currentPage, sort, searchProducts]);

  /* ── Product click ─────────────────────────────────────────────────── */
  const handleProductClick = useCallback((product) => {
    setModalImgLoaded(false);
    setSelectedProduct(product);
  }, []);

  /* ── Page change ───────────────────────────────────────────────────── */
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Generate visible page numbers (responsive) ────────────────────── */
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

  /* ── "Showing X-Y of Z" text ───────────────────────────────────────── */
  const showingStart = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts);

  /* ── Close sort dropdown on outside click ──────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setShowSortDropdown(false);
      }
    };
    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  /* ── Close recent on outside click ─────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Initial load timer (match Dashboard) ──────────────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ──────────────────────── LOADING STATE ────────────────────────────── */
  if (isLoading && !products.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center">
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
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />

        <motion.div
          className="relative z-30 flex flex-col items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
          <motion.p
            className="text-white font-semibold text-lg drop-shadow-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t.productSearch.searchingProducts}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  /* ──────────────────────── MAIN RENDER ──────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative">
      {/* ── Clouds ───────────────────────────────────────────────────── */}
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
      <motion.div
        className="fixed top-40 left-1/3 w-36 h-14 bg-white rounded-full opacity-50 blur-xl"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* ── Mountains ────────────────────────────────────────────────── */}
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
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10 pointer-events-none" />

      {/* ── Header Bar ───────────────────────────────────────────────── */}
      <header className="relative z-20 bg-black/30 backdrop-blur-2xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
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

            <span className="text-2xl font-bold text-white">VeAg</span>
          </div>

          {/* Right */}
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
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${navImageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setNavImageLoaded(true)}
                    onError={() => setNavImageError(true)}
                  />
                </>
              ) : (
                <span className="text-white font-bold text-lg">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Support Popup */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[10000] bg-black/40 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-2xl w-80"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">
                {t.editProfile?.needHelp || "Need Help?"}
              </h3>
              <button
                onClick={() => setShowSupport(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/90 mb-4">
              {t.editProfile?.supportText ||
                "Have questions or need assistance? We're here to help!"}
            </p>
            <a
              href="mailto:sarthak@vacantvectors.com"
              className="block w-full bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-xl transition-colors border border-white/30"
            >
              {t.editProfile?.contactSupport || "Contact Support"}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content Area ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4"
          ref={inputRef}
        >
          <div className="bg-black/20 backdrop-blur-xl border border-white/30 rounded-2xl p-3 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center gap-3"
            >
              <Search className="w-5 h-5 text-white/60 flex-shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => {
                  if (!inputValue.trim()) setShowRecent(true);
                }}
                placeholder={t.productSearch.searchPlaceholder}
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm sm:text-base"
              />
              {inputValue && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setInputValue("");
                    setShowRecent(true);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              )}
              <motion.button
                type="submit"
                className="px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 rounded-xl text-white text-sm font-medium transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.productSearch.searchButton}
              </motion.button>
            </form>

            {/* Recent searches dropdown */}
            <AnimatePresence>
              {showRecent &&
                !inputValue.trim() &&
                recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/15 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />{" "}
                        {t.productSearch.recentSearches}
                      </span>
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-white/50 hover:text-white/80 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />{" "}
                        {t.productSearch.clearAll}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <motion.button
                          key={term}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSearch(term)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-full text-white/80 text-xs transition-all duration-200"
                        >
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Toolbar Bar (Results count + Refresh + Sort) ─────────────── */}
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mb-6 relative z-50 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              {/* Left: results count */}
              <div className="flex items-center gap-2 min-w-0">
                {totalProducts > 0 ? (
                  <motion.span
                    key={totalProducts}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-white/70 text-sm font-medium whitespace-nowrap"
                  >
                    <span className="text-white font-bold">
                      {totalProducts}
                    </span>{" "}
                    {t.productSearch.resultsFound}
                  </motion.span>
                ) : (
                  !isSearching && (
                    <span className="text-white/50 text-sm">
                      {t.productSearch.noResults}
                    </span>
                  )
                )}
              </div>

              {/* Right: refresh + sort */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Refresh button */}
                <motion.button
                  onClick={handleRefresh}
                  disabled={isSearching}
                  className="p-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-xl text-white/70 hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={t.productSearch.refresh}
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <RotateCcw
                      className={`w-4 h-4 ${isSearching ? "veag-spin" : ""}`}
                    />
                    <span>{t.productSearch.refresh}</span>
                  </span>
                </motion.button>

                {/* Sort dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    onClick={() => setShowSortDropdown((v) => !v)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-xl text-white text-sm transition-all duration-300"
                  >
                    {(() => {
                      const opt = SORT_OPTIONS.find((o) => o.value === sort);
                      const Icon = opt?.icon || ArrowUpDown;
                      return <Icon className="w-4 h-4 text-white/60" />;
                    })()}
                    <span className="font-medium hidden sm:inline">
                      {t.productSearch.sort[
                        sort.replace("_asc", "Asc").replace("_desc", "Desc")
                      ] || SORT_OPTIONS.find((o) => o.value === sort)?.label}
                    </span>
                    <span className="font-medium sm:hidden text-xs">
                      {t.productSearch.sort.label}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${
                        showSortDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-40"
                      >
                        {SORT_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSort(opt.value);
                                setCurrentPage(1);
                                setShowSortDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3 ${
                                sort === opt.value
                                  ? "bg-white/15 font-semibold"
                                  : ""
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 ${sort === opt.value ? "text-amber-400" : "text-white/50"}`}
                              />
                              {t.productSearch.sort[
                                opt.value
                                  .replace("_asc", "Asc")
                                  .replace("_desc", "Desc")
                              ] || opt.label}
                              {sort === opt.value && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Searching Skeleton ──────────────────────────────────────── */}
        {isSearching && products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error State ────────────────────────────────────────────── */}
        {!isSearching && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-3xl p-10 text-center max-w-md w-full">
              <AlertCircle className="w-16 h-16 text-red-400/80 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                {t.productSearch.somethingWentWrong}
              </h3>
              <p className="text-white/70 text-sm mb-6">{error}</p>
              <motion.button
                onClick={() => searchProducts(query, currentPage, sort)}
                className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-xl text-white font-medium transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                {t.productSearch.retry}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Empty State ────────────────────────────────────────────── */}
        {!isSearching && !error && query && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-3xl p-10 text-center max-w-md w-full">
              <SearchX className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                {t.productSearch.noProductsFound}
              </h3>
              <p className="text-white/70 text-sm">
                {t.productSearch.tryDifferentTerm}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── No Query State ─────────────────────────────────────────── */}
        {!isSearching && !error && !query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-3xl p-10 text-center max-w-md w-full">
              <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                {t.productSearch.searchForProducts}
              </h3>
              <p className="text-white/70 text-sm">
                {t.productSearch.enterSearchTerm}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Product Grid ───────────────────────────────────────────── */}
        {!error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
            ref={productsListRef}
          >
            {/* Loading overlay for sorting/pagination */}
            {isSearching && (
              <div className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center transition-all duration-300">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin drop-shadow-xl" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id || product.id || index}
                  product={product}
                  index={index}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {/* ── Pagination ───────────────────────────────────────────── */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-10 flex flex-col items-center gap-3"
              >
                {/* Showing text */}
                <p className="text-white/50 text-xs sm:text-sm">
                  {t.productSearch.showing}{" "}
                  <span className="text-white/80 font-medium">
                    {showingStart}–{showingEnd}
                  </span>{" "}
                  {t.productSearch.of}{" "}
                  <span className="text-white/80 font-medium">
                    {totalProducts}
                  </span>{" "}
                  {t.productSearch.products}
                </p>

                {/* Pill pagination container */}
                <div className="bg-black/25 backdrop-blur-xl border border-white/15 rounded-full px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-1.5">
                  {/* First page */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-all duration-200 hidden sm:flex items-center justify-center ${
                      currentPage === 1
                        ? "opacity-30 cursor-not-allowed text-white/40"
                        : "hover:bg-white/15 text-white/70 hover:text-white"
                    }`}
                    title={t.productSearch.firstPage}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentPage === 1
                        ? "opacity-30 cursor-not-allowed text-white/40"
                        : "hover:bg-white/15 text-white/70 hover:text-white"
                    }`}
                    title={t.productSearch.previousPage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers - desktop (5 visible) */}
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers(5).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-200 ${
                          page === currentPage
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                            : "hover:bg-white/15 text-white/60 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Page numbers - mobile (3 visible) */}
                  <div className="flex sm:hidden items-center gap-1">
                    {getPageNumbers(3).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                          page === currentPage
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                            : "hover:bg-white/15 text-white/60 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentPage === totalPages
                        ? "opacity-30 cursor-not-allowed text-white/40"
                        : "hover:bg-white/15 text-white/70 hover:text-white"
                    }`}
                    title={t.productSearch.nextPage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-all duration-200 hidden sm:flex items-center justify-center ${
                      currentPage === totalPages
                        ? "opacity-30 cursor-not-allowed text-white/40"
                        : "hover:bg-white/15 text-white/70 hover:text-white"
                    }`}
                    title={t.productSearch.lastPage}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ═══════ PRODUCT DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />

            {/* Modal Card */}
            <motion.div
              className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col"
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              {/* ── Close button (floating) ── */}
              <motion.button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 hover:border-white/30 rounded-full text-white/70 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* ── Image Section ── */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {selectedProduct.imageUrl || selectedProduct.image ? (
                  <>
                    {!modalImgLoaded && (
                      <div className="absolute inset-0 veag-shimmer flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                      </div>
                    )}
                    <motion.img
                      src={selectedProduct.imageUrl || selectedProduct.image}
                      alt={selectedProduct.title}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        modalImgLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setModalImgLoaded(true)}
                      onError={() => setModalImgLoaded(true)}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white/15" />
                  </div>
                )}

                {/* Price badge overlay */}
                {selectedProduct.price != null && (
                  <motion.div
                    className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-emerald-400 text-lg font-bold">
                      ₹{Number(selectedProduct.price).toFixed(2)}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* ── Content Section ── */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 veag-slim-scroll">
                {/* Title */}
                <motion.h3
                  className="text-white font-bold text-lg sm:text-xl leading-snug"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {selectedProduct.title}
                </motion.h3>

                {/* Description */}
                {selectedProduct.description && (
                  <motion.p
                    className="text-white/65 text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {selectedProduct.description}
                  </motion.p>
                )}

                {/* URL preview */}
                {selectedProduct.link && (
                  <motion.div
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    <span className="text-white/40 text-xs truncate">
                      {selectedProduct.link}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* ── Footer Actions ── */}
              <div className="flex-shrink-0 border-t border-white/10 px-5 sm:px-6 py-4 space-y-3">
                {/* Visit Store button */}
                <motion.button
                  onClick={() => {
                    // Track click (fire-and-forget)
                    axios
                      .post(`${API_BASE_URL}/products/track-click`, {
                        userId: currentUser?.userId,
                        email: currentUser?.email,
                        productId: selectedProduct._id || selectedProduct.id,
                        productTitle: selectedProduct.title,
                        url: selectedProduct.link,
                      })
                      .catch(() => {});

                    if (selectedProduct.link)
                      window.open(selectedProduct.link, "_blank");
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r from-amber-500/70 to-orange-500/60 hover:from-amber-500/90 hover:to-orange-500/80 border border-amber-400/30 hover:border-amber-300/50 rounded-xl text-white font-semibold text-sm shadow-lg shadow-amber-900/15 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t.productSearch.modal.visitStore}
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </motion.button>

                {/* Floating disclaimer footer */}
                <motion.div
                  className="bg-amber-500/8 border border-amber-400/10 rounded-xl px-3 py-2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-amber-300/40 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-white/35 text-[10px] leading-relaxed">
                        {t.productSearch.modal.disclaimer1Part1}
                        {selectedProduct.updatedAt || selectedProduct.createdAt
                          ? ` ${language === "en" ? "as of" : language === "hi" ? "दिनांक" : "তারিখে"} ${new Date(selectedProduct.updatedAt || selectedProduct.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          : ""}
                        {t.productSearch.modal.disclaimer1Part2}
                      </p>
                      <p className="text-white/25 text-[9px] leading-relaxed">
                        {t.productSearch.modal.disclaimer2}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;