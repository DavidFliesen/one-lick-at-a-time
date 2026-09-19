# One Lick at a Time ⚡🎸

**Learn lead guitar one lick at a time.** A fast, offline-capable Progressive Web App that helps you explore lead guitar riffs across genres — hear each lick, read the tab, understand the technique, and mark it learned as you build real playing skill.

No login. No ads. No dependencies. One self-contained static site you can host on GitHub Pages in minutes.

---

## Why this exists

Most guitar apps teach chords and rhythm. This one is about **playing lead** — the bends, slides, hammer-ons, pull-offs, and phrasing that make people feel the instrument. You get one lick at a time so you can actually absorb it, instead of drowning in a 200-page tab book.

Every lick ships with:

- an interactive **tab** you can play back and slow down,
- the **techniques** it drills (bends, slides, vibrato, palm-mute, etc.),
- a plain-English **"how to play it"** tip,
- a **"why it matters"** note so you know what the lick teaches you,
- and a **Learned** button so your progress is yours to keep (stored locally).

Then share what you're working on — X, Facebook, Reddit, WhatsApp, Telegram, native share, or copy link.

---

## Features

- **16 original teaching licks** across Blues, Rock, Metal, Country, Funk, Surf, Jazz, Folk, Shred, Reggae, Pop, Rockabilly, Ambient and more.
- **Amp & pedalboard sound engine** — a Karplus–Strong string runs into a modeled signal chain: a tube-style overdrive (soft-clip waveshaper with 4× oversampling), a two-stage speaker-cabinet filter with a presence peak, a bass/mid/treble tone stack, a glue compressor, and a pedalboard of tape-style delay (filtered feedback), chorus, and reverb. Tone follows the genre automatically — **clean** for jazz/folk/ambient/pop/funk, **crunch** for blues/rock/country/surf, **high-gain** for metal/shred. No samples, no soundfonts, no impulse files — it's all generated in the Web Audio graph, fully offline. Bends, slides, vibrato and palm-mutes are modeled per note.
- **Interactive tablature** with a moving playhead and an adjustable tempo (50–130%).
- **Genre & difficulty filters**, Prev/Next deck navigation, **Surprise me** (shuffle), and a deterministic **Lick of the day**.
- **Progress tracking** (explored + learned) saved to `localStorage`.
- **Deep links** — every lick has its own `#id` URL, so shared links open right to that riff.
- **Installable PWA** with a service worker for offline play.
- **Keyboard**: `Space` = play/stop, `←`/`→` = previous/next.

---

## Run it locally

Because scripts and the service worker are loaded over HTTP(S), open it through a tiny web server rather than `file://`:

```bash
# from the project root
python3 -m http.server 8080
# then visit http://localhost:8080
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

### Single-file build (optional)

The repo is split into `css/`, `js/`, and `assets/` for clean editing. To generate one self-contained `.html` (fonts, styles, scripts, and logo all inlined) for a quick share or a truly file-only offline copy:

```bash
node build/inline.js one-lick-standalone.html
```

The split repo is the source of truth; the single file is generated output. (The service worker and manifest are intentionally dropped from the single-file build, since a lone file can't use them.)

---

## Deploy to GitHub Pages

1. Create a repo (e.g. `one-lick-at-a-time`) and push these files to the `main` branch, preserving the folder structure (`css/`, `js/`, `assets/` must stay nested).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose **Branch: `main`**, **Folder: `/ (root)`**, then **Save**.
4. Wait ~1 minute. Your app is live at `https://<your-username>.github.io/<repo-name>/`.

Everything is relative-pathed, so it works from a project subpath (`/one-lick-at-a-time/`) without changes. To use a custom domain, add a `CNAME` file per GitHub's docs.

---

## Add your own licks

All content lives in **`js/licks.js`** as `window.OLAT_LICKS`, an array of lick objects. Add an entry and reload — no build step.

```js
{
  id: "my-first-lick",           // unique, URL-safe (used in the #deep-link)
  name: "My First Lick",
  genre: "Blues",                // becomes a filter pill automatically
  difficulty: "Beginner",        // Beginner | Intermediate | Advanced
  key: "A minor",
  bpm: 92,
  techniques: ["Bend", "Vibrato"],
  tip: "Push the 7th-fret bend up a full step and let it sing.",
  why: "Teaches you to bend in tune — the heart of blues phrasing.",
  notes: [
    { d: 1, notes: [ { s: 3, f: 7, t: "b", ba: 2 } ] }, // beat: bend up 2 semitones
    { d: 1, notes: [ { s: 2, f: 8, t: "v" } ] },        // vibrato
    { d: 2, r: true }                                    // rest for 2 beats
  ]
}
```

**Note event schema**

| Field | Meaning |
|------|---------|
| `d` | duration in beats (relative to the lick's `bpm`) |
| `r: true` | this event is a rest (omit `notes`) |
| `notes[]` | one or more simultaneous notes |
| `s` | string, `1` = high E … `6` = low E |
| `f` | fret number (`0` = open) |
| `t` | technique: `h` hammer-on, `p` pull-off, `b` bend, `r` release, `sl` slide, `v` vibrato, `pm` palm-mute, `x` dead note |
| `ba` | bend amount in semitones (default `2` = full step) when `t:"b"` |

Open-string tuning is standard EADGBE. If you add a lick, remember to keep `id` unique — it's what deep links and the service-worker cache key off of.

---

## Content & licensing

**All licks in this app are original teaching phrases** — short scale runs, technique drills, and idiomatic patterns written from scratch for this project. They are *not* transcriptions of copyrighted songs, so there is nothing to license and you're free to learn from and share them.

If you want to grow the library from existing notation, the section below covers the legal, open-source landscape.

---

## Research: open tablature resources & Python libraries

You asked what's actually usable — with legal rights — for sourcing lead-guitar tablature, and which Python libraries help. Here's the landscape. The short version: **most tab sites are copyrighted and off-limits; the safe path is open notation formats + public-domain / permissively-licensed corpora, converted to this app's JSON with Python.**

### Formats that are open by design

- **MusicXML** — the interchange standard for sheet music; widely exportable from notation software and readable by many libraries. The *format* is open; individual files carry their own copyright.
- **ABC notation** — a compact text format with enormous public-domain folk/traditional collections (e.g. the tunebooks behind thesession.org's public-domain traditional tunes). Great for melodic lead lines.
- **Guitar Pro** (`.gp3/.gp4/.gp5/.gpx/.gp`) — the de-facto tab format. The *files* are usually copyrighted; the format can be parsed programmatically (see PyGuitarPro).

### Libraries (Python unless noted)

- **PyGuitarPro** (LGPL) — read/write Guitar Pro files in Python. Ideal for a Colab batch job that parses `.gp*` files and maps notes → this app's `{s,f,t}` schema.
- **music21** (BSD) — MIT/Berklee's computational-musicology toolkit. Parses MusicXML, ABC, MIDI, and more; excellent for extracting notes, keys, and fret candidates programmatically.
- **Guitar Pro → MusicXML via MuseScore** — MuseScore (GPL) can batch-convert many formats from the command line, a handy normalization step before parsing with music21.
- **alphaTab** (MPL-2.0, JS/TS) — renders Guitar Pro and its own `alphaTex` text notation and plays via soundfont. Powerful, but heavy (soundfont-dependent), which is why this app rolls a lightweight custom renderer + synth instead. Good to know if you ever want full-score rendering.
- **VexFlow / VexTab** (MIT, JS) — music/tab notation rendering in the browser; `VexTab` is a concise text tab language. A solid MIT-licensed option if you outgrow the custom renderer.

### Corpora with real usage rights

- **OpenScore** (MuseScore) — scores released into the **public domain (CC0)**; classical-leaning but a clean, redistributable source.
- **Mutopia Project** — free sheet music under public domain / Creative Commons.
- **thesession.org** — large body of **public-domain** traditional tunes in ABC (check each tune/setting's status).
- **DadaGP** — a research dataset of Guitar Pro files tokenized for ML. Useful for study, but **verify the license before redistributing** any derived tabs; much of the underlying material is copyrighted.

### What to avoid

Ultimate Guitar, Songsterr, and virtually all "song tab" sites host **copyrighted transcriptions**. Scraping or redistributing them isn't legal for a public app — don't build the library from these.

### Suggested pipeline (matches your Colab offer)

If you want to expand beyond the original licks, a clean, license-safe workflow:

1. **Collect** only public-domain / CC0 / permissively-licensed sources (OpenScore, Mutopia, ABC public-domain tunes).
2. In a **Google Colab** notebook, parse with **music21** (MusicXML/ABC) or **PyGuitarPro** (`.gp*` you have the rights to).
3. For each phrase, pick a playable fretting (lowest-position or user-specified), and emit an object in this app's lick schema (`id/name/genre/difficulty/key/bpm/techniques/notes`).
4. Append the generated objects to `js/licks.js`.

That keeps everything you ship either **original** or **properly licensed**, with Python doing the heavy lifting exactly where you offered to run it.

*(Licenses noted from each project's stated terms; confirm the current license of any specific file or dataset before redistribution.)*

---

## Tech notes

- Vanilla JS, no framework, no build required (the inliner is optional).
- Web Audio API for synthesis and the amp/pedalboard chain (drive curve, cabinet, delay, chorus and reverb are all generated — no external audio assets); `localStorage` for progress; a cache-first service worker for offline.
- Fonts (Anton, Sora, Roboto Mono) are self-hosted under `assets/fonts/` so nothing is fetched from a CDN — it works fully offline.

Made for players who want to **lead**. Practice a little every day. ⚡
