'use client';

import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BookProps {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
}

export default function BookCard({ id, title, author, description, coverImage, pdfUrl }: BookProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative bg-charcoal-900 border border-charcoal-800 rounded-xl overflow-hidden hover:border-charcoal-600 transition-colors duration-300 flex flex-col h-full"
    >
      {/* Cover Image Area */}
      <div className="relative h-48 overflow-hidden bg-charcoal-800">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white leading-tight mb-1">{title}</h3>
          <p className="text-sm text-charcoal-400 font-medium">{author}</p>
        </div>

        <p className="text-charcoal-300 text-sm line-clamp-3 mb-6 flex-grow">
          {description}
        </p>

        {/* Action Button */}
        <Link
          href={`/read/${id}`}
          className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-100 text-sm font-medium rounded-lg transition-colors border border-charcoal-700 group-hover:border-charcoal-500"
        >
          <BookOpen size={16} />
          <span>Read Now</span>
        </Link>
      </div>
    </motion.div>
  );
}
