import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  full_name?: string;
  is_subscribed: boolean;
  subscription_tier: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

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

interface StoryState {
  stories: Story[];
  featuredStories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  setStories: (stories: Story[]) => void;
  setFeaturedStories: (stories: Story[]) => void;
  setCurrentStory: (story: Story | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  featuredStories: [],
  currentStory: null,
  isLoading: false,
  setStories: (stories) => set({ stories }),
  setFeaturedStories: (stories) => set({ featuredStories: stories }),
  setCurrentStory: (story) => set({ currentStory: story }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
