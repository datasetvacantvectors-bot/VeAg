import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(true);

  // On mount: check if token already exists and verify it
  const verifyExistingToken = useCallback(async () => {
    const token = localStorage.getItem("veag_admin_token");
    if (!token) {
      setVerifying(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.status === 200) {
        navigate("/dashboard/admin/panel", { replace: true });
      } else {
        localStorage.removeItem("veag_admin_token");
        localStorage.removeItem("veag_admin_login_time");
        setVerifying(false);
      }
    } catch {
      localStorage.removeItem("veag_admin_token");
      localStorage.removeItem("veag_admin_login_time");
      setVerifying(false);
    }
  }, [navigate]);

  useEffect(() => {
    verifyExistingToken();
  }, [verifyExistingToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/login`, {
        adminId: adminId.trim(),
        password,
      });

      const { token } = res.data;
      localStorage.setItem("veag_admin_token", token);
      localStorage.setItem("veag_admin_login_time", Date.now().toString());
      navigate("/dashboard/admin/panel", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Full-page loader while verifying existing token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center">
        {/* Clouds */}
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

        {/* Loader */}
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
            Verifying session...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-yellow-100 overflow-hidden relative flex items-center justify-center">
      {/* Animated Clouds */}
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
      <motion.div
        className="absolute top-8 left-1/3 w-24 h-12 bg-white rounded-full opacity-50 blur-xl"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-36 left-2/3 w-36 h-14 bg-white rounded-full opacity-40 blur-xl"
        animate={{ x: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
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

      {/* Login Card */}
      <motion.div
        className="relative z-20 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="bg-black/40 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 shadow-2xl">
          {/* Shield Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/40 to-green-500/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-white font-bold text-2xl mb-1">Admin Access</h1>
            <p className="text-white/70 text-sm">Product Management Portal</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: 1,
                  x: [0, -10, 10, -10, 10, -5, 5, 0],
                }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{
                  x: { duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.3 },
                }}
                className="mb-6 bg-red-500/20 backdrop-blur-md border border-red-400/40 rounded-xl px-4 py-3"
              >
                <p className="text-red-200 text-sm text-center">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Admin ID Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Admin ID
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin ID"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/50 outline-none transition-all duration-300"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/30 focus:border-white/60 rounded-xl pl-11 pr-12 py-3 text-white placeholder-white/50 outline-none transition-all duration-300"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-white/60" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500/50 to-green-500/50 backdrop-blur-md border border-white/30 hover:border-white/50 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Back to Dashboard Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </motion.div>
        </div>

        {/* Subtle glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-[2rem] blur-2xl -z-10" />
      </motion.div>
    </div>
  );
};

export default AdminLogin;