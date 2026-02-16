import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'StoryLand - Magical Stories for Kids',
  description: 'Discover a world of enchanting stories crafted for young readers. AI-generated tales of adventure, friendship, and magic!',
  keywords: 'kids stories, children books, bedtime stories, fairy tales, educational stories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-body bg-gradient-to-br from-sky-50 via-lavender-50 to-candy-50 min-h-screen">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
