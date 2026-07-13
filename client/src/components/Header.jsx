import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentUser?.photoURL]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="bg-gradient-to-r from-veag-dark-green to-veag-green shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <h1
            className="text-3xl font-bold text-white cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            VeAg
          </h1>
          <div className="flex items-center gap-6">
            {currentUser?.photoURL && !imageError ? (
              <div className="relative w-10 h-10">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-veag-light-green rounded-full">
                    <div className="w-6 h-6 border-3 border-veag-dark-green border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-full border-2 border-white object-cover transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => {
                    // console.log('Image loaded successfully:', currentUser.photoURL);
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    // console.error('Image failed to load:', currentUser.photoURL, e);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center">
                <span className="text-veag-dark-green font-bold text-lg">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-white font-medium">{currentUser?.name}</span>
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
  );
};

export default Header;