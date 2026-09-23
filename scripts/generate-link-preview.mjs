import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const photo = await readFile(resolve(root, "src/assets/img/home-hero-v2.webp"));
const photoUrl = `data:image/webp;base64,${photo.toString("base64")}`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&family=Manrope:wght@600;700;800&display=swap');
    *{box-sizing:border-box}html,body{width:1200px;height:630px;margin:0;overflow:hidden}
    body{font-family:Manrope,Arial,sans-serif;background:#123b37;color:#f7f7f2}
    .photo{position:absolute;right:0;top:0;width:535px;height:630px;object-fit:cover;object-position:58% 45%;border-top-left-radius:170px}
    .edge{position:absolute;right:531px;top:0;width:4px;height:630px;background:#d6e58b;opacity:.85}
    .content{position:relative;width:690px;height:630px;padding:58px 62px 52px}
    .brand{display:flex;align-items:center;gap:11px;color:#f7f7f2;font-size:23px;font-weight:800;letter-spacing:-.045em}
    .brand svg{width:31px;height:31px;color:#d6e58b}.brand em{font-style:normal;color:#d6e58b}
    h1{margin:83px 0 0;max-width:610px;font-size:70px;line-height:1.07;letter-spacing:-.058em;font-weight:800}
    h1 span{color:#d6e58b}.bottom{position:absolute;left:62px;bottom:57px;display:flex;align-items:center;gap:16px;color:#d7e7df;font:600 20px 'DM Sans',Arial,sans-serif}
    .line{width:50px;height:2px;background:#d6e58b}
  </style></head><body>
    <img class="photo" src="${photoUrl}" alt="">
    <div class="edge"></div>
    <div class="content">
      <div class="brand"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 27V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v21M3 27V16a2 2 0 0 1 2-2h3m16 4h3a2 2 0 0 1 2 2v7M2 27h28M13 10h6M13 15h6M13 20h6M14 27v-4h4v4"/></svg><span>REAL<em>ESTATE</em></span></div>
      <h1>Find a place<br>to call <span>home.</span></h1>
      <div class="bottom"><span class="line"></span><span>Explore places to rent or buy</span></div>
    </div>
  </body></html>`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(root, "public/og-home.png"), type: "png" });
} finally {
  await browser.close();
}
