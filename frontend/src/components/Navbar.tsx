'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Menu, X, User, Crown, LogOut, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    authAPI.logout();
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg shadow-lg shadow-candy-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Book className="w-10 h-10 text-candy-500" />
              <Sparkles className="w-4 h-4 text-sunshine-400 absolute -top-1 -right-1 animate-sparkle" />
            </motion.div>
            <span className="font-display text-2xl bg-gradient-to-r from-candy-500 via-lavender-500 to-sky-500 bg-clip-text text-transparent">
              StoryLand
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/stories"
              className="text-gray-600 hover:text-candy-500 font-semibold transition-colors"
            >
              📚 Library
            </Link>
            <Link
              href="/themes"
              className="text-gray-600 hover:text-lavender-500 font-semibold transition-colors"
            >
              🎨 Themes
            </Link>
            {isAuthenticated && user?.is_subscribed && (
              <Link
                href="/generate"
                className="text-gray-600 hover:text-mint-500 font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Create Story
              </Link>
            )}
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-sunshine-500 font-semibold transition-colors"
            >
              ⭐ Premium
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.is_subscribed && (
                  <span className="premium-badge px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Premium
                  </span>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-candy-500 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{user?.full_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-candy-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-candy-500 font-semibold transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn-glow bg-gradient-to-r from-candy-400 to-lavender-400 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-candy-200 hover:shadow-xl hover:shadow-candy-300 transition-all"
                >
                  Start Free ✨
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                href="/stories"
                className="block text-gray-600 hover:text-candy-500 font-semibold py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                📚 Library
              </Link>
              <Link
                href="/themes"
                className="block text-gray-600 hover:text-lavender-500 font-semibold py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                🎨 Themes
              </Link>
              <Link
                href="/pricing"
                className="block text-gray-600 hover:text-sunshine-500 font-semibold py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                ⭐ Premium
              </Link>
              <hr className="border-gray-100" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block text-gray-600 font-semibold py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block text-candy-500 font-semibold py-2"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-600 font-semibold py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-gradient-to-r from-candy-400 to-lavender-400 text-white text-center py-3 rounded-full font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Free ✨
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
