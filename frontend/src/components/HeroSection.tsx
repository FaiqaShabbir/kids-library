'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Star, Wand2 } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-magic-pattern">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating clouds */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-20 bg-white/60 rounded-full blur-sm"
          animate={{ x: [0, 30, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 right-20 w-40 h-24 bg-white/50 rounded-full blur-sm"
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${10 + Math.random() * 60}%`,
              left: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ⭐
          </motion.div>
        ))}
        
        {/* Floating book emoji */}
        <motion.div
          className="absolute top-1/4 right-1/4 text-6xl"
          animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          📚
        </motion.div>
        
        {/* Magic wand */}
        <motion.div
          className="absolute bottom-1/4 left-1/5 text-5xl"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🪄
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8"
          >
            <Sparkles className="w-5 h-5 text-sunshine-500" />
            <span className="text-sm font-semibold text-gray-600">
              AI-Powered Stories for Children
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl mb-6"
          >
            <span className="block text-gray-800">Where Stories</span>
            <span className="rainbow-text">Come Alive!</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10"
          >
            Discover magical tales crafted for young dreamers. 
            <br className="hidden md:block" />
            Adventure, fantasy, and friendship await! ✨
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/stories"
              className="btn-glow group flex items-center gap-2 bg-gradient-to-r from-candy-500 to-lavender-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-candy-300/40 hover:shadow-2xl hover:shadow-candy-400/50 transition-all"
            >
              <BookOpen className="w-5 h-5 group-hover:animate-wiggle" />
              Explore Stories
            </Link>
            <Link
              href="/pricing"
              className="group flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-sunshine-300"
            >
              <Star className="w-5 h-5 text-sunshine-500 group-hover:animate-spin" />
              Get Premium
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl text-candy-500">100+</div>
              <div className="text-sm text-gray-500">Stories</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl text-lavender-500">50K+</div>
              <div className="text-sm text-gray-500">Readers</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl text-sunshine-500">4.9</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="white"
            d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
