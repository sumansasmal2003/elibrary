'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Loader2,
  Book,
  User,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import BookCard from '@/components/BookCard'; // We reuse your existing card for the preview!

export default function AddBook() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    pdfUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to add book');

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4 animate-fade-in-down">
        <Link
          href="/"
          className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-charcoal-400 hover:text-white hover:border-charcoal-600 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Add New Book</h1>
          <p className="text-charcoal-400">Expand the collection with a new read.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">

        {/* LEFT COLUMN: The Form (Takes up 2/3 space on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-charcoal-900/50 border border-charcoal-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Row 1: Title & Author */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 ml-1">Title</label>
                  <div className="relative group">
                    <Book className="absolute left-4 top-3.5 text-charcoal-500 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. The Hobbit"
                      className="w-full bg-charcoal-950/50 border border-charcoal-800 rounded-xl pl-11 pr-4 py-3 text-charcoal-100 placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all hover:border-charcoal-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 ml-1">Author</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-charcoal-500 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="e.g. J.R.R. Tolkien"
                      className="w-full bg-charcoal-950/50 border border-charcoal-800 rounded-xl pl-11 pr-4 py-3 text-charcoal-100 placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all hover:border-charcoal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 ml-1">Description</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-3.5 text-charcoal-500 group-focus-within:text-white transition-colors" size={18} />
                  <textarea
                    required
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief summary of the book..."
                    className="w-full bg-charcoal-950/50 border border-charcoal-800 rounded-xl pl-11 pr-4 py-3 text-charcoal-100 placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all hover:border-charcoal-700 resize-none"
                  />
                </div>
              </div>

              {/* Row 2: URLs */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 ml-1">Cover Image URL</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-3.5 text-charcoal-500 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      required
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-charcoal-950/50 border border-charcoal-800 rounded-xl pl-11 pr-4 py-3 text-charcoal-100 placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all hover:border-charcoal-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 ml-1">PDF URL</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-4 top-3.5 text-charcoal-500 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      required
                      type="url"
                      name="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-charcoal-950/50 border border-charcoal-800 rounded-xl pl-11 pr-4 py-3 text-charcoal-100 placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:border-transparent transition-all hover:border-charcoal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Error & Submit */}
              {error && (
                <div className="p-4 rounded-xl bg-red-900/10 border border-red-900/20 text-red-400 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-charcoal-200 text-charcoal-950 font-bold py-4 px-6 rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Saving to Library...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Publish Book</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="hidden lg:block space-y-6 sticky top-24">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
            <p className="text-charcoal-400 text-sm mb-4">See how it looks in the grid.</p>
          </div>

          <div className="pointer-events-none opacity-90 transform scale-100 transition-all duration-500">
             {/* We mock the ID since it doesn't exist yet */}
            <BookCard
              id="preview"
              title={formData.title || "Untitled Book"}
              author={formData.author || "Unknown Author"}
              description={formData.description || "No description provided yet."}
              coverImage={formData.coverImage || "https://placehold.co/400x600/2b2b30/white?text=Cover+Image"}
              pdfUrl="#"
            />
          </div>

          <div className="bg-charcoal-900/30 rounded-xl p-4 border border-charcoal-800/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <LinkIcon size={16} />
              </div>
              <div className="text-xs text-charcoal-400 leading-relaxed">
                <strong className="text-charcoal-200 block mb-1">Tip:</strong>
                Ensure your PDF URL allows CORS if hosted externally, or host it in your public folder.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
