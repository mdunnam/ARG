---
applyTo: "assets/**,scripts/generate-*.js,scripts/create-*.ps1"
---

# Horror Signal Architect Context — Auto-loaded

When editing files in these paths you are working on media artifacts — audio, video, PDFs, or generation scripts. Every asset is a potential signal artifact. Apply horror signal discipline.

## Existing Signal Artifacts — Do Not Contradict

| Artifact | Path | Type | Hidden layer |
|---|---|---|---|
| `somnatek-fax-line.wav` | `assets/audio/` | 13s fax call audio | Morse `413` at 15 WPM / 700 Hz after handshake failure |
| `patient-intake-form.pdf` | `sites/somnatek/docs/` | Institutional PDF | Acrostic LORTIZ, ghost text, ModDate anomaly |
| `sleep-study-consent.pdf` | `sites/somnatek/docs/` | Institutional PDF | Acrostic NIGHTFLR, Protocol 7A §8.3 reference |
| `cpap-compliance-log.pdf` | `sites/somnatek/docs/` | Institutional PDF | All rows 4.13 hours (room 413), final note pre-discontinuation |
| `sleep-hygiene-guide.pdf` | `sites/somnatek/docs/` | Institutional PDF | Acrostic NIGHTFLOOR, publication code SHG-2009-018 |
| `insurance-auth-request.pdf` | `sites/somnatek/docs/` | Institutional PDF | Acrostic RECALL, ICD G47.413, HRWCO-FAC-0031 |

## Signal Artifact Design Rules

- **Era accuracy is mandatory** — 2008–2014 institutional for all Somnatek artifacts
- Every artifact must have both an atmospheric layer (what it feels like) and a puzzle layer (what it encodes)
- Distortion must be era-appropriate — low bitrate for phone/fax, hum/flutter for tape sources, clipping for analog-to-digital
- Hidden frame or subliminal content must connect to existing lore (room 413, PLEASE WAIT TO BE RECALLED, PTX IDs, Ortiz, corridor)
- Never use random distortion as decoration — every artifact of degradation should be period-accurate and purposeful

## Audio Generation Standards (for scripts)

When generating audio artifacts:
- Fax/phone content: 8kHz mono PCM, G.711 µ-law compatible
- Morse code: 15 WPM, 700 Hz, standard keying ratios (dot:dash:space = 1:3:7)
- Background tone: 60 Hz hum for institutional equipment ambience
- No synthetic horror sounds — only sounds that would exist in a 2008–2014 clinic environment

## PDF Generation Standards (for scripts)

When generating PDF artifacts:
- Author metadata: `L. Ortiz` or `M. Ellison` depending on document context
- ModDate: tied to specific lore events (never current date)
- Ghost text: white on white, selectable, positioned off main flow
- Acrostics: first letter of list items or paragraph-opening sentences
- Form numbers: trailing digits must map to PTX participant IDs if this document is part of the cross-form cipher

## Pending Artifacts (not yet built)

- `assets/fax/protocol-7a-p3.pdf` — Protocol 7A page 3, INTERNAL stamp, author L. Ortiz, post-closure ModDate, contains PLEASE WAIT TO BE RECALLED
- Session audio recordings (referenced in PTX-018 session notes — could be recovered diagnostic tapes)
- Facility announcement audio (clinic IVR main line content)

## Example Prompts

- "Generate the audio spec for a 2012-era clinic diagnostic tape — what would it contain at surface level, what is wrong underneath, and what puzzle layer is embedded"
- "Design the `protocol-7a-p3.pdf` fax artifact — what does it look like, what are the hidden layers, and what does a player do after receiving it"
- "The fax line morse clue is an orphaned signal — design a downstream artifact that connects `413` to a specific next step without making the path explicit"
- "Design a 30-second clinic IVR audio tree for `(404) 551-4145` — procedural, 2010-era, at least one option that shouldn't be there"
- "Write the generation script spec for a session audio artifact that would plausibly exist in the Somnatek archive — what format, what content, what hidden layer"
