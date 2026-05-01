---
applyTo: "sites/somnatek/*.html,sites/somnatek/*.txt,sites/somnatek/img/**,scripts/deploy-and-nginx.ps1"
---

# Rabbit Hole Architect Context — Auto-loaded

When editing files in these paths you are operating on the public-facing discovery surface of the Somnatek ARG. Every edit to a public page is a potential hook or a potential break in immersion. Apply discovery-funnel discipline.

## Discovery Vectors Already Planted — Do Not Duplicate

- `staff.html` — HTML comment on Lena Ortiz: cached RestWell forum profile `restwell.net/forum/memberlist.php?mode=viewprofile&u=lortiz`, last active 2019-11-04
- `robots.txt` — Disallows `/archive/7A-SUPP-INDEX/`, `/archive/7A-SUPP-010/`, `/archive/7A-SUPP-005/` (robot-watchers find these)
- `research.html` — `X-Archive-Ref: 7A-SUPP-001` HTTP response header; HTML comment with correspondence archive path
- `patient-resources.html` — HTML comment: internal doc ref, anomalous `last_modified_by: L. Ortiz`, pages 3–4 unresolved
- Fax number `(404) 671-9774` in all page footers — calling it returns morse code for `413`
- Five PDFs on patient-resources linked — cross-form cipher, metadata Subject chain, acrostics, ghost text

## Discovery Funnel Rules

When adding content to public pages:

1. **Normal surface first** — the page must look completely institutional at first glance
2. **One wrong thing** — one anomaly is stronger than ten
3. **Reward within 60 seconds** — something payable within the first visit
4. **Escalate slowly** — public pages are Stage 1 (Encounter) and Stage 2 (Verification), not Stage 5
5. **Let players feel smart** — the clue should feel found, not given

## Hook Placement Rules

- Hidden elements go in HTML comments, metadata, `data-` attributes, off-screen positioned elements, or unusual field names
- Never make puzzle elements visually obvious on public pages
- Anomalous copy goes inside genuinely boring text (buried in a paragraph, not beside it)
- Images: alt text and filenames can carry clues; keep visual content institutional

## Immersion Rules

- Pages must look like real abandoned institutional websites from 2008–2012
- No modern CSS frameworks, no Google Fonts, no flexbox/grid layouts
- System fonts only: Georgia, Times New Roman, Verdana, Arial, Tahoma, Courier New
- Navigation: left sidebars, horizontal tab bars, plain anchor links
- All copy: clinical, restrained, bureaucratic, emotionally flat
