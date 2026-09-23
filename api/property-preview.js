import { readFile } from "node:fs/promises";

const shell = readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const siteOrigin = (request) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (domain) return `https://${domain}`;
  const host = request.headers.host;
  return /^localhost(?::\d+)?$/.test(host || "") ? `http://${host}` : "https://real-estate-management-mu.vercel.app";
};

const publicPhoto = (value, fallback) => {
  try {
    const image = new URL(value);
    const storage = new URL(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    return image.protocol === "https:" && image.host === storage.host && image.pathname.startsWith("/storage/v1/object/public/") ? image.href : fallback;
  } catch { return fallback; }
};

async function loadProperty(id) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const endpoint = new URL("/rest/v1/properties", url);
  endpoint.searchParams.set("select", "title,description,address,state,images,is_available");
  endpoint.searchParams.set("property_id", `eq.${id}`);
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) return null;
  const [property] = await response.json();
  return property?.is_available ? property : null;
}

export default async function handler(request, response) {
  const id = Array.isArray(request.query.id) ? request.query.id[0] : request.query.id;
  const origin = siteOrigin(request);
  let html;
  try { html = await shell; }
  catch {
    response.status(500).send("Unable to load property page.");
    return;
  }

  let property = null;
  if (uuidPattern.test(id || "")) {
    try { property = await loadProperty(id); }
    catch (error) { console.error("Property preview lookup failed:", error); }
  }

  if (property) {
    const title = `${String(property.title || property.address || "Property").slice(0, 100)} | RealEstate`;
    const details = [property.address, property.state, property.description].filter(Boolean).join(" · ").replace(/\s+/g, " ").slice(0, 190);
    const description = details || "Explore photos, details, and location for this property on RealEstate.";
    const url = `${origin}/property/${id}`;
    const image = publicPhoto(property.images?.[0], `${origin}/og-home.png`);
    const metadata = `<!-- SHARE_META_START -->
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="RealEstate" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(property.title || "Property photo")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <!-- SHARE_META_END -->`;
    html = html.replace(/<!-- SHARE_META_START -->[\s\S]*?<!-- SHARE_META_END -->/, metadata)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  }

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", property ? "public, max-age=0, s-maxage=60, stale-while-revalidate=300" : "no-store");
  response.status(200).send(html);
}
