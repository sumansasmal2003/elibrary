'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Users, Book as BookIcon, ChevronRight } from 'lucide-react';

interface AuthorData {
  _id: string; // The author's name
  count: number;
  image: string;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch('/api/authors');
        const data = await res.json();
        if (data.success) {
          setAuthors(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch authors', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-charcoal-400">
        <Loader2 className="animate-spin mr-2" /> Loading Authors...
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-charcoal-800 rounded-xl text-white">
            <Users size={24} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white">Authors</h1>
            <p className="text-charcoal-400 text-sm">Browse the library by writer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {authors.map((author) => (
          <Link
            key={author._id}
            href={`/authors/${encodeURIComponent(author._id)}`}
            className="group relative bg-charcoal-900 border border-charcoal-800 rounded-xl overflow-hidden hover:border-charcoal-600 hover:bg-charcoal-800 transition-all duration-300 flex items-center p-4 gap-4"
          >
            {/* Avatar / Thumbnail */}
            <div className="w-16 h-16 rounded-full bg-charcoal-950 border border-charcoal-700 overflow-hidden flex-shrink-0">
               {author.image ? (
                   <img src={author.image} alt={author._id} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
               ) : (
                   <div className="w-full h-full flex items-center justify-center text-charcoal-600">
                       <Users size={20} />
                   </div>
               )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <h3 className="text-white font-medium text-lg truncate pr-2 group-hover:text-blue-400 transition-colors">
                {author._id}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mt-1">
                <BookIcon size={12} />
                <span>{author.count} {author.count === 1 ? 'Book' : 'Books'}</span>
              </div>
            </div>

            {/* Arrow Icon */}
            <ChevronRight size={16} className="text-charcoal-600 group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>

      {authors.length === 0 && (
          <div className="text-center py-20 text-charcoal-500">
              No authors found.
          </div>
      )}
    </div>
  );
}
