'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, BookOpen, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { storiesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const themes = [
  { id: 'adventure', name: 'Adventure', emoji: '🏔️' },
  { id: 'fantasy', name: 'Fantasy & Magic', emoji: '🧙‍♂️' },
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'friendship', name: 'Friendship', emoji: '🤝' },
  { id: 'nature', name: 'Nature', emoji: '🌳' },
  { id: 'space', name: 'Space & Science', emoji: '🚀' },
  { id: 'fairy-tales', name: 'Fairy Tales', emoji: '👸' },
  { id: 'bedtime', name: 'Bedtime', emoji: '🌙' },
];

const ageGroups = [
  { id: '3-5', name: 'Ages 3-5', desc: 'Simple words, short stories' },
  { id: '6-8', name: 'Ages 6-8', desc: 'Fun adventures, easy reading' },
  { id: '9-12', name: 'Ages 9-12', desc: 'Complex plots, rich vocabulary' },
];

export default function GenerateStoryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [pageCount, setPageCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!user?.is_subscribed) {
      toast.error('Premium subscription required');
      router.push('/pricing');
    }
  }, [isAuthenticated, user, router]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a story title');
      return;
    }
    if (!selectedTheme) {
      toast.error('Please select a theme');
      return;
    }
    if (!selectedAge) {
      toast.error('Please select an age group');
      return;
    }

    setIsGenerating(true);
    try {
      const story = await storiesAPI.generateStory({
        title,
        theme: selectedTheme,
        ageGroup: selectedAge,
        pageCount,
      });
      toast.success('Story created successfully! 🎉');
      router.push(`/stories/${story.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated || !user?.is_subscribed) {
    return (
      <main className="min-h-screen pt-20">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-gray-600 mb-2">Premium Feature</h2>
            <p className="text-gray-400">Upgrade to create custom stories</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-gradient-to-br from-lavender-50 to-candy-50">
      <Navbar />

      {/* Header */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-lavender-400 to-candy-400 rounded-3xl mb-6 shadow-xl">
              <Wand2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-gray-800 mb-4">
              Create Your Story ✨
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Use AI magic to generate a unique story just for your little one!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Generator Form */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            {/* Title Input */}
            <div className="mb-8">
              <label className="block font-display text-xl text-gray-800 mb-4">
                📝 Story Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Magical Rainbow Dragon"
                className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-lavender-400 focus:ring-4 focus:ring-lavender-100 outline-none transition-all"
              />
            </div>

            {/* Theme Selection */}
            <div className="mb-8">
              <label className="block font-display text-xl text-gray-800 mb-4">
                🎨 Choose a Theme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-lavender-400 bg-lavender-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{theme.emoji}</span>
                    <span className="text-sm font-semibold text-gray-700">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Selection */}
            <div className="mb-8">
              <label className="block font-display text-xl text-gray-800 mb-4">
                👶 Age Group
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ageGroups.map((age) => (
                  <button
                    key={age.id}
                    onClick={() => setSelectedAge(age.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedAge === age.id
                        ? 'border-candy-400 bg-candy-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-bold text-gray-800 block">{age.name}</span>
                    <span className="text-sm text-gray-500">{age.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Count */}
            <div className="mb-10">
              <label className="block font-display text-xl text-gray-800 mb-4">
                📄 Number of Pages: {pageCount}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-lavender-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>5 pages</span>
                <span>20 pages</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-glow flex items-center justify-center gap-3 bg-gradient-to-r from-lavender-500 to-candy-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-6 h-6 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6" />
                  Generate Story ✨
                </>
              )}
            </button>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <div className="text-4xl mb-4 animate-bounce">📚</div>
                <p className="text-gray-500">
                  Our AI is crafting a magical story just for you...
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  This may take up to a minute
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
