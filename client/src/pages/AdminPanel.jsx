import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, Plus, Search, ChevronDown, ChevronUp,
  Pencil, Trash2, X, Check, Loader2, ExternalLink,
  Clock, Image, Package, History, AlertTriangle, Info,
  CheckCircle, XCircle, Timer
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SESSION_DURATION = 3600000; // 1 hour in ms

// ─── Toast System ───────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`bg-black/40 backdrop-blur-2xl border rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer ${
            toast.type === 'success'
              ? 'border-emerald-400/40'
              : toast.type === 'error'
              ? 'border-red-400/40'
              : 'border-blue-400/40'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <p className="text-white text-sm flex-1">{toast.message}</p>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/10" />
        <div className="w-8 h-8 rounded-lg bg-white/10" />
      </div>
    </div>
  </div>
);

// ─── Confirmation Modal ─────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-black/40 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 max-w-md w-full shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
          </div>
          <p className="text-white/80 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <motion.button
              onClick={onClose}
              className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className="px-5 py-2.5 bg-red-500/40 backdrop-blur-md border border-red-400/40 text-white rounded-xl hover:bg-red-500/60 transition-colors flex items-center gap-2 disabled:opacity-50"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Edit Modal ─────────────────────────────────────────────────────────────────
const EditModal = ({ isOpen, product, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    productLink: '',
    imageUrl: '',
    price: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        productLink: product.link || product.productLink || '',
        imageUrl: product.imageUrl || '',
        price: product.price?.toString() || '',
      });
    }
  }, [product]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative bg-black/40 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Product
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">Product Link *</label>
                <input
                  type="text"
                  value={form.productLink}
                  onChange={(e) => handleChange('productLink', e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                />
                {form.imageUrl && (
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <motion.button
                onClick={onClose}
                className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={() => onSave(product._id || product.id, form)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500/40 to-green-500/40 backdrop-blur-md border border-white/30 text-white rounded-xl hover:border-white/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Check className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  const navigate = useNavigate();

  // ─── Auth State ───────────────────────────────────────────────────────────
  const [authVerified, setAuthVerified] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('veag_admin_token') || '');

  // ─── Products State ───────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  // ─── Search & Sort ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // ─── Add Product Form ─────────────────────────────────────────────────────
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '', description: '', productLink: '', imageUrl: '', price: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  // ─── Edit / Delete ────────────────────────────────────────────────────────
  const [editProduct, setEditProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Expanded Histories ───────────────────────────────────────────────────
  const [expandedHistory, setExpandedHistory] = useState({});

  // ─── Session Timer ────────────────────────────────────────────────────────
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);

  // ─── Toast System ─────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = useCallback((message) => {
    localStorage.removeItem('veag_admin_token');
    localStorage.removeItem('veag_admin_login_time');
    if (message) addToast(message, 'info');
    navigate('/dashboard/admin', { replace: true });
  }, [navigate, addToast]);

  // ─── Axios Instance ───────────────────────────────────────────────────────
  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const apiCall = useCallback(async (method, url, data = null) => {
    try {
      const config = { headers: getAuthHeaders() };
      let res;
      if (method === 'get') res = await axios.get(url, config);
      else if (method === 'post') res = await axios.post(url, data, config);
      else if (method === 'put') res = await axios.put(url, data, config);
      else if (method === 'delete') res = await axios.delete(url, config);
      return res;
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout('Session expired. Please login again.');
        return null;
      }
      throw err;
    }
  }, [getAuthHeaders, handleLogout]);

  // ─── Verify Token on Mount ────────────────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('veag_admin_token');
      if (!storedToken) {
        navigate('/dashboard/admin', { replace: true });
        return;
      }

      try {
        await axios.get(`${API_BASE_URL}/admin/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setToken(storedToken);
        setAuthVerified(true);
      } catch {
        localStorage.removeItem('veag_admin_token');
        localStorage.removeItem('veag_admin_login_time');
        navigate('/dashboard/admin', { replace: true });
      }
    };

    verifyToken();
  }, [navigate]);

  // ─── Session Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authVerified) return;

    const interval = setInterval(() => {
      const loginTime = parseInt(localStorage.getItem('veag_admin_login_time') || '0', 10);
      const elapsed = Date.now() - loginTime;
      const remaining = SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        handleLogout('Session expired. Auto-logged out after 1 hour.');
        return;
      }
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [authVerified, handleLogout]);

  // ─── Auto-logout check every 30 seconds ───────────────────────────────────
  useEffect(() => {
    if (!authVerified) return;

    const check = setInterval(() => {
      const loginTime = parseInt(localStorage.getItem('veag_admin_login_time') || '0', 10);
      if (Date.now() - loginTime > SESSION_DURATION) {
        clearInterval(check);
        handleLogout('Session expired. Auto-logged out after 1 hour.');
      }
    }, 30000);

    return () => clearInterval(check);
  }, [authVerified, handleLogout]);

  // ─── Format Time Remaining ────────────────────────────────────────────────
  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Fetch Products ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!authVerified) return;
    setProductsLoading(true);
    try {
      const res = await apiCall(
        'get',
        `${API_BASE_URL}/admin/products?page=${currentPage}&limit=${productsPerPage}&search=${encodeURIComponent(searchQuery)}&sort=${sortBy}`
      );
      if (res) {
        const data = res.data;
        setProducts(data.products || data.data || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / productsPerPage) || 1);
        setTotalProducts(data.total || data.totalProducts || (data.products || data.data || []).length);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch products', 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [authVerified, currentPage, searchQuery, sortBy, apiCall, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Sort Products Client-Side ────────────────────────────────────────────
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '');
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // ─── Filter Products ─────────────────────────────────────────────────────
  const filteredProducts = sortedProducts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.productLink || '').toLowerCase().includes(q)
    );
  });

  // ─── Add Product ──────────────────────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.description.trim() || !addForm.productLink.trim() || !addForm.price) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setAddLoading(true);
    try {
      await apiCall('post', `${API_BASE_URL}/admin/products`, {
        title: addForm.title.trim(),
        description: addForm.description.trim(),
        productLink: addForm.productLink.trim(),
        imageUrl: addForm.imageUrl.trim() || undefined,
        price: parseFloat(addForm.price),
      });
      addToast('Product added successfully!', 'success');
      setAddForm({ title: '', description: '', productLink: '', imageUrl: '', price: '' });
      setAddFormOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // ─── Edit Product ─────────────────────────────────────────────────────────
  const handleSaveEdit = async (productId, form) => {
    if (!form.title.trim() || !form.description.trim() || !form.productLink.trim() || !form.price) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setEditLoading(true);
    try {
      await apiCall('put', `${API_BASE_URL}/admin/products/${productId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        productLink: form.productLink.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        price: parseFloat(form.price),
      });
      addToast('Product updated successfully!', 'success');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete Product ───────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await apiCall('delete', `${API_BASE_URL}/admin/products/${deleteProduct._id || deleteProduct.id}`);
      addToast('Product deleted successfully!', 'success');
      setDeleteProduct(null);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Format Date ──────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ─── Full-Page Auth Loader ────────────────────────────────────────────────
  if (!authVerified) {
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
        <svg className="absolute bottom-0 left-0 w-full h-80 opacity-50" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#a0522d" d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#d97706" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z" />
        </svg>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-10" />
        <motion.div className="relative z-30 flex flex-col items-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative w-20 h-20">
            <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <motion.div className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          </div>
          <motion.p className="text-white font-semibold text-lg drop-shadow-lg" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            Verifying admin access...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Modals */}
      <EditModal
        isOpen={!!editProduct}
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleSaveEdit}
        loading={editLoading}
      />
      <ConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.title}"? This action cannot be undone.`}
        loading={deleteLoading}
      />

      {/* ─── Background ─────────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-12 left-12 w-32 h-16 bg-white rounded-full opacity-70 blur-xl z-0"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="fixed top-24 right-20 w-40 h-20 bg-white rounded-full opacity-60 blur-xl z-0"
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="fixed top-8 left-1/3 w-24 h-12 bg-white rounded-full opacity-50 blur-xl z-0"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <svg className="fixed bottom-0 left-0 w-full h-80 opacity-50 z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#a0522d" d="M0,160L60,144C120,128,240,96,360,112C480,128,600,192,720,186.7C840,181,960,107,1080,96C1200,85,1320,139,1380,165.3L1440,192L1440,320L0,320Z" />
      </svg>
      <svg className="fixed bottom-0 left-0 w-full h-64 opacity-70 z-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#d97706" d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,122.7C840,117,960,139,1080,144C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z" />
      </svg>
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-b from-green-600 to-green-700 z-0" />

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-2xl border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/40 to-green-500/40 backdrop-blur-md border border-white/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Admin Panel</h1>
              <p className="text-white/50 text-xs hidden sm:block">Product Management</p>
            </div>
          </div>

          {/* Center: Session Timer */}
          <motion.div
            className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5"
            animate={timeRemaining < 300000 ? { borderColor: ['rgba(255,255,255,0.2)', 'rgba(239,68,68,0.5)', 'rgba(255,255,255,0.2)'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Timer className={`w-4 h-4 ${timeRemaining < 300000 ? 'text-red-400' : 'text-white/70'}`} />
            <span className={`text-sm font-mono font-medium ${timeRemaining < 300000 ? 'text-red-400' : 'text-white/90'}`}>
              {formatTime(timeRemaining)}
            </span>
          </motion.div>

          {/* Right: Logout */}
          <motion.button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/80 hover:text-white hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────────────── */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-6 pb-32 space-y-6">

        {/* ═══ A. Add Product Section ═══════════════════════════════════════ */}
        <motion.div
          className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Collapsible Header */}
          <motion.button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            whileTap={{ scale: 0.995 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/40 to-green-500/40 border border-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Add New Product</span>
            </div>
            <motion.div
              animate={{ rotate: addFormOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-white/60" />
            </motion.div>
          </motion.button>

          {/* Form Body */}
          <AnimatePresence>
            {addFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <form onSubmit={handleAddProduct} className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-1.5">Title *</label>
                      <input
                        type="text"
                        value={addForm.title}
                        onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                        placeholder="Product title"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-1.5">Price (₹) *</label>
                      <input
                        type="number"
                        value={addForm.price}
                        onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-1.5">Description *</label>
                    <textarea
                      value={addForm.description}
                      onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                      placeholder="Product description"
                      rows={3}
                      className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-1.5">Product Link / URL *</label>
                      <input
                        type="text"
                        value={addForm.productLink}
                        onChange={(e) => setAddForm({ ...addForm, productLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-1.5">Image URL</label>
                      <input
                        type="text"
                        value={addForm.imageUrl}
                        onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
                        placeholder="https://... (optional)"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {addForm.imageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 bg-white/5">
                        <img
                          src={addForm.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <p className="text-white/50 text-sm">Image preview</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={addLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500/50 to-green-500/50 backdrop-blur-md border border-white/30 hover:border-white/50 text-white font-bold py-2.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!addLoading ? { scale: 1.02 } : {}}
                    whileTap={!addLoading ? { scale: 0.98 } : {}}
                  >
                    {addLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Product
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══ B. Product List Section ═══════════════════════════════════════ */}
        <motion.div
          className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* List Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 focus:border-white/50 rounded-xl pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 outline-none transition-all"
                />
              </div>

              {/* Sort + Count */}
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="newest" className="bg-gray-900 text-white">Newest</option>
                  <option value="oldest" className="bg-gray-900 text-white">Oldest</option>
                  <option value="title-asc" className="bg-gray-900 text-white">Title A-Z</option>
                  <option value="title-desc" className="bg-gray-900 text-white">Title Z-A</option>
                  <option value="price-asc" className="bg-gray-900 text-white">Price Low-High</option>
                  <option value="price-desc" className="bg-gray-900 text-white">Price High-Low</option>
                </select>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
                  <span className="text-white/80 text-xs font-medium">
                    <Package className="w-3 h-3 inline mr-1" />
                    {totalProducts}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="divide-y divide-white/10">
            {productsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                className="p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-white/60 font-semibold text-lg mb-1">
                  {searchQuery ? 'No products found' : 'No products yet'}
                </h3>
                <p className="text-white/40 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Add your first product using the form above'}
                </p>
              </motion.div>
            ) : (
              filteredProducts.map((product, index) => {
                const productId = product._id || product.id;
                const isHistoryExpanded = expandedHistory[productId];

                return (
                  <motion.div
                    key={productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Product Row */}
                    <div className="px-4 sm:px-6 py-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-white/20 bg-white/5 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-5 h-5 text-white/30" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-white font-semibold text-sm sm:text-base truncate">
                                {product.title}
                              </h4>
                              <p className="text-emerald-400 font-bold text-sm">
                                ₹{product.price != null ? Number(product.price).toFixed(2) : '0.00'}
                              </p>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <motion.button
                                onClick={() => setEditProduct(product)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5 text-white/70" />
                              </motion.button>
                              <motion.button
                                onClick={() => setDeleteProduct(product)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/40 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400/80" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/50">
                            {product.productLink && (
                              <a
                                href={product.productLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-white/80 transition-colors truncate max-w-[200px]"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{product.productLink}</span>
                              </a>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(product.createdAt)}
                            </span>
                            {product.updatedAt && product.updatedAt !== product.createdAt && (
                              <span className="flex items-center gap-1 text-amber-400/60">
                                <Pencil className="w-3 h-3" />
                                Modified {formatDate(product.updatedAt)}
                              </span>
                            )}
                          </div>

                          {/* View History Toggle */}
                          {product.editHistory && product.editHistory.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedHistory((prev) => ({
                                  ...prev,
                                  [productId]: !prev[productId],
                                }))
                              }
                              className="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                            >
                              <History className="w-3 h-3" />
                              {isHistoryExpanded ? 'Hide' : 'View'} History ({product.editHistory.length})
                              {isHistoryExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Edit History */}
                      <AnimatePresence>
                        {isHistoryExpanded && product.editHistory && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 ml-14 space-y-2">
                              {product.editHistory.map((edit, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-xs"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white/60 font-medium capitalize">{edit.field}</span>
                                    <span className="text-white/40">{formatDateTime(edit.date || edit.timestamp)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-white/50">
                                    <span className="line-through text-red-400/60 truncate max-w-[150px]">
                                      {edit.oldValue || '—'}
                                    </span>
                                    <span className="text-white/30">→</span>
                                    <span className="text-emerald-400/80 truncate max-w-[150px]">
                                      {edit.newValue || '—'}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !productsLoading && (
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-white/50 text-sm">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                  whileHover={currentPage !== 1 ? { scale: 1.02 } : {}}
                  whileTap={currentPage !== 1 ? { scale: 0.98 } : {}}
                >
                  Previous
                </motion.button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-white/20 text-white border border-white/40'
                            : 'text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                  whileHover={currentPage !== totalPages ? { scale: 1.02 } : {}}
                  whileTap={currentPage !== totalPages ? { scale: 0.98 } : {}}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPanel;
