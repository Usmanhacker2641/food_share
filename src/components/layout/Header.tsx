import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, User, Bell, Heart } from 'lucide-react';
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-3 transition-all duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                FoodShare
              </span>
              <span className="text-xs text-neutral-500 -mt-1">Share • Care • Impact</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      'relative px-4 py-2 rounded-xl font-medium transition-all duration-300',
                      isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/50'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {item.name}
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                            layoutId="activeTab"
                            initial={{ width: 0 }}
                            animate={{ width: '80%' }}
                            style={{ x: '-50%' }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-secondary-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Profile */}
                <NavLink
                  to="/profile"
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-300',
                    isActive 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg' 
                      : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-600'
                  )}
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </NavLink>

                {/* Logout */}
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-neutral-700 transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="rounded-xl px-6 py-2 font-medium text-neutral-700 transition-all duration-300 hover:bg-neutral-50"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-2 font-medium text-white transition-all duration-300 hover:shadow-glow"
                >
                  <span className="relative z-10">Register</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex items-center justify-center rounded-xl p-2 text-neutral-700 md:hidden hover:bg-primary-50 transition-colors"
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
            className="bg-white/95 backdrop-blur-lg shadow-lg md:hidden border-t border-neutral-200"
          >
            <div className="container mx-auto px-4 py-6">
              <nav>
                <ul className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => cn(
                          'block w-full rounded-xl p-4 transition-all duration-300',
                          isActive 
                            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium shadow-lg'
                            : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-600'
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
                            'flex items-center gap-3 rounded-xl p-4 transition-all duration-300',
                            isActive 
                              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium shadow-lg'
                              : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-600'
                          )}
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </NavLink>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-neutral-700 transition-all duration-300 hover:bg-neutral-50"
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
                          className="block w-full rounded-xl p-4 text-neutral-700 transition-all duration-300 hover:bg-neutral-50"
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/register"
                          className="block w-full rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 p-4 text-center text-white font-medium transition-all duration-300 hover:shadow-glow"
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