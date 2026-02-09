'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/BookCard';
import { Loader2 } from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.success) {
          setBooks(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-charcoal-400" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Library Collection</h2>
        <p className="text-charcoal-400">Explore our curated list of digital books.</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-charcoal-800 rounded-xl">
          <p className="text-charcoal-400">No books found. Why not add one?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              id={book._id}
              key={book._id}
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
