'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const benefits = [
  'Access to 100+ magical stories',
  'Download stories as PDFs',
  'Save favorites & track progress',
  'Age-appropriate content',
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.register(email, password, fullName);
      await authAPI.login(email, password);
      const user = await authAPI.getCurrentUser();
      setUser(user);
      toast.success('Welcome to StoryLand! 🎉');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Benefits Panel */}
          <div className="hidden lg:flex flex-col justify-center">
            <h2 className="font-display text-3xl text-gray-800 mb-6">
              Join thousands of families! 🌟
            </h2>
            <p className="text-gray-500 mb-8">
              Create your free account and unlock a world of magical stories for your little ones.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-mint-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-mint-600" />
                  </div>
                  <span className="text-gray-600">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* Decorative illustration */}
            <div className="mt-12 text-center">
              <div className="text-8xl">📚✨</div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-candy-100/50 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-candy-400 to-lavender-400 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-3xl text-gray-800 mb-2">Create Account</h1>
              <p className="text-gray-500">Start your magical reading adventure</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-candy-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-candy-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                    required
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-candy-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <p className="text-sm text-gray-400">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-candy-500 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-candy-500 hover:underline">Privacy Policy</Link>.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-glow bg-gradient-to-r from-candy-500 to-lavender-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-candy-200 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Free Account 🚀'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-candy-500 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
