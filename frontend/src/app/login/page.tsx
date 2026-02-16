'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.login(email, password);
      const user = await authAPI.getCurrentUser();
      setUser(user);
      toast.success('Welcome back! 🎉');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 bg-gradient-to-br from-candy-50 via-lavender-50 to-sky-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-candy-100/50 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-candy-400 to-lavender-400 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-3xl text-gray-800 mb-2">Welcome Back!</h1>
              <p className="text-gray-500">Sign in to continue your magical journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-candy-500 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-glow bg-gradient-to-r from-candy-500 to-lavender-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-candy-200 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In ✨'}
              </button>
            </form>

            {/* Demo Account */}
            <div className="mt-6 p-4 bg-lavender-50 rounded-xl">
              <p className="text-sm text-lavender-700 font-semibold mb-1">Demo Account:</p>
              <p className="text-sm text-lavender-600">
                Email: demo@storyland.com<br />
                Password: demo123
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="text-candy-500 font-semibold hover:underline">
                Sign Up Free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
