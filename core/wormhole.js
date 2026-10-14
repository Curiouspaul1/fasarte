/*
 * Artestoa wormhole: the passage between the hall and a maker's gallery.
 *
 * Self-contained (needs nothing else from Artestoa), so a gallery can start the far end
 * of the passage before the rest of its page has loaded.
 *
 *   Wormhole.run({ palette, direction, duration }) -> Promise
 *     direction "in":  hall side. Accelerates down a tunnel of the maker's colours and
 *                      ends in a flash of light. The canvas stays up for the page change.
 *     direction "out": gallery side. Starts in that flash, slows out of the tunnel and
 *                      fades away. `onReveal` fires when the page should start easing in.
 *
 * Drawn on one 2D canvas: rings that rush toward the viewer and bend like a tube, light
 * streaks, and a glow at the far end. Rings and streaks are recycled, so the cost per frame
 * stays flat (a few hundred strokes).
 */
const Wormhole = (() => {
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const chroma = ([r, g, b]) => (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
    const mix = (c, d, k) => c.map((v, i) => Math.round(v + (d[i] - v) * k));

    function colours(palette) {
        const all = (palette && palette.length ? palette : ["#b08444", "#d8cfbf", "#8c8170"]).map(rgb);
        // Vivid colours lead; near-greys are lifted toward a warm white so the tunnel still glows
        const vivid = all.filter((c) => chroma(c) > 0.18);
        return (vivid.length ? vivid : all.map((c) => mix(c, [255, 236, 200], 0.4)));
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
        const flashColour = mix(lead, [255, 252, 245], 0.55);
        const rings = Array.from({ length: 30 }, (_, i) => ({ z: (i + 1) / 30, c: cols[i % cols.length] }));
        const streaks = Array.from({ length: 220 }, () => ({
            a: Math.random() * Math.PI * 2,
            r: 0.4 + Math.random() * 1.6,
            z: Math.random(),
            c: Math.random() < 0.55 ? [255, 250, 240] : cols[Math.floor(Math.random() * cols.length)],
        }));

        const goingIn = direction === "in";
        // Depth travelled per second: "in" winds up, "out" winds down
        const speed = (p) => (goingIn ? 0.25 + 4.2 * Math.pow(p, 2.2) : 0.2 + 4.2 * Math.pow(1 - p, 2.4));
        // The flash of light at the threshold between the two places
        const flash = (p) => (goingIn ? smooth(0.72, 1, p) : 1 - smooth(0, 0.32, p));

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
                const R0 = Math.min(w, h) * 0.07;
                const reach = Math.hypot(w, h) * 0.75;
                const twist = time * 0.5;
                // The tube bends: far rings drift off-centre, near ones line up with the viewer
                const bend = (z) => [Math.sin(time * 1.1 + z * 3.2) * w * 0.07 * z, Math.cos(time * 0.9 + z * 2.6) * h * 0.06 * z];

                ctx.globalAlpha = 1;
                ctx.fillStyle = "#07060a";
                ctx.fillRect(0, 0, w, h);

                // Glow at the far end of the tunnel
                const [fx, fy] = bend(1);
                const far = ctx.createRadialGradient(cx + fx, cy + fy, 0, cx + fx, cy + fy, R0 * 5);
                far.addColorStop(0, `rgba(${flashColour},0.95)`);
                far.addColorStop(0.35, `rgba(${lead},0.45)`);
                far.addColorStop(1, `rgba(${lead},0)`);
                ctx.fillStyle = far;
                ctx.fillRect(0, 0, w, h);

                // Rings, far to near
                rings.forEach((ring) => { ring.z -= v * 0.55; if (ring.z <= 0.03) ring.z += 1; });
                [...rings].sort((a, b) => b.z - a.z).forEach((ring) => {
                    const r = R0 / ring.z;
                    if (r > reach) return;
                    const [ox, oy] = bend(ring.z);
                    const nearness = 1 - ring.z;
                    ctx.strokeStyle = `rgba(${ring.c},${(0.15 + 0.75 * nearness) * clamp((reach - r) / (reach * 0.4))})`;
                    ctx.lineWidth = 1 + 9 * nearness * nearness;
                    ctx.beginPath();
                    ctx.ellipse(cx + ox, cy + oy, r, r * 0.9, twist * 0.3 + ring.z, 0, Math.PI * 2);
                    ctx.stroke();
                });

                // Light streaks rushing past
                ctx.lineCap = "round";
                streaks.forEach((s) => {
                    s.z -= v;
                    if (s.z <= 0.02) { s.z += 1; s.a = Math.random() * Math.PI * 2; }
                    const tail = Math.min(1, s.z + 0.02 + v * 6);
                    const a = s.a + twist;
                    const [ox, oy] = bend(s.z);
                    const r1 = (R0 * s.r) / s.z, r2 = (R0 * s.r) / tail;
                    if (r2 > reach) return;
                    ctx.strokeStyle = `rgba(${s.c},${0.85 * (1 - s.z)})`;
                    ctx.lineWidth = 0.6 + 2.2 * (1 - s.z);
                    ctx.beginPath();
                    ctx.moveTo(cx + ox + Math.cos(a) * r2, cy + oy + Math.sin(a) * r2);
                    ctx.lineTo(cx + ox + Math.cos(a) * r1, cy + oy + Math.sin(a) * r1);
                    ctx.stroke();
                });

                // The threshold flash
                const f = flash(p);
                if (f > 0) {
                    ctx.fillStyle = `rgba(${flashColour},${f})`;
                    ctx.fillRect(0, 0, w, h);
                }

                // Fade the whole passage in (hall) or away (gallery)
                if (goingIn) canvas.style.opacity = String(smooth(0, 0.18, p));
                else {
                    canvas.style.opacity = String(1 - smooth(0.45, 1, p));
                    if (!revealed && p >= 0.4) { revealed = true; onReveal?.(); }
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
