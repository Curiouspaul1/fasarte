/*
 * Fasarte sound: background music and the passage through a portal.
 *
 * Everything is synthesised with the Web Audio API, so there are no audio files to
 * download and nothing to license.
 *
 *   Music:  J. S. Bach, Prelude in C major, BWV 846 (1722, public domain), played softly
 *           on a piano-like voice through a small reverb, looping.
 *   Portal: a rising shimmer and rush of air, ending in a low bloom at the threshold;
 *           `arrive` is the gentler far end, played as a gallery opens.
 *
 * Browsers only allow sound after the visitor interacts with the page (a click, tap or key
 * press; scrolling doesn't count), so it starts on the first of those. The speaker button
 * from `Sound.button()` turns it off and on, and the choice is remembered. The music picks
 * up from the bar it had reached on the previous page.
 */
const Sound = (() => {
    const PREF_KEY = "fasarte:sound";       // "off" once the visitor mutes
    const POS_KEY = "fasarte:music-bar";     // bar to resume from on the next page

    let enabled = true;
    try {
        // Carry the setting over from before the hall was renamed Fasarte
        const old = localStorage.getItem("artestoa:sound");
        if (old !== null) {
            if (localStorage.getItem(PREF_KEY) === null) localStorage.setItem(PREF_KEY, old);
            localStorage.removeItem("artestoa:sound");
        }
        enabled = localStorage.getItem(PREF_KEY) !== "off";
    } catch {}

    let ctx = null, master, musicBus, sfxBus, noise;
    const buttons = new Set();
    const listeners = new Set();

    // ---------- Setup ----------

    function build() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);

        // A small hall: generated impulse response, a couple of seconds of decaying noise
        const reverb = ctx.createConvolver();
        const len = Math.floor(ctx.sampleRate * 2.4);
        const ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = ir.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
        reverb.buffer = ir;
        const wet = ctx.createGain();
        wet.gain.value = 0.32;
        reverb.connect(wet).connect(master);

        musicBus = ctx.createGain();
        musicBus.gain.value = 0.11;
        const tone = ctx.createBiquadFilter();       // round off the top: felt-hammer softness
        tone.type = "lowpass";
        tone.frequency.value = 2400;
        musicBus.connect(tone);
        tone.connect(master);
        tone.connect(reverb);

        sfxBus = ctx.createGain();
        sfxBus.gain.value = 0.5;
        sfxBus.connect(master);
        sfxBus.connect(reverb);

        // Half a second of white noise, for the portal's rush of air
        noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
        const nd = noise.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        return true;
    }

    const running = () => Boolean(ctx) && ctx.state === "running" && enabled;

    // Try to start (or resume). Succeeds only once the browser allows sound.
    async function start() {
        if (!enabled) return;
        if (!ctx && !build()) return;
        try { await ctx.resume(); } catch {}
        if (ctx.state !== "running") return;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(1, ctx.currentTime, 0.6);   // fade in, never blare
        music.play();
        sync();
    }

    function setEnabled(on) {
        enabled = on;
        try { localStorage.setItem(PREF_KEY, on ? "on" : "off"); } catch {}
        if (on) start();
        else if (ctx) {
            master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
            setTimeout(() => { if (!enabled) { music.stop(); ctx.suspend(); } }, 600);
        }
        sync();
    }

    // The first click, tap or key press anywhere starts the sound
    const GESTURES = ["pointerdown", "keydown", "touchend"];
    function onGesture(e) {
        if (e.target.closest?.("[data-sound-toggle]")) return; // the button handles itself
        GESTURES.forEach((g) => removeEventListener(g, onGesture, true));
        start();
    }
    GESTURES.forEach((g) => addEventListener(g, onGesture, true));
    // Start straight away only where the browser says it's allowed (where it can tell us),
    // so other browsers don't log an "AudioContext was not allowed to start" warning
    addEventListener("DOMContentLoaded", () => {
        if (enabled && navigator.getAutoplayPolicy?.("audiocontext") === "allowed") start();
    });

    // Quiet when the tab is in the background
    document.addEventListener("visibilitychange", () => {
        if (!ctx || !enabled) return;
        if (document.hidden) ctx.suspend();
        else start();
    });
    addEventListener("pagehide", () => music.savePosition());

    // ---------- Music: Bach, Prelude in C major, BWV 846 ----------

    // Each bar is one broken chord: five notes (MIDI numbers), played as the figure
    // 1 2 3 4 5 3 4 5 twice. The first two notes ring on through the bar.
    const BARS = [
        [60, 64, 67, 72, 76], [60, 62, 69, 74, 77], [59, 62, 67, 74, 77], [60, 64, 67, 72, 76],
        [60, 64, 69, 76, 81], [60, 62, 66, 69, 74], [59, 62, 67, 74, 79], [59, 60, 64, 67, 72],
        [57, 60, 64, 67, 72], [50, 57, 62, 66, 72], [55, 59, 62, 67, 71], [55, 58, 64, 67, 73],
        [53, 57, 62, 69, 74], [53, 56, 62, 65, 71], [52, 55, 60, 67, 72], [52, 53, 57, 60, 65],
        [50, 53, 57, 60, 65], [43, 50, 55, 59, 65], [48, 52, 55, 60, 64], [48, 55, 58, 60, 64],
        [41, 53, 57, 60, 64], [42, 48, 57, 60, 63], [44, 53, 59, 60, 62], [43, 53, 55, 59, 62],
        [43, 52, 55, 60, 64], [43, 50, 55, 60, 65], [43, 50, 55, 59, 65], [43, 51, 57, 60, 66],
        [43, 52, 55, 60, 67], [43, 50, 55, 60, 65], [43, 50, 55, 59, 65], [36, 48, 55, 58, 64],
    ];
    const FINAL = [36, 48, 52, 55, 60, 64, 72];      // the closing C major chord, rolled
    const FIGURE = [0, 1, 2, 3, 4, 2, 3, 4];
    const SIXTEENTH = 60 / 62 / 4;                    // a calm 62 beats a minute

    function note(time, midi, gain, ring) {
        const f = 440 * Math.pow(2, (midi - 69) / 12);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, time);
        env.gain.exponentialRampToValueAtTime(gain, time + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, time + ring);
        env.connect(musicBus);
        // A warm fundamental with two quiet overtones, a little like a soft piano
        [[1, "triangle", 1], [2, "sine", 0.22], [3, "sine", 0.06]].forEach(([mult, type, level]) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = f * mult;
            const g = ctx.createGain();
            g.gain.value = level;
            osc.connect(g).connect(env);
            osc.start(time);
            osc.stop(time + ring + 0.05);
        });
    }

    const music = (() => {
        let bar = 0, stepIdx = 0, next = 0, timer = null, playing = false;
        try { bar = Number(sessionStorage.getItem(POS_KEY)) || 0; } catch {}

        function scheduleStep(time) {
            if (bar < BARS.length) {
                const chord = BARS[bar];
                const i = FIGURE[stepIdx % 8];
                // Bass notes speak a little more and ring longer, as if held down
                const ring = i === 0 ? 3.2 : i === 1 ? 2.4 : 1.1;
                const accent = stepIdx % 8 === 0 ? 1 : 0.8;
                note(time, chord[i], (i < 2 ? 0.22 : 0.16) * accent * (0.92 + Math.random() * 0.12), ring);
                stepIdx++;
                if (stepIdx === 16) { stepIdx = 0; bar++; }
                return SIXTEENTH * (1 + (Math.random() - 0.5) * 0.04);   // a human unevenness
            }
            if (bar === BARS.length) {
                FINAL.forEach((m, k) => note(time + k * 0.07, m, 0.16, 5.5));
                bar++;
                return SIXTEENTH * 32;                    // let the last chord bloom and fade
            }
            bar = 0; stepIdx = 0;                          // and around again
            return SIXTEENTH * 4;
        }
        function tick() {
            while (next < ctx.currentTime + 0.35) next += scheduleStep(next);
            timer = setTimeout(tick, 100);
        }
        return {
            play() {
                if (playing) return;
                playing = true;
                stepIdx = 0;
                next = ctx.currentTime + 0.15;
                tick();
            },
            stop() { playing = false; clearTimeout(timer); },
            savePosition() { try { sessionStorage.setItem(POS_KEY, String(bar % (BARS.length + 1))); } catch {} },
        };
    })();

    // ---------- The portal ----------

    // Hall side: air rushes and a shimmer rises over `seconds`, then a low bloom
    function portal(seconds = 1.8) {
        if (!running()) return;
        const now = ctx.currentTime;
        const end = now + seconds;

        // Music steps back while you pass through
        musicBus.gain.setTargetAtTime(0.03, now, 0.3);
        musicBus.gain.setTargetAtTime(0.11, end + 0.8, 1.2);

        // Rush of air: looping noise swept up through a band-pass
        const air = ctx.createBufferSource();
        air.buffer = noise;
        air.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.4;
        bp.frequency.setValueAtTime(220, now);
        bp.frequency.exponentialRampToValueAtTime(5200, end);
        const ag = ctx.createGain();
        ag.gain.setValueAtTime(0.0001, now);
        ag.gain.exponentialRampToValueAtTime(0.5, end - 0.15);
        ag.gain.exponentialRampToValueAtTime(0.0001, end + 0.5);
        air.connect(bp).connect(ag).connect(sfxBus);
        air.start(now);
        air.stop(end + 0.6);

        // Shimmer: a bright chord (C E G B D) that swells and drifts upward
        [72, 76, 79, 83, 86].forEach((m, k) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            const f = 440 * Math.pow(2, (m - 69) / 12);
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.exponentialRampToValueAtTime(f * 2, end);
            const lfo = ctx.createOscillator();              // a gentle wobble
            lfo.frequency.value = 5 + k;
            const lg = ctx.createGain();
            lg.gain.value = f * 0.01;
            lfo.connect(lg).connect(osc.frequency);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.05, now + seconds * 0.7);
            g.gain.exponentialRampToValueAtTime(0.0001, end + 0.4);
            osc.connect(g).connect(sfxBus);
            osc.start(now + k * 0.04); lfo.start(now);
            osc.stop(end + 0.5); lfo.stop(end + 0.5);
        });

        // The threshold: a soft low bloom as the light floods in
        const boom = ctx.createOscillator();
        boom.type = "sine";
        boom.frequency.setValueAtTime(70, end - 0.1);
        boom.frequency.exponentialRampToValueAtTime(38, end + 1.2);
        const bg = ctx.createGain();
        bg.gain.setValueAtTime(0.0001, end - 0.1);
        bg.gain.exponentialRampToValueAtTime(0.45, end);
        bg.gain.exponentialRampToValueAtTime(0.0001, end + 1.3);
        boom.connect(bg).connect(sfxBus);
        boom.start(end - 0.1);
        boom.stop(end + 1.4);
    }

    // Gallery side: the shimmer settling, a falling chime and a last breath of air
    function arrive() {
        if (!running()) return;
        const now = ctx.currentTime;
        [86, 83, 79, 76, 72].forEach((m, k) => {
            const t = now + k * 0.11;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
            osc.connect(g).connect(sfxBus);
            osc.start(t);
            osc.stop(t + 1.7);
        });
        const air = ctx.createBufferSource();
        air.buffer = noise;
        air.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(4000, now);
        lp.frequency.exponentialRampToValueAtTime(300, now + 1.2);
        const ag = ctx.createGain();
        ag.gain.setValueAtTime(0.25, now);
        ag.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        air.connect(lp).connect(ag).connect(sfxBus);
        air.start(now);
        air.stop(now + 1.3);
    }

    // ---------- The speaker button ----------

    function sync() {
        const live = running();
        const waiting = enabled && !live;   // on, but the browser hasn't allowed it yet
        buttons.forEach((b) => {
            b.setAttribute("aria-pressed", String(enabled));
            b.setAttribute("aria-label", !enabled ? "Turn sound on" : waiting ? "Sound is on: click anywhere to start it" : "Turn sound off");
            b.title = !enabled ? "Sound off" : waiting ? "Click anywhere for sound" : "Sound on";
            b.querySelector(".material-symbols-outlined").textContent = enabled ? "volume_up" : "volume_off";
            b.classList.toggle("sound-waiting", waiting);
        });
        listeners.forEach((fn) => fn({ enabled, live }));
    }

    // A ready-made toggle; `className` styles it to sit in each page's own chrome
    function button(className = "") {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.soundToggle = "";
        b.className = className;
        b.innerHTML = '<span class="material-symbols-outlined text-[20px]">volume_up</span>';
        b.addEventListener("click", () => {
            if (enabled && !running()) start();          // on but waiting: this click starts it
            else setEnabled(!enabled);
        });
        buttons.add(b);
        sync();
        return b;
    }

    // The pulse on the button needs a little CSS, shared by every page
    const style = document.createElement("style");
    style.textContent = `
        [data-sound-toggle] { position: relative; }
        [data-sound-toggle].sound-waiting::after {
            content: ""; position: absolute; inset: -3px; border-radius: 999px;
            border: 1.5px solid currentColor; opacity: .5;
            animation: soundPulse 1.8s ease-out infinite;
        }
        @keyframes soundPulse { from { transform: scale(.85); opacity: .6; } to { transform: scale(1.35); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { [data-sound-toggle].sound-waiting::after { animation: none; } }
    `;
    document.head.appendChild(style);

    return {
        start, portal, arrive, button,
        isOn: running,
        onChange: (fn) => listeners.add(fn),
    };
})();
