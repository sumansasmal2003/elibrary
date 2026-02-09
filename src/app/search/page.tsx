'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import BookCard from '@/components/BookCard';
import { Loader2, SearchX } from 'lucide-react';
import Link from 'next/link';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      if (!query) {
        setBooks([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setBooks(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-charcoal-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Searching library...</p>
      </div>
    );
  }

  if (!query) {
     return <div className="text-center text-charcoal-400 mt-20">Please enter a search term.</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Search Results for <span className="text-blue-400">"{query}"</span>
        </h1>
        <p className="text-charcoal-400 text-sm">
          Found {books.length} {books.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-charcoal-800 rounded-xl bg-charcoal-900/30">
          <SearchX size={48} className="text-charcoal-600 mb-4" />
          <h3 className="text-lg font-medium text-white">No books found</h3>
          <p className="text-charcoal-400 mb-6">Try checking your spelling or search for something else.</p>
          <Link
            href="/"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-lg text-sm transition-colors"
          >
            Clear Search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book._id}
              id={book._id}
              title={book.title}
              author={book.author}
              description={book.description}
              coverImage={book.coverImage}
              pdfUrl={book.pdfUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Wrap in Suspense for Next.js 13+ client-side search params handling
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
