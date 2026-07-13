import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const Layout = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      // console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-veag-light-green via-white to-veag-light-green">
      {/* Header - Constant across all pages */}
      <div className="bg-gradient-to-r from-veag-dark-green to-veag-green shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1
              className="text-3xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/dashboard")}
            >
              VeAg
            </h1>
            <div className="flex items-center gap-6">
              {currentUser?.photoURL && !imageError ? (
                <div className="relative w-10 h-10">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-veag-light-green rounded-full">
                      <div className="w-6 h-6 border-3 border-veag-dark-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className={`w-10 h-10 rounded-full border-2 border-white object-cover transition-opacity duration-200 cursor-pointer hover:opacity-80 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    onClick={() => navigate("/edit-profile")}
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/edit-profile")}
                >
                  <span className="text-veag-dark-green font-bold text-lg">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-white font-medium">
                {currentUser?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-veag-dark-green font-semibold rounded-lg hover:bg-veag-light-green transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content - Changes based on route */}
      <div className="min-h-[calc(100vh-80px)]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;