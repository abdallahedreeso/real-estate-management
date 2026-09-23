export function ownedImagePaths(urls, userId) {
  if (!userId) return [];
  return (urls || []).flatMap((url) => {
    try {
      const parsed = new URL(url);
      const bucketUrl = new URL(import.meta.env.VITE_SUPABASE_URL);
      const prefix = "/storage/v1/object/public/images/";
      if (parsed.origin !== bucketUrl.origin || !parsed.pathname.startsWith(prefix)) return [];
      const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
      return path.startsWith(`${userId}/`) ? [path] : [];
    } catch { return []; }
  });
}
