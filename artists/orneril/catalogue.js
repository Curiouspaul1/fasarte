/*
 * Orneril: exhibition catalogue (an Artestoa gallery).
 *
 * This file is also the template for adding a maker. It registers itself with
 * Artestoa.registerCatalogue(slug, { gallery, theme, artist, rooms, works }).
 *
 * Each "work" is one piece (or one matched set). `images[0]` is the hero shot;
 * every image has a full-size `src` (~1800px) and a grid thumbnail `sm` (~720px),
 * with paths relative to this folder. `palette` holds the piece's colours; it drives
 * the coloured ambient light. Rooms are the gallery's sections; each work belongs
 * to exactly one room. Everything is wrapped in a function so several catalogues
 * can be loaded on one page without their helpers colliding.
 */
(() => {

const img = (slug, n) => ({
    src: `images/works/${slug}/${n}.jpg`,
    sm: `images/works/${slug}/${n}-sm.jpg`,
});
const shots = (slug, count) => Array.from({ length: count }, (_, i) => img(slug, i + 1));
const archive = (n) => ({
    src: `images/archive/img_${n}.jpeg`,
    sm: `images/archive/img_${n}.jpeg`,
});

const rooms = [
    {
        id: "necklaces",
        numeral: "I",
        title: "Necklaces",
        intro: "Single strands, read slowly. Stone, wood, shell and glass, each one strung to sit at the collarbone and catch whatever light the day offers.",
    },
    {
        id: "sets",
        numeral: "II",
        title: "Sets",
        intro: "Pieces made to be worn together: a necklace and its bracelets, cut from the same palette and the same afternoon.",
    },
    {
        id: "bracelets",
        numeral: "III",
        title: "Colour Themed Bracelets",
        intro: "A series in six colours. Each bracelet commits fully to one hue, then hides small stories in its charms: an anchor, a key, a tree, a single feather.",
    },
    {
        id: "lanyards",
        numeral: "IV",
        title: "Phone Lanyards",
        intro: "Jewellery for the thing you hold most. Playful, loud and tactile: hearts, smiles, flowers and stars on a loop.",
    },
    {
        id: "archive",
        numeral: "V",
        title: "From the Archive",
        intro: "Studies, early pieces and work photographed in passing. Untitled for now, kept because they show the hand learning.",
    },
];

const works = [
    // ---------- Room I — Necklaces ----------
    {
        id: "terravine",
        title: "Terravine",
        room: "necklaces",
        type: "Necklace",
        year: 2023,
        materials: "Wood, painted wood",
        palette: ["#8a4a24", "#c9902f", "#2f6b4a"],
        featured: true,
        description:
            "Polished wooden beads in mahogany, honey and pine, broken at intervals by rings of forest green. Photographed in raking afternoon sun, Terravine reads like a cross-section of a tree: warm, grounded and unhurried.",
        images: shots("terravine", 2),
    },
    {
        id: "sombre-i",
        title: "Sombre I",
        room: "necklaces",
        type: "Necklace",
        year: 2023,
        materials: "Jasper, onyx, metal pendant",
        palette: ["#2b2a26", "#8c7d5c", "#d8cfb8"],
        featured: false,
        description:
            "Banded tan jasper alternates with matte black onyx, finished with a slim dark-metal pendant. The first of two studies in quiet, earthen darks.",
        images: shots("sombre-i", 1),
    },
    {
        id: "sombre-ii",
        title: "Sombre II",
        room: "necklaces",
        type: "Necklace",
        year: 2024,
        materials: "Hematite, zebra jasper",
        palette: ["#2c2d30", "#6f6f73", "#e9e3d6"],
        featured: false,
        description:
            "The second Sombre trades warmth for steel: mirror-bright hematite set against swirled black-and-cream zebra jasper. Look closely and every stone carries its own contour map.",
        images: shots("sombre-ii", 1),
    },
    {
        id: "evil-eye",
        title: "Evil Eye",
        room: "necklaces",
        type: "Necklace",
        year: 2024,
        materials: "Howlite, onyx, glass eye beads",
        palette: ["#151515", "#f2f0ea", "#9aa0a6"],
        featured: false,
        description:
            "A protective strand in strict monochrome. Veined white howlite and glossy onyx frame black-and-white nazar beads, watchful eyes said to turn ill will back on itself.",
        images: shots("evil-eye", 2),
    },
    {
        id: "aritesh",
        title: "Aritesh",
        room: "necklaces",
        type: "Necklace",
        year: 2025,
        materials: "Cowrie shell, crackle glass, jade-tone glass",
        palette: ["#2f8f3a", "#a6c96a", "#d9c6a5"],
        featured: true,
        description:
            "Every green the sea can hold: crackle glass, frosted lime and deep bottle-green, interrupted by natural cowrie shells. Cowries once travelled as currency; here they mark the strand like small, pale treasures.",
        images: shots("aritesh", 2),
    },
    {
        id: "lumera",
        title: "Lumera",
        room: "necklaces",
        type: "Necklace",
        year: 2025,
        materials: "Crackle glass",
        palette: ["#f2a7bd", "#b9a2d9", "#b8cf8a"],
        featured: true,
        description:
            "Sugared-almond pastels (rose, lilac and pistachio) in crackle glass that holds light inside its fractures. Lumera is the softest piece in the room, and the most luminous.",
        images: shots("lumera", 1),
    },
    {
        id: "noirelune",
        title: "Noirelune",
        room: "necklaces",
        type: "Necklace",
        year: 2025,
        materials: "Onyx, crackle quartz, picture jasper, silver-tone charms",
        palette: ["#121212", "#c9ccd1", "#7c7f84"],
        featured: true,
        description:
            "A black moon of a necklace. Onyx and ice-clear crackle quartz alternate with grey picture jasper, while tiny silver charms (a turtle, a star, a leaping fish, a cowrie) drift through it like a night tide.",
        images: shots("noirelune", 2),
    },

    // ---------- Room II — Sets ----------
    {
        id: "fadaka",
        title: "Fadaka Set",
        room: "sets",
        type: "Necklace & Bracelet",
        year: 2024,
        materials: "Hematite pearls, silver-tone charms",
        palette: ["#8f9299", "#c7cad0", "#4b4e55"],
        featured: true,
        description:
            "Fadaka means silver in Yoruba, and this set is exactly that: gunmetal hematite pearls strung with a cabinet of silver curiosities. Palm, owl, turtle, tree of life, cowrie and a Buddha head. Necklace and bracelet were made to be read side by side.",
        images: shots("fadaka", 3),
    },
    {
        id: "holy-trinity",
        title: "The Holy Trinity",
        room: "sets",
        type: "Necklace & Two Bracelets",
        year: 2024,
        materials: "Lava stone, onyx, hematite, metal crosses",
        palette: ["#0f0f12", "#c9a23a", "#3a3a40"],
        featured: true,
        description:
            "Three pieces, one devotion. Matte lava stone and faceted onyx form a necklace and two stretch bracelets, each finished with a cross: dark steel, hematite and gold. Worn together or apart, they are always a trinity.",
        images: shots("holy-trinity", 3),
    },

    // ---------- Room III — Colour Themed Bracelets ----------
    {
        id: "tide",
        title: "Tide",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · Blue",
        year: 2023,
        materials: "Turquoise-tone glass, howlite, seed beads, metal charms",
        palette: ["#2aa7d8", "#f1efe9", "#c99a3a"],
        featured: false,
        description:
            "The blue of the series, and its most nautical. Scallop shells, a die, an anchor and an old key hang among turquoise chips, as if the bracelet had been washed up rather than made.",
        images: shots("tide", 1),
    },
    {
        id: "citrus",
        title: "Citrus",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · Yellow",
        year: 2024,
        materials: "Glass, polymer clay fruit, seed beads, metal charms",
        palette: ["#f5d90a", "#f2a20c", "#3c9b3c"],
        featured: false,
        description:
            "Pure sunshine. A lemon slice, a pineapple and a pair of bananas sit among heart and daisy beads, with a silver feather to keep it light on the wrist.",
        images: shots("citrus", 1),
    },
    {
        id: "fern",
        title: "Fern",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · Green",
        year: 2024,
        materials: "Glass, shell-form beads, metal charms",
        palette: ["#2f9b4b", "#9bd27a", "#c6a03b"],
        featured: false,
        description:
            "Green layered on green: a marbled glass heart, scallop shells, smiling beads and a gilt butterfly. A small owl charm keeps watch from the clasp.",
        images: shots("fern", 1),
    },
    {
        id: "lilac",
        title: "Lilac",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · Purple",
        year: 2024,
        materials: "Glass, iridescent butterflies, metal charms",
        palette: ["#7c3aa8", "#b88ad9", "#d4b06a"],
        featured: false,
        description:
            "Violet flowers and iridescent butterflies orbit a silver tree of life. The most romantic of the six, it shifts from plum to petrol-blue as it moves.",
        images: shots("lilac", 1),
    },
    {
        id: "blush",
        title: "Blush",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · Pink",
        year: 2024,
        materials: "Glass pearls, shell-form beads, metal charms",
        palette: ["#e2337a", "#f6a3c2", "#d0a640"],
        featured: false,
        description:
            "Hot pink to petal pink, anchored, literally, by a silver anchor at its centre. Shells, a gold leaf and a pale butterfly make it a seaside daydream.",
        images: shots("blush", 1),
    },
    {
        id: "marble",
        title: "Marble",
        series: "Colour Themed Bracelets",
        room: "bracelets",
        type: "Bracelet · White",
        year: 2024,
        materials: "Howlite, letter beads, silver-tone charms",
        palette: ["#f2f1ee", "#9c9c9c", "#2b2b2b"],
        featured: false,
        description:
            "The series rests on white. Veined howlite carries a yin-yang, a music note, a feather and a safety pin. A quieter bracelet, but a personal one.",
        images: shots("marble", 1),
    },

    // ---------- Room IV — Phone Lanyards ----------
    {
        id: "lanyard-violet",
        title: "Violet Hour",
        series: "Phone Lanyards",
        room: "lanyards",
        type: "Phone Lanyard",
        year: 2024,
        materials: "Lava stone, acrylic, polymer clay",
        palette: ["#7a2fd0", "#ff3d8b", "#1b1b1b"],
        featured: false,
        description:
            "Black lava stone punctuated with violet hearts, a coral shell and a fruit slice or two. Equal parts goth and candy shop.",
        images: shots("lanyard-violet", 1),
    },
    {
        id: "lanyard-lagoon",
        title: "Lagoon",
        series: "Phone Lanyards",
        room: "lanyards",
        type: "Phone Lanyard",
        year: 2024,
        materials: "Turquoise-tone stone, acrylic, polymer clay",
        palette: ["#1fb4d6", "#7fe0e8", "#f4e04d"],
        featured: false,
        description:
            "A lagoon in miniature: turquoise chips, glossy hearts and a scatter of yellow smileys bobbing on the surface.",
        images: shots("lanyard-lagoon", 1),
    },
    {
        id: "lanyard-bubblegum",
        title: "Bubblegum",
        series: "Phone Lanyards",
        room: "lanyards",
        type: "Phone Lanyard",
        year: 2024,
        materials: "Acrylic, glass pearls, polymer clay",
        palette: ["#f48fb1", "#ff4f9a", "#2b2b2b"],
        featured: false,
        description:
            "A pink butterfly leads a parade of stars, smiles, pearls and checkerboard beads. Shown here clipped to its phone, exactly where it belongs.",
        images: shots("lanyard-bubblegum", 1),
    },
    {
        id: "lanyard-meadow",
        title: "Meadow",
        series: "Phone Lanyards",
        room: "lanyards",
        type: "Phone Lanyard",
        year: 2025,
        materials: "Acrylic, wood, glass pearls, polymer clay",
        palette: ["#7ed321", "#3fae5a", "#9a5a2e"],
        featured: false,
        description:
            "Spring-green flowers, a smiling sun, a star and a shell, warmed by wooden beads. The newest lanyard, and the most cheerful thing in the gallery.",
        images: shots("lanyard-meadow", 1),
    },

    // ---------- Room V — From the Archive ----------
    ...[
        [5, "Glasses Chain, Lime", "Glasses Chain", "Green seed beads strung to hold a pair of sunglasses.", ["#9ccc3a", "#3f9b3a", "#e8e4d8"]],
        [30, "Glasses Chain, Citron", "Glasses Chain", "A fine yellow strand, held up to the light.", ["#e9d83a", "#b8d23a", "#f1efe6"]],
        [32, "Glasses Chain, Sky", "Glasses Chain", "Pale blue and white, almost weightless.", ["#7fb6e0", "#3f7fc0", "#f1efe6"]],
        [22, "Yin & Yang", "Necklace", "Black beads around a single yin-yang pendant.", ["#151515", "#f2f0ea", "#5a5a5a"]],
        [18, "Plum Study", "Necklace", "Purple and smoke-grey beads in an even rhythm.", ["#7a4a8f", "#a98bb8", "#6f6f73"]],
        [27, "Sand Study", "Necklace", "Cream and bronze, close in tone.", ["#d9c9a8", "#9a6b3a", "#5a4a3a"]],
        [15, "Amber Wood", "Bracelet", "Warm wooden and amber-tone beads.", ["#c98a3a", "#8a4a24", "#e0b56a"]],
        [14, "Black Charm", "Bracelet", "Matte black beads with a single silver charm.", ["#151515", "#9a9a9a", "#4a4a4a"]],
        [16, "Monochrome I", "Bracelet", "Patterned black-and-white stones.", ["#1b1b1b", "#e9e3d6", "#7c7f84"]],
        [17, "Monochrome II", "Bracelet", "A second variation in black and white.", ["#1b1b1b", "#e9e3d6", "#7c7f84"]],
        [31, "Sunlit I", "Bracelet", "Mixed stones, photographed in a bar of sunlight.", ["#4a3a2a", "#b8874a", "#7c7f84"]],
        [33, "Sunlit II", "Bracelet", "Dark beads caught in the same afternoon light.", ["#2b2a26", "#8c7d5c", "#d8cfb8"]],
        [38, "Sunlit III", "Bracelet", "A third piece from the sunlit sessions.", ["#3a6fb0", "#c9902f", "#2b2a26"]],
        [39, "On the Wrist", "Bracelet", "Worn rather than displayed.", ["#2f6fb0", "#c9902f", "#1b1b1b"]],
        [40, "Blue & Bone", "Bracelet", "Blue stones and pale beads in a loose mix.", ["#2aa7d8", "#f1efe9", "#1f6f9a"]],
    ].map(([n, title, type, description, palette]) => ({
        id: `archive-${n}`,
        title: `Untitled (${title})`,
        room: "archive",
        type,
        year: null,
        materials: "Mixed beads",
        palette,
        featured: false,
        description,
        images: [archive(n)],
    })),
];

/*
 * The artist. Fill these in: anything left empty is simply not shown
 * (an empty `portrait` shows a monogram; an empty `name` falls back to the studio).
 */
const artist = {
    name: "",                 // e.g. "Ada Okafor"
    role: "Bead artist · Founder of Orneril",
    location: "",             // e.g. "Lagos, Nigeria"
    portrait: "",             // e.g. "images/artist.jpg", relative to this folder (portrait orientation works best)
    quote: "",                // a line in the artist's own words
    bio: [
        "Orneril began with a single strand and a habit of sorting beads by colour. Every piece since has been designed, strung and finished entirely by hand, one bead at a time.",
        "The work moves between quiet and loud: earthy wood and stone necklaces, monochrome studies in onyx and howlite, and joyful, colour-saturated bracelets and lanyards. Each one starts from a palette, and most hide a small story in their charms: an anchor, a cowrie, a turtle, a cross.",
    ],
    links: [
        // { label: "Instagram", href: "https://instagram.com/…" },
        // { label: "Email", href: "mailto:…" },
    ],
    // Shown as "Signature materials", counted across the works' `materials`
    materials: ["crackle glass", "hematite", "howlite", "onyx", "jasper", "lava stone", "cowrie", "wood", "polymer clay", "acrylic", "glass pearls", "turquoise"],
};

Artestoa.registerCatalogue("orneril", {
    gallery: {
        title: "Orneril",
        kicker: "A Digital Exhibition • Handcrafted Beadwork",
        intro: "Stone, glass, wood and shell, strung one bead at a time. Walk the rooms, step close to any piece, and look for the small stories hidden in its charms.",
        exit: "Orneril is a small studio making jewellery entirely by hand: necklaces, bracelets, sets and phone lanyards, each one designed around a single palette or story. Every piece in this exhibition was strung, finished and photographed in the studio between 2023 and 2025.",
        // Rooms left out of the guided tour
        tourSkips: ["archive"],
    },
    theme: { accent: "#6B8E23" },
    artist,
    rooms,
    works,
});

})();
