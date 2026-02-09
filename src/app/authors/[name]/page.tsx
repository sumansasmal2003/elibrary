'use client';

import { useEffect, useState, use } from 'react';
import BookCard from '@/components/BookCard';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Book {
  _id: string;
  title: string;
  titleBn?: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
}

export default function AuthorDetailsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params); // Unwrap params
  const authorName = decodeURIComponent(name); // Handle URL encoding (e.g., %20 -> space)

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch books filtered by this specific author
        const res = await fetch(`/api/books?author=${encodeURIComponent(authorName)}`);
        const data = await res.json();
        if (data.success) {
          setBooks(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch author books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [authorName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-charcoal-400">
        <Loader2 className="animate-spin mr-2" /> Loading Books...
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link
            href="/authors"
            className="inline-flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors mb-4 text-sm font-medium"
        >
            <ArrowLeft size={16} /> Back to Authors
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">{authorName}</h1>
        <div className="flex items-center gap-2 text-charcoal-400 text-sm">
            <BookOpen size={16} />
            <span>{books.length} {books.length === 1 ? 'Book' : 'Books'} available</span>
        </div>
      </div>

      {/* Grid of Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard
            key={book._id}
            id={book._id}
            title={book.title}
            titleBn={book.titleBn}
            author={book.author}
            description={book.description}
            coverImage={book.coverImage}
            pdfUrl={book.pdfUrl}
          />
        ))}
      </div>

      {books.length === 0 && (
        <div className="py-20 text-center border border-dashed border-charcoal-800 rounded-xl">
           <p className="text-charcoal-500">No books found for this author.</p>
        </div>
      )}
    </div>
  );
}
