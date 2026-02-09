'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2, XCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => <div className="h-screen"></div>,
});

interface Book {
  title: string;
  pdfUrl: string;
}

export default function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ current: 1, total: 0 });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${id}`);
        const data = await res.json();
        if (data.success) setBook(data.data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Disable Right Click
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextmenu);
    return () => document.removeEventListener('contextmenu', handleContextmenu);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-charcoal-950">
        <Loader2 className="animate-spin text-charcoal-400" size={32} />
      </div>
    );
  }

  if (!book) return <div className="text-center p-10 text-white">Book not found</div>;

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col select-none print:hidden">

      {/* CUSTOM READER NAVBAR
        This replaces the global navbar. It uses the same height (h-16) and styling
        to look seamless, but displays the Book Title instead of "E-Library".
      */}
      <nav className="fixed left-0 top-0 w-full h-16 border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md z-40 flex items-center justify-between px-4 sm:px-8">

        {/* Left: Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-charcoal-800 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="hidden sm:inline font-medium text-sm">Library</span>
        </Link>

        {/* Center: Book Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <BookOpen size={16} className="text-charcoal-500 hidden sm:block" />
          <h1 className="text-white font-semibold text-sm sm:text-base max-w-[200px] sm:max-w-md truncate">
            {book.title}
          </h1>
        </div>

        {/* Right: Progress Indicator */}
        <div className="text-xs sm:text-sm font-mono text-charcoal-400">
           {pageInfo.total > 0 ? `${Math.round((pageInfo.current / pageInfo.total) * 100)}% read` : ''}
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Add top padding (pt-20) to account for the fixed navbar */}
      <main className="flex-grow pt-24 px-4 w-full flex justify-center">
        <div className="w-full max-w-5xl relative">
            {/* Security Overlay */}
            <div className="absolute inset-0 z-10 w-full h-full" onContextMenu={(e) => e.preventDefault()} />

            <PdfViewer
              url={book.pdfUrl}
              onPageChange={(c, t) => setPageInfo({ current: c, total: t })}
            />
        </div>
      </main>

      <style jsx global>{`
        body { user-select: none; }
        @media print { body { display: none; } }
        /* Hide scrollbar for cleaner look */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #141416; }
        ::-webkit-scrollbar-thumb { background: #35353c; rounded: 4px; }
      `}</style>
    </div>
  );
}
