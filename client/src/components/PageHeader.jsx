import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, LogOut } from "lucide-react";
import veagLogo from "../assets/veag_logo.svg";

const PageHeader = ({
  currentUser,
  onSupportClick,
  onLogout,
  imageLoaded,
  imageError,
  onImageLoad,
  onImageError,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-20 bg-black/30 backdrop-blur-2xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* Logo and Title */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative w-12 h-12 rounded-full bg-white/20 border-2 border-white backdrop-blur-md flex items-center justify-center overflow-hidden">
              <img
                src={veagLogo}
                alt="VeAg Logo"
                className="w-10 h-10 object-contain rounded-full"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
              VeAg
            </h1>
          </motion.div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Support Button */}
            <motion.button
              onClick={onSupportClick}
              className="p-2 sm:p-2.5 bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Support"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>

            {/* User Profile */}
            {currentUser?.photoURL && !imageError ? (
              <div className="relative w-10 h-10">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full border border-white/30">
                    <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-full border-2 border-white/50 object-cover transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={onImageLoad}
                  onError={onImageError}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* User Name - Hidden on small screens */}
            <span className="text-white font-medium hidden sm:inline">
              {currentUser?.name}
            </span>

            {/* Logout Button */}
            <motion.button
              onClick={onLogout}
              className="p-2 sm:p-2.5 bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-full transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;