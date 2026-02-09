'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';

// Ensure the worker is loaded from a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  onPageChange?: (page: number, total: number) => void;
}

export default function PdfViewer({ url, onPageChange }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState(600);
  const [scale, setScale] = useState(1.0);

  // Data & Loading States
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0); // 0 to 100
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress(0);

        // Use our local proxy API
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
           const errText = await response.text().catch(() => response.statusText);
           throw new Error(errText || `Failed to load PDF: ${response.status}`);
        }

        // --- PROGRESS TRACKING LOGIC ---
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported in this browser.');

        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            chunks.push(value);
            loaded += value.length;
            if (total > 0 && active) {
              setLoadingProgress(Math.round((loaded / total) * 100));
            }
          }
        }

        // Combine chunks into a single Blob
        const blob = new Blob(chunks, { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        // -------------------------------

        if (active) {
            setPdfData(objectUrl);
            setLoadingProgress(100);
        }
      } catch (err: any) {
        if (active) {
            console.error("PDF Load Error:", err);
            setError(err.message || 'Could not load document');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (url) {
        fetchPdf();
    }

    return () => {
      active = false;
      if (pdfData) URL.revokeObjectURL(pdfData);
    };
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (onPageChange) onPageChange(1, numPages);
  }

  // Responsive Width
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(800, window.innerWidth - 32);
      setPageWidth(width);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changePage = (offset: number) => {
    const newPage = Math.min(Math.max(1, pageNumber + offset), numPages || 1);
    setPageNumber(newPage);
    if (onPageChange && numPages) onPageChange(newPage, numPages);
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2.5));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') changePage(1);
      if (e.key === 'ArrowLeft') changePage(-1);
      if (e.key === '=' || e.key === '+') handleZoom(0.1);
      if (e.key === '-') handleZoom(-0.1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-charcoal-400 gap-6 w-full max-w-md mx-auto px-6">
        {/* Percentage Text */}
        <div className="text-4xl font-bold text-white tabular-nums tracking-tight">
          {loadingProgress}%
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-white transition-all duration-200 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        <div className="text-center space-y-1">
            <p className="text-sm font-medium text-charcoal-200 animate-pulse">Loading the book...</p>
            <p className="text-xs text-charcoal-500">Large books may take a moment</p>
        </div>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-red-400 p-8 text-center border border-dashed border-charcoal-800 rounded-xl bg-charcoal-900/50">
        <AlertTriangle size={48} className="mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-white">Unable to Load PDF</h3>
        <p className="text-charcoal-400 text-sm mt-2 max-w-md break-words">{error}</p>
        <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-lg text-sm transition-colors"
        >
            Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh] relative">

      <div className="shadow-2xl shadow-black/50 overflow-hidden rounded-sm transition-transform duration-200 ease-out origin-top border border-charcoal-800">
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            /* This loader shows briefly while rendering the specific page after download */
            <div className="h-[60vh] flex items-center justify-center text-charcoal-500">
               <span className="animate-pulse">Rendering page...</span>
            </div>
          }
          error={
             <div className="text-red-400 p-10 text-center">Failed to render PDF page.</div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="bg-white"
          />
        </Document>
      </div>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-charcoal-900/95 backdrop-blur-xl border border-charcoal-700/50 px-6 py-3 rounded-full shadow-2xl z-50 transition-transform hover:scale-105">
        <div className="flex items-center gap-4">
            <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="text-charcoal-300 hover:text-white disabled:opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-500 rounded-full p-1"
            >
            <ChevronLeft size={24} />
            </button>
            <span className="text-white font-mono text-sm tracking-wider min-w-[60px] text-center select-none">
            {pageNumber} / {numPages || '--'}
            </span>
            <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            className="text-charcoal-300 hover:text-white disabled:opacity-20 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-500 rounded-full p-1"
            >
            <ChevronRight size={24} />
            </button>
        </div>

        <div className="h-6 w-px bg-charcoal-700"></div>

        <div className="flex items-center gap-3">
             <button
                onClick={() => handleZoom(-0.1)}
                className="text-charcoal-300 hover:text-white transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-charcoal-500 rounded-full p-1"
            >
                <ZoomOut size={20} />
            </button>
            <span className="text-charcoal-400 text-xs font-mono w-[3ch] text-center select-none">
                {Math.round(scale * 100)}%
            </span>
            <button
                onClick={() => handleZoom(0.1)}
                className="text-charcoal-300 hover:text-white transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-charcoal-500 rounded-full p-1"
            >
                <ZoomIn size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}
