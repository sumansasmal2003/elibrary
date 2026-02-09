import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

// GET: Fetch all books
export async function GET(request: NextRequest) {
  await dbConnect();

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const author = searchParams.get('author');

  try {
    // If 'author' param exists, filter by it. Otherwise, return all.
    const query = author ? { author: author } : {};

    const books = await Book.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}

// POST: Add a new book
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const book = await Book.create(body);
    return NextResponse.json({ success: true, data: book }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}
