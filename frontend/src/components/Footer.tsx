'use client';

import Link from 'next/link';
import { Book, Heart, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-lavender-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Book className="w-8 h-8 text-candy-500" />
              <span className="font-display text-2xl bg-gradient-to-r from-candy-500 to-lavender-500 bg-clip-text text-transparent">
                StoryLand
              </span>
            </Link>
            <p className="text-gray-500 mb-6 max-w-md">
              Magical stories for little dreamers. We create enchanting tales that inspire imagination, 
              teach valuable lessons, and make bedtime an adventure! ✨
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Twitter className="w-5 h-5 text-sky-400" />
              </a>
              <a href="#" className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Instagram className="w-5 h-5 text-candy-500" />
              </a>
              <a href="#" className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <Youtube className="w-5 h-5 text-red-500" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-gray-800 mb-4">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/stories" className="text-gray-500 hover:text-candy-500 transition-colors">
                  📚 Story Library
                </Link>
              </li>
              <li>
                <Link href="/themes" className="text-gray-500 hover:text-candy-500 transition-colors">
                  🎨 Browse Themes
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-candy-500 transition-colors">
                  ⭐ Premium Plan
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-candy-500 transition-colors">
                  💝 About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg text-gray-800 mb-4">Help</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-candy-500 transition-colors">
                  ❓ FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-candy-500 transition-colors">
                  📧 Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-candy-500 transition-colors">
                  🔒 Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-candy-500 transition-colors">
                  📜 Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-lavender-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} StoryLand. Made with{' '}
              <Heart className="w-4 h-4 inline text-candy-400 fill-candy-400" /> for little readers.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🌍 Safe for children worldwide</span>
              <span>•</span>
              <span>🔒 COPPA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
