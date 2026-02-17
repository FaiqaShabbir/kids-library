'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, BookOpen, Crown, Heart } from 'lucide-react';
import { useState } from 'react';

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

interface StoryCardProps {
  story: Story;
  index?: number;
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

// Generate a themed cover image URL
const getCoverImageUrl = (story: Story): string => {
  // If story has a custom cover, use the backend endpoint
  if (story.cover_image_url) {
    return `${API_URL}/stories/${story.id}/cover`;
  }
  
  // Use Lorem Picsum for placeholder images (consistent based on title)
  return `https://picsum.photos/seed/${story.title.replace(/\s/g, '')}/400/300`;
};

export default function StoryCard({ story, index = 0 }: StoryCardProps) {
  const gradient = themeGradients[story.theme || 'adventure'] || 'from-candy-400 to-lavender-500';
  const emoji = themeEmojis[story.theme || 'adventure'] || '📖';
  const [imageError, setImageError] = useState(false);
  
  const coverUrl = getCoverImageUrl(story);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="story-card group"
    >
      <Link href={`/stories/${story.id}`}>
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-candy-200/30 transition-all duration-300">
          {/* Cover Image */}
          <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
            {/* Background Image */}
            {!imageError && (
              <img
                src={coverUrl}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                onError={() => setImageError(true)}
              />
            )}
            
            {/* Gradient overlay for text readability */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20`} />
            
            {/* Fallback emoji if image fails */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl opacity-40 group-hover:opacity-60 transition-opacity">
                  {emoji}
                </span>
              </div>
            )}
            
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display text-lg text-white drop-shadow-lg line-clamp-2">
                {story.title}
              </h3>
            </div>
            
            {/* Premium badge */}
            {story.is_premium && (
              <div className="absolute top-4 left-4 premium-badge px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
            
            {/* Featured badge */}
            {story.is_featured && !story.is_premium && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 text-sunshine-500 fill-sunshine-500" />
                Featured
              </div>
            )}
            
            {/* Age group badge */}
            {story.age_group && (
              <div className={`absolute top-4 right-4 age-badge age-badge-${story.age_group} shadow-lg`}>
                Ages {story.age_group}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
              {story.description || 'A magical story awaits...'}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {/* Theme badge */}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 capitalize">
                  {emoji} {story.theme || 'story'}
                </span>
                
                {/* Read count */}
                <div className="flex items-center gap-1 text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{story.read_count.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Rating or Favorite */}
              <div className="flex items-center gap-2">
                {story.average_rating && (
                  <div className="flex items-center gap-1 text-sunshine-500">
                    <Star className="w-4 h-4 fill-sunshine-500" />
                    <span className="font-semibold text-xs">{story.average_rating}</span>
                  </div>
                )}
                <button 
                  className="p-1.5 hover:bg-candy-50 rounded-full transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Toggle favorite
                  }}
                >
                  <Heart className="w-4 h-4 text-gray-300 hover:text-candy-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
