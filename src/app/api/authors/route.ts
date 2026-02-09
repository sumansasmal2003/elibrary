import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET() {
  await dbConnect();
  try {
    // Aggregate to group by author and count books
    const authors = await Book.aggregate([
      {
        $group: {
          _id: "$author",
          count: { $sum: 1 },
          // Optional: Get the first cover image of the author's books to use as a thumbnail
          image: { $first: "$coverImage" }
        }
      },
      { $sort: { _id: 1 } } // Sort alphabetically
    ]);

    return NextResponse.json({ success: true, data: authors });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch authors' }, { status: 500 });
  }
}
