import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderOpen, Plus, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';

// Routes where bottom navbar should be visible
const NAVBAR_ROUTES = [
  '/dashboard',
  '/manage-cases',
  '/register-case',
  '/dashboard/products',
  '/edit-profile',
  '/manage-subscription',
];

const isNavbarVisible = (pathname) => {
  // Check exact matches
  if (NAVBAR_ROUTES.includes(pathname)) return true;
  // Check /case/:caseId pattern
  if (pathname.startsWith('/case/')) return true;
  return false;
};

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/manage-cases', label: 'Cases', icon: FolderOpen },
  { path: '/register-case', label: 'New Case', icon: Plus, isCenter: true },
  { path: '/dashboard/products', label: 'Shop', icon: ShoppingBag },
  { path: '/edit-profile', label: 'Profile', icon: User },
];

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const visible = isNavbarVisible(location.pathname);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Detect virtual keyboard opening to hide navbar
  useEffect(() => {
    const handleFocusIn = (e) => {
      const tagName = e.target.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!visible) return null;
  if (isKeyboardOpen) return <div className="bottom-navbar-spacer" />;

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed navbar */}
      <div className="bottom-navbar-spacer" />

      <nav className="bottom-navbar-container" id="bottom-navbar">
        <div className="bottom-navbar-glass">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  id="bottom-nav-new-case"
                  className="bottom-navbar-center-btn"
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                >
                  <motion.div
                    className="bottom-navbar-center-orb"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon size={24} strokeWidth={2.5} />
                  </motion.div>
                  <span className="bottom-navbar-center-label">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                id={`bottom-nav-${item.label.toLowerCase()}`}
                className={`bottom-navbar-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                <motion.div
                  className="bottom-navbar-icon-wrap"
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {active && (
                    <motion.div
                      className="bottom-navbar-active-pill"
                      layoutId="bottomNavActivePill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className="bottom-navbar-icon" />
                </motion.div>
                <span className="bottom-navbar-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavbar;

