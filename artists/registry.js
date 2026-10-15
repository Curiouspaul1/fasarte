/*
 * Fasarte: the hall's registry.
 *
 * The hall reads only this file, so it stays light however many galleries there are.
 * Each maker's full catalogue lives in artists/<slug>/catalogue.js and is loaded only
 * when someone steps into that gallery.
 *
 * A maker can also be given a domain of their own (`domain: "orneril.com"`), and
 * `detached: true` makes their gallery stand alone: no breadcrumb or exits back into
 * the hall. That is the "detach a listing" option.
 *
 * To add a maker:
 *   1. Create artists/<slug>/catalogue.js (copy artists/orneril/catalogue.js as a template).
 *   2. Add an entry to `artists` below. `cover` is the piece that hangs in the hall.
 *   3. Lower that wing's `openWalls` by one if you want the hall to stay the same length.
 */
const fasarte = {
    name: "Fasarte",
    tagline: "A hall of handcraft",

    // The hall's own domain. Galleries are paths on it (fasarte.com/orneril); once
    // wildcard DNS is set up they also answer on subdomains (orneril.fasarte.com).
    domain: "fasarte.com",

    // Where the empty portals send makers who want to exhibit. Either can be left empty;
    // whichever is set becomes a button. (Not filled in yet.)
    contact: {
        email: "",      // e.g. "hello@fasarte.com": shown as "Contact the curator"
        signupUrl: "",  // e.g. a form link: shown as "Apply to exhibit"
    },

    // Wings of the hall, in walking order. `openWalls` is how many empty portals the wing
    // shows after its makers, inviting new ones.
    wings: [
        { id: "beadwork", title: "Beadwork", blurb: "Strung, stitched and knotted, one bead at a time.", openWalls: 2 },
        { id: "fibre", title: "Textiles & Fibre", blurb: "Woven, knitted, crocheted, embroidered and dyed.", openWalls: 2 },
        { id: "clay", title: "Ceramics & Clay", blurb: "Thrown, coiled, glazed and fired.", openWalls: 2 },
        { id: "wood", title: "Wood & Carving", blurb: "Turned, carved, joined and finished.", openWalls: 2 },
        { id: "leather", title: "Leather & Metal", blurb: "Tooled, stitched, forged and set.", openWalls: 2 },
    ],

    artists: [
        {
            slug: "orneril",
            name: "Orneril",
            wing: "beadwork",
            craft: "Hand-strung jewellery",
            location: "",
            since: 2023,
            works: 34, // keep in step with the catalogue
            cover: { src: "/artists/orneril/images/works/lumera/1-sm.jpg", title: "Lumera" },
            palette: ["#f2a7bd", "#b9a2d9", "#b8cf8a"],
            domain: "",          // a domain of their own, e.g. "orneril.com"
            detached: false,     // true: the gallery stands alone, without the hall around it
        },
    ],
};
