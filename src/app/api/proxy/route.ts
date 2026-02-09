import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // Create a custom agent that ignores SSL certificate errors
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  try {
    // We use a promise wrapper around the native https.get request
    // so we can use it with async/await and cleaner streaming
    const fetchWithNoSSL = (url: string): Promise<Response> => {
      return new Promise((resolve, reject) => {
        const req = https.get(url, { agent }, (res) => {

          // Convert the IncomingMessage (stream) to a Web Response object
          // This allows us to pass it directly to NextResponse
          const headers = new Headers();
          for (const [key, value] of Object.entries(res.headers)) {
            if (Array.isArray(value)) {
              value.forEach(v => headers.append(key, v));
            } else if (value) {
              headers.set(key, value);
            }
          }

          // Force standard CORS headers for your frontend
          headers.set('Access-Control-Allow-Origin', '*');
          headers.set('Content-Type', res.headers['content-type'] || 'application/pdf');

          // Create the response object with the stream
          // @ts-ignore - The Readable stream type is compatible in runtime
          const response = new Response(res, {
            status: res.statusCode,
            headers: headers
          });

          resolve(response);
        });

        req.on('error', (err) => reject(err));
        req.end();
      });
    };

    const externalResponse = await fetchWithNoSSL(url);

    if (!externalResponse.ok) {
       return NextResponse.json(
        { error: `Failed to fetch external resource: ${externalResponse.statusText}` },
        { status: externalResponse.status }
      );
    }

    return new NextResponse(externalResponse.body, {
      status: 200,
      headers: externalResponse.headers,
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
