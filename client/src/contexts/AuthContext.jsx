import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getToken } from "firebase/app-check";
import { auth, googleProvider, appCheck } from "../config/firebase";
import axios from "axios";

const AuthContext = createContext();

const CACHE_KEY = "veag_auth_user";
const CACHE_EXPIRY_DAYS = 7;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get cached user data
  const getCachedUser = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { user, timestamp } = JSON.parse(cached);
        const now = new Date().getTime();
        const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (now - timestamp < expiryTime) {
          return user;
        } else {
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem("veag_jwt_token");
        }
      }
    } catch (error) {
      // console.error('Error reading cached user:', error);
    }
    return null;
  };

  // Cache user data
  const cacheUser = (user) => {
    try {
      const cacheData = {
        user,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      // console.error('Error caching user:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Force refresh to get the latest photoURL from Firebase
      await user.reload();
      const freshUser = auth.currentUser;

      // Send user data to backend
      const userData = {
        email: freshUser.email,
        name: freshUser.displayName,
        photoURL: freshUser.photoURL,
        firebaseUid: freshUser.uid,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/auth`,
        userData,
      );

      if (response.data.token) {
        localStorage.setItem("veag_jwt_token", response.data.token);
      }

      // Use data from database but keep fresh photoURL from Firebase
      const userWithId = {
        email: response.data.user.email,
        name: response.data.user.name,
        photoURL: freshUser.photoURL, // Use fresh photoURL from Firebase
        firebaseUid: response.data.user.firebaseUid,
        userId: response.data.userId,
      };

      cacheUser(userWithId);
      setCurrentUser(userWithId);

      return userWithId;
    } catch (error) {
      // console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem("veag_jwt_token");
      setCurrentUser(null);
    } catch (error) {
      // console.error('Error signing out:', error);
      throw error;
    }
  };

  // Update user name in context and cache
  const updateUserName = (newName) => {
    const updatedUser = { ...currentUser, name: newName };
    setCurrentUser(updatedUser);
    cacheUser(updatedUser);
  };

  useEffect(() => {
    // Setup Axios Interceptors
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem("veag_jwt_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (appCheck) {
          try {
            const appCheckTokenResponse = await getToken(appCheck, false);
            if (appCheckTokenResponse.token) {
              config.headers["X-Firebase-AppCheck"] =
                appCheckTokenResponse.token;
            }
          } catch (err) {
            // Network error fetching app check token. Do not log out!
          }
        }

        return config;
      },
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          try {
            await firebaseSignOut(auth);
          } catch (e) {}
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem("veag_jwt_token");
          setCurrentUser(null);
        }
        return Promise.reject(error);
      },
    );

    const verifyServerToken = async (cachedUser) => {
      try {
        const token = localStorage.getItem("veag_jwt_token");
        if (!token) {
          // Only clear if there's genuinely no token
          throw new Error("No token");
        }

        // Since interceptors are active, this will have the Bearer token
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/verify`,
        );
        if (response.data.valid) {
          // Use the user data from server (it might be fresher)
          const verifiedUser = {
            ...response.data.user,
            photoURL: auth.currentUser?.photoURL || cachedUser.photoURL,
          };
          setCurrentUser(verifiedUser);
          cacheUser(verifiedUser);
        }
      } catch (error) {
        // ONLY log out if the server specifically rejected the token (401/403) or no token was found
        // The Axios interceptor already handles 401s, but we'll be safe here.
        // We MUST NOT log out on network errors, 500s, or timeouts (e.g. server waking up)
        if (
          error.message === "No token" ||
          (error.response &&
            (error.response.status === 401 || error.response.status === 403))
        ) {
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem("veag_jwt_token");
          setCurrentUser(null);
          try {
            await firebaseSignOut(auth);
          } catch (e) {}
        } else {
          // On network error or server error, we keep the user logged in with cached data
          // console.warn('Server verification failed but keeping session alive:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Check for cached user first
    const cached = getCachedUser();
    if (cached && localStorage.getItem("veag_jwt_token")) {
      setCurrentUser(cached); // optimistic UI
      verifyServerToken(cached); // Wait for server to verify token
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Force refresh to get the latest photoURL from Firebase
          await user.reload();
          const freshUser = auth.currentUser;

          const userData = {
            email: freshUser.email,
            name: freshUser.displayName,
            photoURL: freshUser.photoURL,
            firebaseUid: freshUser.uid,
          };

          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/users/auth`,
            userData,
          );

          if (response.data.token) {
            localStorage.setItem("veag_jwt_token", response.data.token);
          }

          // Use data from database but keep fresh photoURL from Firebase
          const userWithId = {
            email: response.data.user.email,
            name: response.data.user.name,
            photoURL: freshUser.photoURL, // Use fresh photoURL from Firebase
            firebaseUid: response.data.user.firebaseUid,
            userId: response.data.userId,
          };

          cacheUser(userWithId);
          setCurrentUser(userWithId);
        } catch (error) {
          // console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem("veag_jwt_token");
      }
      setLoading(false);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    updateUserName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};