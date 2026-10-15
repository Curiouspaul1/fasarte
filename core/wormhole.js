/*
 * Fasarte wormhole: the passage between the hall and a maker's gallery.
 *
 * Self-contained (needs nothing else from Fasarte), so a gallery can start the far end
 * of the passage before the rest of its page has loaded.
 *
 *   Wormhole.run({ palette, direction, duration }) -> Promise
 *     direction "in":  hall side. Accelerates down a spiralling tunnel of the maker's colours;
 *                      the dark core at its end opens into a bloom of light. The canvas stays
 *                      up for the page change.
 *     direction "out": gallery side. Starts in that light, slows out of the tunnel and fades.
 *                      `onReveal` fires when the page should start easing in.
 *
 * Drawn on one 2D canvas with additive blending ("lighter"), so overlapping light glows:
 *   - the tunnel: rings of points that twist as they come toward you (spiral arms)
 *   - light streaks rushing past
 *   - the core: a dark eye ringed with light, which becomes the bloom at the threshold
 * Points and streaks are recycled, so the cost per frame stays flat.
 */
const Wormhole = (() => {
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const chroma = ([r, g, b]) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
    const mix = (c, d, k) => c.map((v, i) => Math.round(v + (d[i] - v) * k));
    const WARM_WHITE = [255, 246, 228];

    function colours(palette) {
        const all = (palette && palette.length ? palette : ["#b08444", "#d8cfbf", "#8c8170"]).map(rgb);
        // Vivid colours lead; near-greys are lifted toward warm gilt so the tunnel still glows
        const vivid = all.filter((c) => chroma(c) > 0.18);
        return vivid.length ? vivid : all.map((c) => mix(c, [232, 203, 134], 0.6));
    }

    function canvasFor(id) {
        let canvas = document.getElementById(id);
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = id;
            canvas.setAttribute("aria-hidden", "true");
            Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "200", pointerEvents: "none" });
            (document.body || document.documentElement).appendChild(canvas);
        }
        return canvas;
    }

    function run({ palette, direction = "in", duration = 1300, id = "wormhole", onReveal } = {}) {
        const canvas = canvasFor(id);
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let w = 0, h = 0;
        const size = () => {
            w = innerWidth; h = innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();
        addEventListener("resize", size);

        const cols = colours(palette);
        const lead = cols[0];
        const bloom = mix(lead, WARM_WHITE, 0.55);
        const RINGS = 34, PER_RING = 40;
        const rings = Array.from({ length: RINGS }, (_, i) => ({ z: (i + 1) / RINGS, c: cols[i % cols.length], spin: Math.random() * Math.PI * 2 }));
        const streaks = Array.from({ length: 150 }, () => ({
            a: Math.random() * Math.PI * 2,
            r: 0.5 + Math.random() * 1.8,
            z: Math.random(),
            c: Math.random() < 0.5 ? WARM_WHITE : cols[Math.floor(Math.random() * cols.length)],
        }));

        const goingIn = direction === "in";
        // Depth travelled per second: "in" winds up, "out" winds down
        const speed = (p) => (goingIn ? 0.22 + 3.8 * Math.pow(p, 2.1) : 0.18 + 3.8 * Math.pow(1 - p, 2.3));
        // How far the core has opened into the bloom of light (0 = a dark eye, 1 = all light)
        const open = (p) => (goingIn ? smooth(0.68, 1, p) : 1 - smooth(0, 0.4, p));

        let start = 0, last = 0, revealed = false;
        canvas.style.opacity = goingIn ? "0" : "1";

        return new Promise((resolve) => {
            function frame(now) {
                if (!start) { start = now; last = now; }
                const p = clamp((now - start) / duration);
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                const time = (now - start) / 1000;
                const v = speed(p) * dt;

                const cx = w / 2, cy = h / 2;
                const R0 = Math.min(w, h) * 0.06;
                const reach = Math.hypot(w, h) * 0.75;
                // The tube bends: far parts drift off-centre, near ones line up with the viewer
                const bend = (z) => [Math.sin(time * 1.1 + z * 3.2) * w * 0.06 * z, Math.cos(time * 0.9 + z * 2.6) * h * 0.05 * z];

                // Deep space, darker at the edges
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 1;
                const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
                bg.addColorStop(0, "#0d0a12");
                bg.addColorStop(1, "#030205");
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, w, h);

                ctx.globalCompositeOperation = "lighter";

                // The tunnel: rings of points, twisting as they approach, so they read as arms
                rings.forEach((ring) => { ring.z -= v * 0.5; if (ring.z <= 0.03) { ring.z += 1; ring.spin = Math.random() * Math.PI * 2; } });
                rings.forEach((ring) => {
                    const r = R0 / ring.z;
                    if (r > reach) return;
                    const [ox, oy] = bend(ring.z);
                    const near = 1 - ring.z;
                    const alpha = (0.2 + 0.8 * near) * clamp((reach - r) / (reach * 0.35));
                    const size = 1.4 + 6 * near * near;
                    const twist = ring.spin + time * 0.9 + ring.z * 5.5;
                    // A faint wall to the tube, so the points read as a tunnel, not a starfield
                    ctx.strokeStyle = `rgba(${ring.c},${alpha * 0.28})`;
                    ctx.lineWidth = 1 + 5 * near * near;
                    ctx.beginPath();
                    ctx.ellipse(cx + ox, cy + oy, r, r * 0.92, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.fillStyle = `rgba(${ring.c},${alpha})`;
                    for (let k = 0; k < PER_RING; k++) {
                        const a = twist + (k / PER_RING) * Math.PI * 2;
                        ctx.fillRect(cx + ox + Math.cos(a) * r - size / 2, cy + oy + Math.sin(a) * r * 0.92 - size / 2, size, size);
                    }
                });

                // Light streaks rushing past
                ctx.lineCap = "round";
                streaks.forEach((s) => {
                    s.z -= v;
                    if (s.z <= 0.02) { s.z += 1; s.a = Math.random() * Math.PI * 2; }
                    const tail = Math.min(1, s.z + 0.015 + v * 7);
                    const a = s.a + time * 0.45;
                    const [ox, oy] = bend(s.z);
                    const r1 = (R0 * s.r) / s.z, r2 = (R0 * s.r) / tail;
                    if (r2 > reach) return;
                    ctx.strokeStyle = `rgba(${s.c},${0.7 * (1 - s.z)})`;
                    ctx.lineWidth = 0.6 + 1.8 * (1 - s.z);
                    ctx.beginPath();
                    ctx.moveTo(cx + ox + Math.cos(a) * r2, cy + oy + Math.sin(a) * r2);
                    ctx.lineTo(cx + ox + Math.cos(a) * r1, cy + oy + Math.sin(a) * r1);
                    ctx.stroke();
                });

                // The core at the end of the tunnel: a dark eye with a ring of light round it...
                const o = open(p);
                const [fx, fy] = bend(1);
                const ex = cx + fx * (1 - o), ey = cy + fy * (1 - o);
                const eye = R0 * (1.1 + o * 30);
                const halo = ctx.createRadialGradient(ex, ey, eye * 0.6, ex, ey, eye * 2.6);
                halo.addColorStop(0, `rgba(${bloom},${0.9})`);
                halo.addColorStop(0.25, `rgba(${lead},${0.55})`);
                halo.addColorStop(1, `rgba(${lead},0)`);
                ctx.fillStyle = halo;
                ctx.fillRect(0, 0, w, h);

                ctx.globalCompositeOperation = "source-over";
                if (o < 0.98) {
                    ctx.fillStyle = `rgba(4, 3, 6, ${0.92 * (1 - o)})`;
                    ctx.beginPath();
                    ctx.arc(ex, ey, eye * 0.62 * (1 - o * 0.6), 0, Math.PI * 2);
                    ctx.fill();
                }
                // ...which, at the threshold, opens out into light that fills the view
                if (o > 0) {
                    const flood = ctx.createRadialGradient(ex, ey, 0, ex, ey, reach * (0.2 + o * 1.2));
                    flood.addColorStop(0, `rgba(${WARM_WHITE},${o})`);
                    flood.addColorStop(0.45, `rgba(${bloom},${o})`);
                    flood.addColorStop(1, `rgba(${bloom},${o * o})`);
                    ctx.fillStyle = flood;
                    ctx.fillRect(0, 0, w, h);
                }

                // Fade the whole passage in (hall) or away (gallery)
                if (goingIn) canvas.style.opacity = String(smooth(0, 0.16, p));
                else {
                    canvas.style.opacity = String(1 - smooth(0.5, 1, p));
                    if (!revealed && p >= 0.42) { revealed = true; onReveal?.(); }
                }

                if (p < 1) requestAnimationFrame(frame);
                else {
                    removeEventListener("resize", size);
                    if (!goingIn) canvas.remove();
                    resolve();
                }
            }
            requestAnimationFrame(frame);
        });
    }

    const clear = (id = "wormhole") => document.getElementById(id)?.remove();

    return { run, clear };
})();
