import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const mediaTypes: Record<string, string> = {
  'advaithamatrimony.mp4': 'video/mp4',
  'hero-video-description.vtt': 'text/vtt; charset=utf-8',
};

function mediaRoots() {
  return [
    process.env.ADVAITA_MEDIA_DIR,
    resolve(process.cwd(), 'frontend-preview', 'media'),
    resolve(process.cwd(), '..', 'frontend-preview', 'media'),
  ].filter((root): root is string => Boolean(root));
}

async function findMediaFile(asset: string) {
  for (const root of mediaRoots()) {
    const filePath = resolve(root, asset);
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isFile()) return { fileInfo, filePath };
    } catch {
      // Try the next supported repository/deployment location.
    }
  }
  return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const contentType = mediaTypes[asset];
  if (!contentType) return new Response('Not found', { status: 404 });

  const mediaFile = await findMediaFile(asset);
  if (!mediaFile) return new Response('Not found', { status: 404 });

  try {
    const { fileInfo, filePath } = mediaFile;
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

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(file, { headers });

    let start: number;
    let end: number;
    if (!match[1]) {
      const suffixLength = Number(match[2]);
      if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
        return new Response(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileInfo.size}` },
        });
      }
      start = Math.max(file.length - suffixLength, 0);
      end = file.length - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : file.length - 1;
    }

    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= file.length) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileInfo.size}` },
      });
    }

    end = Math.min(end, file.length - 1);
    const chunk = file.subarray(start, end + 1);
    headers.set('Content-Length', String(chunk.length));
    headers.set('Content-Range', `bytes ${start}-${end}/${fileInfo.size}`);
    return new Response(chunk, { status: 206, headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
