'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Maximize2, Minimize2 } from 'lucide-react';
import { storiesAPI } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ReadStoryPage() {
  const params = useParams();
  const storyId = Number(params.id);
  
  const [story, setStory] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStory = async () => {
      try {
        const data = await storiesAPI.getStory(storyId);
        setStory(data);
      } catch (err) {
        setError('Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };
    loadStory();
  }, [storyId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    window.open(`${API_URL}/stories/${storyId}/download`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">😕</div>
          <p>{error}</p>
          <Link href="/stories" className="text-candy-400 hover:underline mt-4 block">
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header Bar */}
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link
            href={`/stories/${storyId}`}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-gray-600" />
          <h1 className="font-semibold truncate max-w-[200px] sm:max-w-md">
            {story?.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 w-full">
        <iframe
          src={`${API_URL}/stories/${storyId}/view#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-full min-h-[calc(100vh-60px)]"
          title={story?.title}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}
