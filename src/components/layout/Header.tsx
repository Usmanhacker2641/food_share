import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add scroll listener to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { name: 'Home', path: '/' },
      { name: 'Browse', path: '/browse' },
    ];

    if (!isAuthenticated) return baseItems;

    // Add role-specific nav items
    if (user?.role === 'donor') {
      baseItems.push({ name: 'Donate', path: '/donate' });
    }

    if (user?.role === 'rider') {
      baseItems.push({ name: 'Rider Dashboard', path: '/rider-dashboard' });
    }

    if (user?.role === 'admin') {
      baseItems.push({ name: 'Admin Dashboard', path: '/admin' });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-primary-700 transition-colors hover:text-primary-600"
          >
            <Leaf className="h-7 w-7" />
            <span className="text-xl font-semibold">FoodShare</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      'text-neutral-700 transition-colors hover:text-primary-600',
                      isActive && 'font-medium text-primary-700'
                    )}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                    isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-600'
                  )}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </NavLink>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="rounded-lg px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="rounded-lg bg-secondary-500 px-4 py-2 text-white transition-colors hover:bg-secondary-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex items-center justify-center rounded-lg p-2 text-neutral-700 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg md:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav>
                <ul className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => cn(
                          'block w-full rounded-lg p-3 transition-colors',
                          isActive 
                            ? 'bg-primary-100 font-medium text-primary-700'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        )}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <li>
                        <NavLink
                          to="/profile"
                          className={({ isActive }) => cn(
                            'flex items-center gap-2 rounded-lg p-3 transition-colors',
                            isActive 
                              ? 'bg-primary-100 font-medium text-primary-700'
                              : 'text-neutral-700 hover:bg-neutral-50'
                          )}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </NavLink>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-lg p-3 text-left text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/login"
                          className="block w-full rounded-lg p-3 text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/register"
                          className="block w-full rounded-lg bg-secondary-500 p-3 text-center text-white transition-colors hover:bg-secondary-600"
                        >
                          Register
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;