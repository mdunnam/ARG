# Somnatek ARG — Agent Roster

This file defines the custom agent modes available for this project and the rules for using them.
All agents are stored in the user profile at `%APPDATA%\Code\User\prompts\*.agent.md`.

---

## Routing Rules

- **Code, infrastructure, Lambda, CDK, scripts:** use **Senior SWE**.
- **In-world HTML/CSS/JS, forum pages, fake documents:** use **Web Reality Fabricator**.
- **Lore, character arcs, world history, classified documents:** use **Narrative Architect**.
- **Puzzle design, cipher chains, hidden clues:** use **Puzzle Architect** then validate with **Puzzle QA**.
- **Cipher encoding only (no narrative):** use **Crypto Architect**.
- **Psychological tension, NPC manipulation, player dread:** use **Psych Architect**.
- **Entry points, viral hooks, discovery funnels:** use **Rabbit Hole Architect**.
- **Analog horror media, VHS artifacts, audio signals:** use **Horror Signal Architect**.
- **Community coordination, swarm puzzles, Discord mechanics:** use **Community Swarm Architect**.
- **Flow, pacing, bottleneck analysis, progression maps:** use **Flow Engineer**.
- **Revenue models, merch, Patreon, evidence kits:** use **Monetization Architect**.
- **Live drops, NPC events, solve-triggered unlocks:** use **Live Ops Puppetmaster**.
- **Viral moments, Reddit/TikTok/YouTube strategy:** use **Viral Growth Architect**.
- **Clue tracking, evidence timelines, theory boards:** use **Evidence Board**.
- **Doc consistency audits, changelog, stale doc detection, post-deploy doc sync:** use **Documentation Steward**.

When in doubt, use **Senior SWE** for anything touching deployed code, and **Narrative Architect** for anything touching lore or docs.

---

## Agent Definitions

### Senior SWE
**Tools:** read, edit, search, execute, todo
**Use for:** writing production code, debugging, reviewing code, refactoring, designing systems, analyzing architecture, investigating bugs, improving code quality, adding tests. Senior software engineering tasks across any language or stack.
**File scope:** `lambda/**`, `infra/**`, `scripts/**`, `sites/**` (code only)

---

### Web Reality Fabricator
**Tools:** read, search, edit, todo
**Use for:** building fake websites, writing employee pages, designing broken archives, writing forum posts, news articles, cached page histories, or embedding hidden source code clues for the Somnatek ARG. Use when the job is making the world feel like it existed before the player arrived.
**Do NOT use for:** puzzle mechanics (use Puzzle Architect) or lore structure (use Narrative Architect).
**File scope:** `sites/**`

---

### Narrative Architect
**Tools:** read, search, edit, todo
**Use for:** designing ARG lore, building mystery worldbuilding, creating factions, engineering coverup mechanics, designing character backstories, building fake company histories, planning multi-year narrative arcs, writing classified-feeling documents, designing reveal roadmaps, or constructing belief systems for the Somnatek ARG.
**Do NOT use for:** general coding tasks or puzzle mechanics.
**File scope:** `docs/**`

---

### Puzzle Architect
**Tools:** read, search, edit, todo
**Use for:** designing puzzles, ARG mechanics, ciphers, hidden clues, breadcrumb trails, mystery structures, escape room flows, lore reveals, community-level meta puzzles, steganography, acrostics, codex systems, difficulty balancing, or any puzzle engineering for the Somnatek ARG.
**Do NOT use for:** general coding tasks.
**File scope:** `docs/**`, `sites/somnatek/archive/**`, `sites/somnatek/portal/**`, `assets/**`

---

### Puzzle QA
**Tools:** read, search, edit, todo
**Use for:** stress-testing puzzles, auditing ARG mechanics, reviewing cipher chains, checking clue paths for broken logic, identifying brute-force exploits, diagnosing pacing problems, or validating any puzzle system before it goes live in the Somnatek ARG. Use before shipping any new puzzle layer.
**File scope:** `sites/somnatek/archive/**`, `sites/somnatek/portal/**`, `lambda/**`, `docs/**`

---

### Crypto Architect
**Tools:** read, search, edit, todo
**Use for:** designing ciphers, encoding schemes, hidden message systems, symbol languages, multi-stage cipher chains, steganography, book ciphers, acrostics, or any cryptographic puzzle layer for the Somnatek ARG.
**Do NOT use for:** general narrative design (use Narrative Architect) or entry-point hooks (use Rabbit Hole Architect).
**File scope:** `sites/somnatek/archive/**`, `sites/somnatek/portal/**`, `assets/**`, `docs/**`

---

### Psych Architect
**Tools:** read, search, edit, todo
**Use for:** designing emotional tension, paranoia, trust erosion, reality ambiguity, dread escalation, NPC manipulation plans, tone shift timelines, obsession loop triggers, or any psychological pressure system for the Somnatek ARG.
**Do NOT use for:** cipher design (use Crypto Architect) or lore structure (use Narrative Architect).
**File scope:** `sites/**`, `docs/**`

---

### Rabbit Hole Architect
**Tools:** read, search, edit, todo
**Use for:** designing ARG entry points, first contact hooks, discovery funnels, viral drops, hidden website anomalies, creepy review strategies, QR chains, voicemail trails, social media breadcrumbs, or any moment where a normal person should stumble into the Somnatek ARG and be unable to stop.
**Do NOT use for:** lore design (use Narrative Architect) or puzzle mechanics (use Puzzle Architect).
**File scope:** `sites/somnatek/*.html`, `sites/somnatek/*.txt`, `sites/somnatek/img/**`, `docs/**`

---

### Horror Signal Architect
**Tools:** read, search, edit, todo
**Use for:** designing analog horror media, VHS distortion clues, broadcast interruption artifacts, numbers station systems, hidden frame puzzles, subliminal text, distorted audio transmissions, or any signal-based horror media for the Somnatek ARG.
**Do NOT use for:** lore structure (use Narrative Architect) or cipher mechanics (use Crypto Architect).
**File scope:** `assets/**`, `scripts/generate-*.js`, `scripts/create-*.ps1`

---

### Community Swarm Architect
**Tools:** read, search, edit, todo
**Use for:** designing community coordination puzzles, swarm mechanics, Discord architecture, multi-player investigation systems, timezone unlocks, distributed clue systems, community spreadsheet structures, viral spread strategies, or any puzzle requiring strangers to collaborate for the Somnatek ARG.
**Do NOT use for:** individual cipher design (use Crypto Architect) or flow pacing (use Flow Engineer).
**File scope:** `docs/**`, `scripts/**`

---

### Flow Engineer
**Tools:** read, search, edit, todo
**Use for:** designing puzzle flow, room progression maps, player pacing, bottleneck analysis, parallel path design, hint ladder systems, reveal moment engineering, finale climax design, or any momentum-control work for the Somnatek ARG or escape room experiences.
**Do NOT use for:** individual cipher design (use Crypto Architect) or lore structure (use Narrative Architect).
**File scope:** `docs/**`

---

### Monetization Architect
**Tools:** read, search, edit, todo
**Use for:** designing revenue models, Patreon tiers, merchandise, membership structures, event monetization, physical evidence kits, or any funding strategy for the Somnatek ARG that must not compromise immersion, community trust, or the free player experience.
**File scope:** `docs/**`

---

### Live Ops Puppetmaster
**Tools:** read, search, edit, execute, todo
**Use for:** planning live content drops, real-time ARG updates, solve-triggered unlocks, NPC live events, community stall recovery, content cadence scheduling, or any real-time orchestration of the Somnatek ARG as players are actively investigating. Use when the world needs to respond to players.
**File scope:** `docs/**`, `scripts/**`

---

### Viral Growth Architect
**Tools:** read, search, edit, todo
**Use for:** designing viral moments, shareable content hooks, Reddit drop strategies, TikTok clips, YouTube lore bait, creator amplification, community snowball mechanics, or any organic growth engineering for the Somnatek ARG.
**Do NOT use for:** puzzle design (use Puzzle Architect) or entry-point hooks (use Rabbit Hole Architect).
**File scope:** `docs/**`

---

### Evidence Board
**Tools:** read, search, edit, todo
**Use for:** organizing ARG clue tracking, building evidence timelines, mapping contradictions, tracking solve status, managing community theory boards, creating player onboarding recaps, or building the intelligence structure that keeps the Somnatek ARG community oriented. Use when scattered information needs to become structured intelligence.
**File scope:** `docs/**`

---

### Documentation Steward
**Tools:** read, search, edit, todo
**Use for:** auditing documentation for consistency, synchronizing docs with code changes, finding stale or contradictory information across docs, updating changelogs, detecting false positives in audit files, reconciling docs after deployments or architectural changes. Use any time documentation may be lying to the project.
**Do NOT use for:** narrative lore design (use Narrative Architect), puzzle mechanics (use Puzzle Architect), or general coding (use Senior SWE).
**File scope:** `docs/**`, `*.md`

---

## Shared Rules — All Agents

These rules apply regardless of which agent is active.

### Lore Consistency
- Clinic name: Somnatek Sleep Health Center
- County: Harrow County
- University: Wexler University
- Corporate successor: Dorsal Health Holdings LLC
- Medical director: Dr. Mara Ellison
- University researcher: Dr. Edwin Vale
- Sleep technician: Lena Ortiz
- Patient IDs: PTX-XXX (study participants), VIS-XXXXX (later visitors/players)
- Key room: 413
- Key phrase: PLEASE WAIT TO BE RECALLED
- Study period: 2008–2013. Clinic closed publicly 2014.
- Protocol: Protocol 7A
- Shared environment names: the Dorsal site, the night floor, the indexed space. Never "dream" in internal documents after 2011.
- The blue door is always on the left. The hallway always bends left.
- Participant count: 47 enrolled. 7 concluded/withdrawn. 40 transferred (active).
- Last PTX ID: PTX-047. VIS series begins at VIS-00001. The player is the next entry.

### Tone
- Write clinic copy as if no one expects anyone to read it carefully.
- Never use horror adjectives: dark, sinister, eerie, unsettling, creepy, disturbing.
- Use medical and administrative adjectives: consistent, elevated, anomalous, discontinued, archived, active, recalled, pending, unresolved.
- Staff notes sound tired. System messages sound automated.

### Security
- No real medical data. No real PII.
- Puzzle answers hashed with PUZZLE_ANSWER_SALT before comparison. Never plaintext.
- Puzzle endpoints rate-limited.
- Unreleased content never committed to a public branch.

### Editing
- All agents have `edit` permission and may write to files within their defined scope.
- Agents working on `docs/**` may edit any planning or lore document freely.
- Agents working on `sites/**` follow in-world site rules (no modern frameworks, system fonts, floats/tables for layout, era-appropriate design).
- Agents working on `lambda/**` or `infra/**` follow Lambda/API rules and CDK rules from copilot-instructions.md.
