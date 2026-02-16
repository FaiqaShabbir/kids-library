'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, BookOpen, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import StoryCard from '@/components/StoryCard';
import { storiesAPI } from '@/lib/api';

interface Story {
  id: number;
  title: string;
  description?: string;
  cover_image_url?: string;
  age_group?: string;
  theme?: string;
  is_premium: boolean;
  is_featured: boolean;
  read_count: number;
  average_rating?: number;
}

const themes = [
  { id: 'adventure', name: 'Adventure', emoji: '🏔️', color: 'from-orange-400 to-red-500' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙‍♂️', color: 'from-purple-400 to-pink-500' },
  { id: 'animals', name: 'Animals', emoji: '🐾', color: 'from-green-400 to-teal-500' },
  { id: 'friendship', name: 'Friendship', emoji: '🤝', color: 'from-pink-400 to-rose-500' },
  { id: 'space', name: 'Space', emoji: '🚀', color: 'from-indigo-400 to-blue-500' },
  { id: 'bedtime', name: 'Bedtime', emoji: '🌙', color: 'from-blue-400 to-indigo-500' },
];

export default function HomePage() {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const stories = await storiesAPI.getFeaturedStories();
        setFeaturedStories(stories);
      } catch (error) {
        console.error('Failed to load stories:', error);
        // Use demo data if API fails
        setFeaturedStories([
          {
            id: 1,
            title: 'The Brave Little Star',
            description: 'A small star learns that even the tiniest light can make a big difference.',
            age_group: '3-5',
            theme: 'friendship',
            is_premium: false,
            is_featured: true,
            read_count: 1234,
            average_rating: 4.8,
          },
          {
            id: 2,
            title: "Luna's Magical Garden",
            description: 'Luna discovers a secret garden where flowers can talk!',
            age_group: '6-8',
            theme: 'nature',
            is_premium: false,
            is_featured: true,
            read_count: 892,
            average_rating: 4.9,
          },
          {
            id: 3,
            title: "Captain Whiskers' Adventure",
            description: 'A house cat dreams of being a sea captain.',
            age_group: '6-8',
            theme: 'adventure',
            is_premium: false,
            is_featured: true,
            read_count: 756,
            average_rating: 4.7,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Stories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl text-gray-800 mb-4">
              ✨ Featured Stories
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Hand-picked tales loved by thousands of young readers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-80 skeleton" />
              ))
            ) : (
              featuredStories.slice(0, 3).map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} />
              ))
            )}
          </div>

          <div className="text-center">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-candy-500 font-bold text-lg hover:text-candy-600 transition-colors group"
            >
              View All Stories
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section className="py-20 bg-gradient-to-b from-white to-lavender-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl md:text-5xl text-gray-800 mb-4">
              🎨 Browse by Theme
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Find the perfect story for every mood and moment
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/stories?theme=${theme.id}`}
                  className={`block bg-gradient-to-br ${theme.color} p-6 rounded-2xl text-center hover:scale-105 transition-transform shadow-lg`}
                >
                  <span className="text-4xl block mb-2">{theme.emoji}</span>
                  <span className="text-white font-bold">{theme.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-lavender-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-gray-800 mb-4">
              Why Parents Love StoryLand
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Engaging Stories',
                description: 'AI-crafted tales that spark imagination and teach valuable lessons.',
                color: 'candy',
              },
              {
                icon: Shield,
                title: 'Safe & Appropriate',
                description: 'All content is carefully reviewed to be age-appropriate and educational.',
                color: 'mint',
              },
              {
                icon: Users,
                title: 'For All Ages',
                description: 'Stories tailored for ages 3-5, 6-8, and 9-12 with appropriate complexity.',
                color: 'lavender',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-xl text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-${feature.color}-100 mb-6`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-500`} />
                </div>
                <h3 className="font-display text-2xl text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-candy-500 via-lavender-500 to-sky-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-6 animate-sparkle" />
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              Ready for Story Time?
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of families who make bedtime magical with StoryLand!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="bg-white text-candy-500 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                Start Free Today ✨
              </Link>
              <Link
                href="/stories"
                className="text-white border-2 border-white/50 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Browse Stories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
