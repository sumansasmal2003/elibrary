'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, Users, Library } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Hide Navbar on reader pages
  if (pathname.startsWith('/read/')) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper to check active state
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-charcoal-200 transition-colors flex-shrink-0"
        >
          <Library className="text-blue-500" size={24} />
          <span>E-Library</span>
        </Link>

        {/* Desktop Search Bar (Centered) */}
        <form onSubmit={handleSearch} className="flex-grow max-w-md hidden md:block relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-charcoal-400 group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-charcoal-700 rounded-full leading-5 bg-charcoal-800 text-charcoal-100 placeholder-charcoal-400 focus:outline-none focus:bg-charcoal-900 focus:border-charcoal-500 focus:ring-1 focus:ring-charcoal-500 sm:text-sm transition-all shadow-sm"
            placeholder="Search books, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Authors Link */}
          <Link
            href="/authors"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/authors')
                ? 'bg-charcoal-800 text-white'
                : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800/50'
            }`}
          >
            <Users size={18} />
            <span className="hidden sm:inline">Authors</span>
          </Link>

          {/* Add Book Button (Primary Action) */}
          <Link
            href="/add-book"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-charcoal-100 text-charcoal-950 hover:bg-white transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Book</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar (Visible only on small screens) */}
      <div className="md:hidden px-4 pb-3">
         <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-charcoal-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-charcoal-700 rounded-lg leading-5 bg-charcoal-800 text-charcoal-100 placeholder-charcoal-400 focus:outline-none focus:bg-charcoal-900 focus:border-charcoal-500 focus:ring-1 focus:ring-charcoal-500 text-sm shadow-inner"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
      </div>
    </nav>
  );
}
