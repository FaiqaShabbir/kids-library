'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  { id: '', name: 'All Themes', emoji: '📚' },
  { id: 'adventure', name: 'Adventure', emoji: '🏔️' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙‍♂️' },
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'friendship', name: 'Friendship', emoji: '🤝' },
  { id: 'nature', name: 'Nature', emoji: '🌳' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'bedtime', name: 'Bedtime', emoji: '🌙' },
];

const ageGroups = [
  { id: '', name: 'All Ages' },
  { id: '3-5', name: 'Ages 3-5' },
  { id: '6-8', name: 'Ages 6-8' },
  { id: '9-12', name: 'Ages 9-12' },
];

function StoriesContent() {
  const searchParams = useSearchParams();
  const initialTheme = searchParams.get('theme') || '';
  
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedAge, setSelectedAge] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      try {
        const response = await storiesAPI.getStories({
          page: currentPage,
          pageSize,
          ageGroup: selectedAge || undefined,
          theme: selectedTheme || undefined,
        });
        setStories(response.stories);
        setTotalPages(Math.ceil(response.total / pageSize));
      } catch (error) {
        console.error('Failed to load stories:', error);
        // Demo data
        setStories([
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
          {
            id: 4,
            title: "The Dragon Who Couldn't Breathe Fire",
            description: 'A young dragon learns that being different is a superpower.',
            age_group: '6-8',
            theme: 'fantasy',
            is_premium: true,
            is_featured: false,
            read_count: 543,
            average_rating: 4.9,
          },
          {
            id: 5,
            title: 'The Friendship Rocket',
            description: 'Two best friends build a rocket and learn about teamwork.',
            age_group: '9-12',
            theme: 'space',
            is_premium: false,
            is_featured: true,
            read_count: 421,
            average_rating: 4.6,
          },
          {
            id: 6,
            title: 'The Sleepy Cloud',
            description: 'A tired little cloud learns the importance of rest.',
            age_group: '3-5',
            theme: 'bedtime',
            is_premium: false,
            is_featured: true,
            read_count: 987,
            average_rating: 4.8,
          },
        ]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, [currentPage, selectedTheme, selectedAge]);

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pt-20">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-candy-400 via-lavender-400 to-sky-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
              📚 Story Library
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Explore our magical collection of stories for young readers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none transition-all"
              />
            </div>

            {/* Theme Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedTheme === theme.id
                      ? 'bg-candy-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {theme.emoji} {theme.name}
                </button>
              ))}
            </div>

            {/* Age Filter */}
            <div className="flex gap-2">
              {ageGroups.map((age) => (
                <button
                  key={age.id}
                  onClick={() => {
                    setSelectedAge(age.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedAge === age.id
                      ? 'bg-lavender-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {age.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-3xl h-80 skeleton" />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="font-display text-2xl text-gray-600 mb-2">No stories found</h3>
              <p className="text-gray-400">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStories.map((story, index) => (
                  <StoryCard key={story.id} story={story} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full font-semibold transition-all ${
                          currentPage === i + 1
                            ? 'bg-candy-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-20">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-2xl">Loading...</div>
        </div>
      </main>
    }>
      <StoriesContent />
    </Suspense>
  );
}
