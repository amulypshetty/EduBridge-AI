export function isExamplePlaceholderUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  return /^https?:\/\/([^/]+\.)?example\.com(\/|$|\?|#)/i.test(trimmed);
}

export function isValidResourceUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/pdfs/') && trimmed.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractYouTubeId(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live', 'v'].includes(parts[0]) && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getYouTubeEmbedUrl(rawUrl) {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}

export function getYouTubeThumbnailUrl(rawUrl) {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function detectResourceType(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return 'link';

  if (extractYouTubeId(trimmed) || /vimeo\.com\/\d+/i.test(trimmed)) {
    return 'video';
  }

  const withoutQuery = trimmed.split('?')[0].split('#')[0].toLowerCase();
  if (withoutQuery.endsWith('.pdf') || trimmed.toLowerCase().startsWith('/pdfs/')) {
    return 'pdf';
  }

  return 'link';
}

export function getSafeResourceHref(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('/')) {
    try {
      return encodeURI(decodeURI(trimmed));
    } catch {
      return encodeURI(trimmed);
    }
  }
  return trimmed;
}
