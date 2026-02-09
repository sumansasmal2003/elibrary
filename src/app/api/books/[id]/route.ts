import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Update type to Promise
) {
  await dbConnect();
  try {
    const { id } = await params; // 2. Await the params object

    const book = await Book.findById(id);

    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 400 });
  }
}
