/** Parses scraped j4spar.com product pages → .scrape/products.json */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", ".scrape", "products");

const decode = (s) =>
  (s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?38;/g, "&")
    .replace(/&euro;/g, "€")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (slug) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function category(name) {
  const n = name.toLowerCase();
  if (/(jacket|bomber|coat|army)/.test(n)) return "outerwear";
  if (/(skirt|pants|salopette|short|trouser|boxer)/.test(n)) return "bottoms";
  return "tops";
}

const products = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".html"))) {
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(DIR, file), "utf8");

  const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/i) || [])[1] || "";
  const name = decode(ogTitle.replace(/\s*-\s*JASP[ÄA]R\s*$/i, "")) || titleCase(slug);

  const ogDesc = decode((html.match(/<meta property="og:description" content="([^"]*)"/i) || [])[1] || "");

  // Main product price from the summary <p class="price">
  const priceBlock = (html.match(/<p class="price">([\s\S]*?)<\/p>/i) || [])[1] || "";
  const priceTxt = decode(priceBlock.replace(/<[^>]*>/g, ""));
  const priceNum = parseFloat((priceTxt.match(/([\d.,]+)\s*€/) || [])[1]?.replace(/\./g, "").replace(",", ".") || "0");

  // Gallery — data-large_image in document order, dedup preserving order
  const imgs = [];
  const re = /data-large_image="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (!imgs.includes(u)) imgs.push(u);
  }

  // Sizes — variation select options
  const sel = (html.match(/<select[^>]*id="size"[\s\S]*?<\/select>/i) ||
    html.match(/name="attribute_size"[\s\S]*?<\/select>/i) || [])[0] || "";
  const sizes = [...sel.matchAll(/<option[^>]*value="([^"]+)"[^>]*>([^<]+)<\/option>/gi)]
    .map((x) => decode(x[2]))
    .filter((v) => v && !/choose|choisir/i.test(v));

  const soldOut = /class="[^"]*\bout-of-stock\b/i.test(html) || />\s*Rupture de stock|Out of stock\s*</i.test(html);

  products.push({
    slug,
    name,
    category: category(name),
    price: Math.round(priceNum * 100),
    description: ogDesc,
    images: imgs,
    sizes: sizes.length ? sizes : ["XS", "S", "M", "L"],
    soldOut,
  });
}

writeFileSync(join(__dirname, "..", ".scrape", "products.json"), JSON.stringify(products, null, 2));
const allImgs = [...new Set(products.flatMap((p) => p.images))];
writeFileSync(join(__dirname, "..", ".scrape", "images.json"), JSON.stringify(allImgs, null, 2));
console.log(`Parsed ${products.length} products, ${allImgs.length} unique images`);
for (const p of products) console.log(`  ${p.slug} · ${p.name} · ${p.price / 100}€ · ${p.category} · ${p.images.length}img · sizes:[${p.sizes}] · soldOut:${p.soldOut}`);
