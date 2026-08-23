import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const mediaTypes: Record<string, string> = {
  'advaithamatrimony.mp4': 'video/mp4',
  'hero-video-description.vtt': 'text/vtt; charset=utf-8',
};

export async function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const contentType = mediaTypes[asset];
  if (!contentType) return new Response('Not found', { status: 404 });

  const filePath = resolve(process.cwd(), '..', 'frontend-preview', 'media', asset);
  try {
    const fileInfo = await stat(filePath);
    const range = request.headers.get('range');
    const file = await readFile(filePath);
    const headers = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });

    if (!range || !asset.endsWith('.mp4')) {
      headers.set('Content-Length', String(file.length));
      return new Response(file, { headers });
    }

    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (!match) return new Response(file, { headers });
    const start = match[1] ? Number(match[1]) : 0;
    const requestedEnd = match[2] ? Number(match[2]) : file.length - 1;
    const end = Math.min(requestedEnd, file.length - 1);
    if (start > end || start >= file.length) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileInfo.size}` },
      });
    }

    const chunk = file.subarray(start, end + 1);
    headers.set('Content-Length', String(chunk.length));
    headers.set('Content-Range', `bytes ${start}-${end}/${fileInfo.size}`);
    return new Response(chunk, { status: 206, headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
