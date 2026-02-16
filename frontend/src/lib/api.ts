import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, fullName?: string) => {
    const response = await api.post('/users/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/users/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    if (response.data.access_token) {
      Cookies.set('token', response.data.access_token, { expires: 7 });
    }
    
    return response.data;
  },

  logout: () => {
    Cookies.remove('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Stories API
export const storiesAPI = {
  getStories: async (params?: {
    page?: number;
    pageSize?: number;
    ageGroup?: string;
    theme?: string;
    featuredOnly?: boolean;
  }) => {
    const response = await api.get('/stories/', { params });
    return response.data;
  },

  getFeaturedStories: async () => {
    const response = await api.get('/stories/featured');
    return response.data;
  },

  getStory: async (id: number) => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
  },

  getThemes: async () => {
    const response = await api.get('/stories/themes');
    return response.data;
  },

  toggleFavorite: async (storyId: number) => {
    const response = await api.post(`/stories/${storyId}/favorite`);
    return response.data;
  },

  rateStory: async (storyId: number, rating: number, comment?: string) => {
    const response = await api.post(`/stories/${storyId}/rate`, {
      story_id: storyId,
      rating,
      comment,
    });
    return response.data;
  },

  getStoryRatings: async (storyId: number) => {
    const response = await api.get(`/stories/${storyId}/ratings`);
    return response.data;
  },

  generateStory: async (data: {
    title: string;
    ageGroup: string;
    theme: string;
    pageCount?: number;
  }) => {
    const response = await api.post('/stories/generate', {
      title: data.title,
      age_group: data.ageGroup,
      theme: data.theme,
      page_count: data.pageCount || 10,
    });
    return response.data;
  },

  downloadStory: (storyId: number) => {
    return `${API_URL}/stories/${storyId}/download`;
  },

  viewStory: (storyId: number) => {
    return `${API_URL}/stories/${storyId}/view`;
  },
};

// Subscription API
export const subscriptionAPI = {
  createCheckoutSession: async () => {
    const response = await api.post('/subscriptions/create-checkout-session');
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  cancel: async () => {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },
};

export default api;
