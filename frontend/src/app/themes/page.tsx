'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const themes = [
  { 
    id: 'adventure', 
    name: 'Adventure', 
    emoji: '🏔️',
    gradient: 'from-orange-400 to-red-500',
    description: 'Exciting journeys, brave heroes, and thrilling discoveries await!',
    storyCount: 18,
  },
  { 
    id: 'fantasy', 
    name: 'Fantasy & Magic', 
    emoji: '🧙‍♂️',
    gradient: 'from-purple-400 to-pink-500',
    description: 'Wizards, magical creatures, and enchanted worlds!',
    storyCount: 24,
  },
  { 
    id: 'animals', 
    name: 'Animals', 
    emoji: '🐾',
    gradient: 'from-green-400 to-teal-500',
    description: 'Furry friends, talking animals, and wild adventures!',
    storyCount: 21,
  },
  { 
    id: 'friendship', 
    name: 'Friendship', 
    emoji: '🤝',
    gradient: 'from-pink-400 to-rose-500',
    description: 'Stories about making friends and sticking together!',
    storyCount: 16,
  },
  { 
    id: 'nature', 
    name: 'Nature & Environment', 
    emoji: '🌳',
    gradient: 'from-emerald-400 to-green-500',
    description: 'Learn about our beautiful planet and how to protect it!',
    storyCount: 12,
  },
  { 
    id: 'space', 
    name: 'Space & Science', 
    emoji: '🚀',
    gradient: 'from-indigo-400 to-blue-500',
    description: 'Blast off to explore the stars and learn cool science!',
    storyCount: 15,
  },
  { 
    id: 'fairy-tales', 
    name: 'Fairy Tales', 
    emoji: '👸',
    gradient: 'from-pink-400 to-purple-500',
    description: 'Classic tales with princes, princesses, and happy endings!',
    storyCount: 20,
  },
  { 
    id: 'bedtime', 
    name: 'Bedtime Stories', 
    emoji: '🌙',
    gradient: 'from-blue-400 to-indigo-500',
    description: 'Calm, soothing stories perfect for drifting off to sleep!',
    storyCount: 22,
  },
];

export default function ThemesPage() {
  return (
    <main className="min-h-screen pt-20">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-lavender-400 via-candy-400 to-sky-400 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
              🎨 Story Themes
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Choose a theme that matches your mood and dive into magical worlds!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/stories?theme=${theme.id}`}>
                  <div className={`group relative bg-gradient-to-br ${theme.gradient} rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2`}>
                    {/* Content */}
                    <div className="relative z-10 p-6 text-white">
                      <span className="text-6xl block mb-4 group-hover:scale-110 transition-transform">
                        {theme.emoji}
                      </span>
                      <h3 className="font-display text-xl mb-2">{theme.name}</h3>
                      <p className="text-white/80 text-sm mb-4">
                        {theme.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                          {theme.storyCount} stories
                        </span>
                        <span className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all">
                          Explore →
                        </span>
                      </div>
                    </div>
                    
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl text-gray-800 mb-4">
              Can't find what you're looking for? ✨
            </h2>
            <p className="text-gray-500 mb-8">
              Premium members can create custom stories in any theme they imagine!
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-lavender-500 to-candy-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              ✨ Create Custom Story
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
