/*
 * Artestoa core: everything the hall, galleries and work pages share.
 *
 *  - Loading an artist's catalogue (artists/<slug>/catalogue.js). Only slugs listed in
 *    the registry (artists/registry.js) can be loaded, so the ?a= URL parameter can
 *    never point a page at an arbitrary script.
 *  - URLs between the hall, a gallery and a work.
 *  - Saved works, kept across every gallery as "artist/work" ids.
 *  - Per-artist theme (accent colour) and the coloured glow built from a palette.
 *
 * Load order on every page: artists/registry.js, then this file.
 */
const Artestoa = (() => {
    const catalogues = {};
    const loading = {};

    // ---------- Catalogues ----------

    // Called by each artists/<slug>/catalogue.js. Image paths in a catalogue are relative
    // to the artist's folder; here they become relative to the site root.
    function registerCatalogue(slug, data) {
        const base = `artists/${slug}/`;
        const works = data.works.map((work, i) => ({
            ...work,
            artist: slug,
            no: String(i + 1).padStart(2, "0"), // catalogue numbers follow exhibition order
            images: work.images.map((im) => ({ src: base + im.src, sm: base + im.sm })),
        }));
        const artist = { ...data.artist, portrait: data.artist.portrait ? base + data.artist.portrait : "" };
        catalogues[slug] = {
            ...data,
            slug,
            artist,
            works,
            entry: registryEntry(slug),
            find: (id) => works.find((w) => w.id === id),
        };
        loading[slug]?.resolve(catalogues[slug]);
    }

    const registryEntry = (slug) => artestoa.artists.find((a) => a.slug === slug);

    function loadCatalogue(slug) {
        if (!registryEntry(slug)) return Promise.reject(new Error(`No artist "${slug}" in the registry`));
        if (catalogues[slug]) return Promise.resolve(catalogues[slug]);
        if (!loading[slug]) {
            let resolve, reject;
            const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
            loading[slug] = { promise, resolve };
            const script = document.createElement("script");
            script.src = `artists/${slug}/catalogue.js`;
            script.onerror = () => reject(new Error(`Could not load the catalogue for "${slug}"`));
            document.head.appendChild(script);
        }
        return loading[slug].promise;
    }

    // The catalogue for this page's ?a=<slug>. A missing or unknown artist goes back to the hall.
    function currentCatalogue() {
        const slug = new URLSearchParams(location.search).get("a");
        return loadCatalogue(slug).catch(() => {
            location.replace("index.html");
            return new Promise(() => {});
        });
    }

    // ---------- URLs ----------

    const hallUrl = (slug) => (slug ? `index.html#portal-${slug}` : "index.html");
    const galleryUrl = (slug, hash) => `gallery.html?a=${encodeURIComponent(slug)}${hash ? `#${hash}` : ""}`;
    const workUrl = (work, extra = {}) =>
        `work.html?${new URLSearchParams({ a: work.artist, id: work.id, ...extra })}`;

    // ---------- Saved works ----------

    const SAVED_KEY = "artestoa:saved";
    const LEGACY_KEY = "orneril:favourites"; // from before Orneril joined the hall

    function readSaved() {
        try {
            const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
            if (Array.isArray(legacy)) {
                const merged = [...new Set([...(JSON.parse(localStorage.getItem(SAVED_KEY)) || []), ...legacy.map((id) => `orneril/${id}`)])];
                localStorage.setItem(SAVED_KEY, JSON.stringify(merged));
                localStorage.removeItem(LEGACY_KEY);
            }
            return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
        } catch {
            return [];
        }
    }
    const savedKey = (work) => `${work.artist}/${work.id}`;
    const isSaved = (work) => readSaved().includes(savedKey(work));
    function toggleSaved(work) {
        const key = savedKey(work);
        const saved = readSaved();
        const next = saved.includes(key) ? saved.filter((k) => k !== key) : [...saved, key];
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch {}
        return next.includes(key);
    }
    // Saved works across every gallery, loading each artist's catalogue as needed
    async function savedWorks() {
        const keys = readSaved();
        const slugs = [...new Set(keys.map((k) => k.split("/")[0]))];
        const loaded = await Promise.all(slugs.map((s) => loadCatalogue(s).catch(() => null)));
        const bySlug = Object.fromEntries(loaded.filter(Boolean).map((c) => [c.slug, c]));
        return keys.map((k) => { const [s, id] = k.split("/"); return bySlug[s]?.find(id); }).filter(Boolean);
    }

    // ---------- Theme & colour ----------

    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const chroma = (hex) => { const c = rgb(hex); return (Math.max(...c) - Math.min(...c)) / 255; };
    const vivid = (palette, min = 0.18) => palette.filter((c) => chroma(c) > min);

    // Each gallery can bring its own accent; Tailwind's `primary` and the pages' CSS read --accent
    function applyTheme(theme = {}) {
        if (theme.accent) document.documentElement.style.setProperty("--accent", rgb(theme.accent).join(" "));
    }

    /*
     * Coloured light from a palette (not a photo, whose backdrop averages to grey).
     * Near-black/white tones carry no hue, so the vivid colours lead; fully monochrome
     * palettes get a faint neutral glow. `at` is where the light comes from, in % [x, y].
     */
    function glowFor(item, { alpha = 0.9, at = [50, 50] } = {}) {
        const v = vivid(item.palette);
        const colours = (v.length ? v : item.palette).slice(0, 3);
        const a = v.length ? alpha : alpha * 0.35;
        const rgba = (hex, k) => `rgba(${rgb(hex).join(",")}, ${(a * k).toFixed(2)})`;
        const [x, y] = at;
        // Each colour sits just off the source, so they overlap and mix like light through glass
        const offsets = [[-12, -8], [12, -4], [0, 12]];
        const blooms = colours.map((hex, i) =>
            `radial-gradient(38% 34% at ${x + offsets[i][0]}% ${y + offsets[i][1]}%, ${rgba(hex, 1)} 0%, transparent 75%)`);
        // ...over a wide wash of the leading colour that reaches the edges of the room
        const wash = `radial-gradient(95% 85% at ${x}% ${y}%, ${rgba(colours[0], 0.5)} 0%, transparent 85%)`;
        return [...blooms, wash].join(", ");
    }

    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    return {
        registerCatalogue, loadCatalogue, currentCatalogue, registryEntry,
        hallUrl, galleryUrl, workUrl,
        readSaved, isSaved, toggleSaved, savedWorks,
        applyTheme, glowFor, vivid, rgb, escapeHtml,
    };
})();
