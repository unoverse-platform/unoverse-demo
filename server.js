// Minimal zero-dependency static server for the built SPA (dist/).
//
// This is the RUN/web process for a DigitalOcean buildpack deploy (Procfile: `web: node
// server.js`, or `npm start`). When the component has a custom build command set, DO uses
// buildpacks (not the Dockerfile) — `npm run build` produces static dist/ with no process to
// run, which fails as "no default process / connection refused on 8080". This serves those
// assets on $PORT with SPA fallback so /sab, /bpp, /logout resolve.
//
// (The Dockerfile path serves the same dist/ via nginx instead — used when DO builds from the
// Dockerfile. Either path works; this one covers the buildpack case.)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("./dist", import.meta.url));
const PORT = process.env.PORT || 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

async function send(res, filePath, status = 200) {
  const body = await readFile(filePath);
  res.writeHead(status, { "content-type": TYPES[extname(filePath)] || "application/octet-stream" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, ""); // block path traversal
    if (rel === "/" || rel.endsWith("/")) rel = join(rel, "index.html");
    const filePath = join(DIST, rel);
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    try {
      const s = await stat(filePath);
      return await send(res, s.isDirectory() ? join(filePath, "index.html") : filePath);
    } catch {
      // Unknown path → SPA fallback so /sab, /bpp, /logout render the app shell.
      return await send(res, join(DIST, "index.html"));
    }
  } catch {
    res.writeHead(500);
    res.end("Internal error");
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`[unoverse-demo] serving dist/ on :${PORT}`));
