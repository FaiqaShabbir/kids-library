'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  BookOpen, 
  Download, 
  Heart, 
  Crown,
  Lock,
  MessageCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { storiesAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Story {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
  pdf_url?: string;
  page_count: number;
  age_group?: string;
  theme?: string;
  is_premium: boolean;
  is_featured: boolean;
  read_count: number;
  average_rating?: number;
  created_at: string;
}

interface Rating {
  id: number;
  rating: number;
  comment?: string;
  user_name?: string;
  created_at: string;
}

const themeEmojis: Record<string, string> = {
  adventure: '🏔️',
  fantasy: '🧙‍♂️',
  animals: '🐾',
  friendship: '🤝',
  nature: '🌳',
  space: '🚀',
  'fairy-tales': '👸',
  bedtime: '🌙',
};

const themeGradients: Record<string, string> = {
  adventure: 'from-orange-400 to-red-500',
  fantasy: 'from-purple-400 to-pink-500',
  animals: 'from-green-400 to-teal-500',
  friendship: 'from-pink-400 to-rose-500',
  nature: 'from-emerald-400 to-green-500',
  space: 'from-indigo-400 to-blue-500',
  'fairy-tales': 'from-pink-400 to-purple-500',
  bedtime: 'from-blue-400 to-indigo-500',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getCoverUrl = (story: Story): string | null => {
  if (story.cover_image_url) {
    return `${API_URL}/stories/${story.id}/cover`;
  }
  return `https://picsum.photos/seed/${story.title.replace(/\s/g, '')}/800/400`;
};

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [story, setStory] = useState<Story | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const storyId = Number(params.id);

  useEffect(() => {
    const loadStory = async () => {
      try {
        const [storyData, ratingsData] = await Promise.all([
          storiesAPI.getStory(storyId),
          storiesAPI.getStoryRatings(storyId),
        ]);
        setStory(storyData);
        setRatings(ratingsData);
      } catch (error) {
        console.error('Failed to load story:', error);
        // Demo data
        setStory({
          id: storyId,
          title: 'The Brave Little Star',
          author: 'StoryLand AI',
          description: 'A small star learns that even the tiniest light can make a big difference in someone\'s life. This heartwarming tale teaches children about self-worth and the impact of kindness.',
          page_count: 5,
          age_group: '3-5',
          theme: 'friendship',
          is_premium: false,
          is_featured: true,
          read_count: 1234,
          average_rating: 4.8,
          created_at: '2024-01-15',
        });
        setRatings([
          { id: 1, rating: 5, comment: 'My daughter loves this story!', user_name: 'Happy Mom', created_at: '2024-01-20' },
          { id: 2, rating: 5, comment: 'Beautiful message about being yourself.', user_name: 'Teacher Sarah', created_at: '2024-01-18' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStory();
  }, [storyId]);

  const handleDownload = () => {
    const downloadUrl = storiesAPI.downloadStory(storyId);
    window.open(downloadUrl, '_blank');
    toast.success('Download started!');
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }

    try {
      const result = await storiesAPI.toggleFavorite(storyId);
      setIsFavorite(result.is_favorite);
      toast.success(result.message);
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to rate stories');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmittingRating(true);
    try {
      await storiesAPI.rateStory(storyId, userRating, userComment);
      toast.success('Thank you for your review!');
      // Refresh ratings
      const newRatings = await storiesAPI.getStoryRatings(storyId);
      setRatings(newRatings);
      setUserRating(0);
      setUserComment('');
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-20">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📖</div>
            <p className="text-gray-500">Loading story...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="min-h-screen pt-20">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="font-display text-2xl text-gray-600 mb-4">Story not found</h2>
            <Link href="/stories" className="text-candy-500 hover:underline">
              Back to Library
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const gradient = themeGradients[story.theme || 'adventure'] || 'from-candy-400 to-lavender-500';
  const emoji = themeEmojis[story.theme || 'adventure'] || '📖';

  return (
    <main className="min-h-screen pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${gradient} py-20 overflow-hidden`}>
        {/* Cover Image Background */}
        {story.cover_image_url && (
          <div className="absolute inset-0">
            <img
              src={getCoverUrl(story) || ''}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 text-8xl opacity-20">{emoji}</div>
          <div className="absolute bottom-10 left-10 text-6xl opacity-20">{emoji}</div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {story.is_premium && (
                <span className="premium-badge px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              )}
              {story.is_featured && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  Featured
                </span>
              )}
              {story.age_group && (
                <span className={`age-badge age-badge-${story.age_group}`}>
                  Ages {story.age_group}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
              {story.title}
            </h1>

            {/* Author & Stats */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <span>By {story.author}</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {story.page_count} pages
              </span>
              {story.average_rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white" />
                  {story.average_rating} ({ratings.length} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {story.read_count.toLocaleString()} reads
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-2xl text-gray-800 mb-4">About This Story</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {story.description}
                </p>

                {/* Theme tag */}
                {story.theme && (
                  <div className="mb-8">
                    <span className="text-sm text-gray-500">Theme:</span>
                    <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-semibold">
                      {emoji} {story.theme.charAt(0).toUpperCase() + story.theme.slice(1)}
                    </span>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="mt-12">
                  <h2 className="font-display text-2xl text-gray-800 mb-6 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-candy-500" />
                    Reviews
                  </h2>

                  {/* Submit Review */}
                  {isAuthenticated && (
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                      <h3 className="font-semibold text-gray-700 mb-4">Leave a Review</h3>
                      
                      {/* Star Rating */}
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="star"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= userRating
                                  ? 'text-sunshine-500 fill-sunshine-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Share your thoughts about this story..."
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-candy-300 focus:ring-2 focus:ring-candy-100 outline-none resize-none"
                        rows={3}
                      />

                      <button
                        onClick={handleSubmitRating}
                        disabled={isSubmittingRating}
                        className="mt-4 bg-candy-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-candy-600 transition-colors disabled:opacity-50"
                      >
                        {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {ratings.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
                    ) : (
                      ratings.map((rating) => (
                        <div key={rating.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < rating.rating
                                      ? 'text-sunshine-500 fill-sunshine-500'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-600 font-semibold">{rating.user_name}</span>
                          </div>
                          {rating.comment && (
                            <p className="text-gray-500">{rating.comment}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-28 bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
              >
                {/* Read Now Button */}
                <Link
                  href={`/read/${story.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-candy-500 to-lavender-500 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all mb-3"
                >
                  <BookOpen className="w-5 h-5" />
                  Read Now
                </Link>

                {/* Download Button */}
                {story.is_premium && !user?.is_subscribed ? (
                  <Link
                    href="/pricing"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sunshine-400 to-orange-400 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all mb-4"
                  >
                    <Lock className="w-5 h-5" />
                    Unlock with Premium
                  </Link>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 border-2 border-candy-300 text-candy-500 py-4 rounded-full font-bold hover:bg-candy-50 transition-all mb-4"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                )}

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold border-2 transition-all mb-6 ${
                    isFavorite
                      ? 'bg-candy-50 border-candy-300 text-candy-500'
                      : 'border-gray-200 text-gray-600 hover:border-candy-200 hover:text-candy-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-candy-500' : ''}`} />
                  {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                </button>

                {/* Story Info */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pages</span>
                    <span className="font-semibold text-gray-700">{story.page_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age Group</span>
                    <span className="font-semibold text-gray-700">{story.age_group || 'All ages'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Theme</span>
                    <span className="font-semibold text-gray-700 capitalize">{story.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Reads</span>
                    <span className="font-semibold text-gray-700">{story.read_count.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
