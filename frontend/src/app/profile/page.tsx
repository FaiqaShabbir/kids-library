'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Crown, Settings, BookOpen, Heart, Star, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authAPI, subscriptionAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [userData, subStatus] = await Promise.all([
          authAPI.getCurrentUser(),
          subscriptionAPI.getStatus().catch(() => null),
        ]);
        setUser(userData);
        setSubscriptionStatus(subStatus);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, setUser]);

  const handleLogout = () => {
    authAPI.logout();
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await subscriptionAPI.cancel();
      toast.success('Subscription cancelled');
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <main className="min-h-screen pt-20">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">👤</div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-candy-400 to-lavender-400 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <User className="w-12 h-12 text-candy-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white mb-1">
                {user?.full_name || 'Story Explorer'}
              </h1>
              <p className="text-white/80">{user?.email}</p>
              {user?.is_subscribed && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm font-semibold">
                  <Crown className="w-4 h-4" />
                  Premium Member
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-sunshine-500" />
                <h2 className="font-display text-xl text-gray-800">Subscription</h2>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-500 mb-2">Current Plan</p>
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {user?.subscription_tier || 'Free'} {user?.is_subscribed && '✨'}
                </p>
              </div>

              {subscriptionStatus?.features && (
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4 text-mint-500" />
                    {subscriptionStatus.features.stories_per_month === -1 
                      ? 'Unlimited stories' 
                      : `${subscriptionStatus.features.stories_per_month} stories/month`}
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 text-lavender-500" />
                    {subscriptionStatus.features.can_download ? 'PDF downloads enabled' : 'No PDF downloads'}
                  </li>
                </ul>
              )}

              {user?.is_subscribed ? (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-candy-300 hover:text-candy-500 transition-all"
                >
                  Cancel Subscription
                </button>
              ) : (
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-candy-500 to-lavender-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Upgrade to Premium 👑
                </button>
              )}
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-candy-500" />
                <h2 className="font-display text-xl text-gray-800">Reading Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-candy-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-candy-600">12</div>
                  <div className="text-sm text-candy-400">Stories Read</div>
                </div>
                <div className="bg-lavender-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-lavender-600">5</div>
                  <div className="text-sm text-lavender-400">Favorites</div>
                </div>
                <div className="bg-sunshine-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-sunshine-600">8</div>
                  <div className="text-sm text-sunshine-400">Reviews</div>
                </div>
                <div className="bg-mint-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-mint-600">3</div>
                  <div className="text-sm text-mint-400">Generated</div>
                </div>
              </div>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-gray-500" />
                <h2 className="font-display text-xl text-gray-800">Account Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-700">Email</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                  </div>
                  <button className="text-candy-500 font-semibold hover:underline">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-700">Password</p>
                    <p className="text-gray-500 text-sm">••••••••</p>
                  </div>
                  <button className="text-candy-500 font-semibold hover:underline">
                    Update
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-500 hover:text-candy-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
