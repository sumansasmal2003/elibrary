import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

/**
 * Creates a "Fuzzy" Regular Expression for Bengali.
 * Instead of translating "a" -> "আ", it translates "a" -> "(অ|আ|া|Empty)".
 * This allows "Aranyak" to match "আরণ্যক", "আরন্যক", or even "অরণ্যক".
 */
function createFuzzyBengaliRegex(input: string): RegExp {
  const str = input.toLowerCase().replace(/\s+/g, '.*'); // Allow flexible spacing
  let regexStr = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1] || "";
    const pair = char + next;

    // 1. Handle Digraphs (Two-letter sounds)
    // We skip the next iteration (i++) if we match a pair
    if (pair === "sh") { regexStr += "(শ|ষ|স)"; i++; continue; }
    if (pair === "th") { regexStr += "(থ|ঠ)"; i++; continue; }
    if (pair === "ph") { regexStr += "(ফ)"; i++; continue; }
    if (pair === "gh") { regexStr += "(ঘ)"; i++; continue; }
    if (pair === "kh") { regexStr += "(খ|ক্ষ)"; i++; continue; }
    if (pair === "dh") { regexStr += "(ধ|ঢ)"; i++; continue; }
    if (pair === "ch") { regexStr += "(চ|ছ)"; i++; continue; }
    if (pair === "bh") { regexStr += "(ভ)"; i++; continue; }
    if (pair === "jh") { regexStr += "(ঝ)"; i++; continue; }
    if (pair === "ng") { regexStr += "(ং|ঙ)"; i++; continue; }

    // 2. Handle Single Characters (Flexible Mapping)
    switch (char) {
      case 'a':
        // 'a' can be 'অ', 'আ', 'া' (akar), or implied (empty)
        regexStr += "(অ|আ|া|)";
        break;
      case 'e':
        regexStr += "(এ|ে|ই|ি)";
        break;
      case 'i':
        regexStr += "(ই|ঈ|ি|ী|ৈ)";
        break;
      case 'o':
        regexStr += "(ও|ো|অ|ৌ|ু)";
        break;
      case 'u':
        regexStr += "(উ|ঊ|ু|ূ)";
        break;
      case 'k': regexStr += "(ক|খ)"; break;
      case 'g': regexStr += "(গ)"; break;
      case 'c': regexStr += "(চ|ক|স)"; break; // c can sound like k or s
      case 'j': regexStr += "(জ|য|্জ)"; break;
      case 't': regexStr += "(ট|ত|ৎ|ঃ)"; break;
      case 'd': regexStr += "(ড|দ)"; break;
      case 'n':
        // Important for Aranyak: n matches 'ন' OR 'ণ' OR 'ঞ'
        regexStr += "(ন|ণ|ঞ|ঙ|ং)";
        break;
      case 'p': regexStr += "(প)"; break;
      case 'f': regexStr += "(ফ)"; break;
      case 'b': regexStr += "(ব|ভ)"; break;
      case 'm': regexStr += "(ম)"; break;
      case 'r':
        // 'r' can be 'র', 'ড়', or 'reph' (ref) or 'rikara'
        regexStr += "(র|ড়|ঢ়|ৃ|্র|র্)";
        break;
      case 'l': regexStr += "(ল)"; break;
      case 's': regexStr += "(স|শ|ষ)"; break;
      case 'h': regexStr += "(হ|ঃ)"; break;
      case 'y':
        // Important for Aranyak: y matches 'য়' OR 'Jofola' (্য)
        regexStr += "(য়|য|্য)";
        break;
      case 'v': regexStr += "(ভ|ব)"; break;
      case 'w': regexStr += "(ব|ও)"; break;
      case 'z': regexStr += "(জ|য)"; break;
      default: regexStr += char; // Numbers or symbols kept as is
    }
  }

  // Return a Regex that is case insensitive
  try {
    return new RegExp(regexStr, 'i');
  } catch (e) {
    // Fallback if regex fails (e.g. invalid chars)
    return new RegExp(input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('q');

  if (!rawQuery) {
    return NextResponse.json({ success: true, data: [] });
  }

  await dbConnect();

  try {
    // 1. Create a Standard Regex for English matches
    const englishRegex = new RegExp(rawQuery, 'i');

    // 2. Create a "Fuzzy" Regex for Bengali matches
    // This turns "Aranyak" into something like /(অ|আ|া|)(র...)(ন|ণ...)(য়|য|্য)(...)(ক...)/
    const fuzzyBengaliRegex = createFuzzyBengaliRegex(rawQuery);

    console.log(`Query: ${rawQuery} -> Fuzzy Regex: ${fuzzyBengaliRegex.source}`);

    const books = await Book.find({
      $or: [
        // English Title
        { title: { $regex: englishRegex } },
        // Bengali Title (Using Fuzzy Match)
        { title: { $regex: fuzzyBengaliRegex } },
        // Author
        { author: { $regex: englishRegex } },
        { author: { $regex: fuzzyBengaliRegex } },
      ],
    }).limit(20);

    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
