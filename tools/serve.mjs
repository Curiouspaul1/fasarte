#!/usr/bin/env node
/*
 * Fasarte dev server: a static file server with the same address rules as _redirects,
 * so clean URLs work locally:
 *
 *   /                    index.html    (the hall)
 *   /orneril             gallery.html  (a maker's gallery)
 *   /orneril/lumera      work.html     (one work)
 *
 * Real files always win, so /core/fasarte.js and /artists/... are served as they are.
 * To try a maker on their own host, open http://orneril.localhost:8080 and set
 * `domain: "localhost"` in artists/registry.js (subdomains of localhost resolve to it).
 *
 * Usage: node tools/serve.mjs [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

// Mirrors _redirects: one path segment is a gallery, two are a work
const SEGMENT = "[a-z0-9-]+";
const RULES = [
    [new RegExp(`^/${SEGMENT}/${SEGMENT}/?$`), "work.html"],
    [new RegExp(`^/${SEGMENT}/?$`), "gallery.html"],
];

async function isFile(path) {
    try { return (await stat(path)).isFile(); } catch { return false; }
}

createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { pathname = "/"; }

    // Resolve inside ROOT only, so "/../" can't reach files outside the site
    const file = normalize(join(ROOT, pathname));
    let target = null;
    if (file.startsWith(ROOT) && !file.split(sep).includes("..")) {
        if (pathname === "/") target = join(ROOT, "index.html");
        else if (await isFile(file)) target = file;
        else {
            const rule = RULES.find(([pattern]) => pattern.test(pathname));
            if (rule) target = join(ROOT, rule[1]);
        }
    }

    if (!target) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
    }
    try {
        const body = await readFile(target);
        res.writeHead(200, {
            "content-type": TYPES[extname(target).toLowerCase()] || "application/octet-stream",
            "cache-control": "no-store",
        });
        res.end(body);
    } catch {
        res.writeHead(500);
        res.end();
    }
}).listen(PORT, "127.0.0.1", () => {
    console.log(`Fasarte on http://localhost:${PORT}`);
});
