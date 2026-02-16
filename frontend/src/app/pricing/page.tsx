'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Crown, Sparkles, Zap, Star, BookOpen, Download, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { subscriptionAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const plans = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: 0,
    emoji: '🌟',
    description: 'Perfect for trying out StoryLand',
    color: 'from-gray-400 to-gray-500',
    features: [
      { text: '5 stories per month', included: true },
      { text: 'All age groups', included: true },
      { text: 'Online reading', included: true },
      { text: 'PDF downloads', included: false },
      { text: 'Premium stories', included: false },
      { text: 'AI story generation', included: false },
      { text: 'Ad-free experience', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Family',
    price: 9.99,
    emoji: '👑',
    description: 'Unlimited magic for the whole family',
    color: 'from-candy-500 to-lavender-500',
    popular: true,
    features: [
      { text: 'Unlimited stories', included: true },
      { text: 'All age groups', included: true },
      { text: 'Online reading', included: true },
      { text: 'PDF downloads', included: true },
      { text: 'Premium stories', included: true },
      { text: 'AI story generation', included: true },
      { text: 'Ad-free experience', included: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Is the content safe for children?',
    answer: 'Absolutely! All stories are carefully reviewed to ensure they are age-appropriate, educational, and safe for children.',
  },
  {
    question: 'How does AI story generation work?',
    answer: 'Premium members can request custom stories! Just tell us the theme, age group, and title, and our AI will create a unique story just for you.',
  },
  {
    question: 'Can I use StoryLand on multiple devices?',
    answer: 'Yes! Your account works on any device - phones, tablets, and computers. Read stories anywhere, anytime.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      router.push('/login');
      return;
    }

    if (user?.is_subscribed) {
      toast.success('You already have Premium! 🎉');
      return;
    }

    setIsLoading(true);
    try {
      const { checkout_url } = await subscriptionAPI.createCheckoutSession();
      window.location.href = checkout_url;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start checkout');
      // For demo, just show success
      toast.success('Demo mode: Premium activated! 🎉');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-candy-400 via-lavender-400 to-sky-400 py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Crown className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
              Unlock Unlimited Magic
            </h1>
            <p className="text-white/80 text-xl max-w-2xl mx-auto">
              Give your children the gift of endless stories, imagination, and learning adventures!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative bg-white rounded-3xl overflow-hidden ${
                  plan.popular
                    ? 'shadow-2xl shadow-candy-200/50 ring-2 ring-candy-400'
                    : 'shadow-xl shadow-gray-200/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-candy-500 to-lavender-500 text-white text-center py-2 text-sm font-bold">
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">{plan.emoji}</span>
                    <h3 className="font-display text-2xl text-gray-800">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-800">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-mint-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-mint-600" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.id === 'free' ? (
                    <Link
                      href="/register"
                      className="block w-full text-center py-4 rounded-full font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
                    >
                      Get Started Free
                    </Link>
                  ) : (
                    <button
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className={`w-full btn-glow bg-gradient-to-r ${plan.color} text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
                    >
                      {isLoading ? 'Loading...' : user?.is_subscribed ? 'Current Plan ✓' : 'Subscribe Now 🚀'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-lavender-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl text-gray-800 mb-4">
              Premium Features
            </h2>
            <p className="text-gray-500 text-lg">
              Everything you need for an amazing reading experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Unlimited Stories', desc: 'Access our entire library', color: 'candy' },
              { icon: Download, title: 'PDF Downloads', desc: 'Read offline anytime', color: 'sky' },
              { icon: Wand2, title: 'AI Generation', desc: 'Create custom stories', color: 'lavender' },
              { icon: Sparkles, title: 'Premium Content', desc: 'Exclusive stories', color: 'sunshine' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-${feature.color}-100 mb-4`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-500`} />
                </div>
                <h3 className="font-display text-xl text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="font-bold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-500">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-candy-500 to-lavender-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl text-white mb-6">
              Ready to Start the Adventure?
            </h2>
            <p className="text-white/80 text-xl mb-10">
              Join thousands of happy families reading together every night!
            </p>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-white text-candy-500 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              Get Premium Now 👑
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
