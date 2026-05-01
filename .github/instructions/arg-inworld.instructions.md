---
applyTo: "sites/**,lambda/**"
---

# Somnatek ARG — In-World Code Rules

These rules apply whenever you are editing files under `sites/` or `lambda/`.

## Lore — Keep These Consistent

- Clinic: **Somnatek Sleep Health Center**
- County: **Harrow County**
- University: **Wexler University**
- Corporate successor: **Dorsal Health Holdings LLC**
- Medical director: **Dr. Mara Ellison**
- University researcher: **Dr. Edwin Vale**
- Sleep technician: **Lena Ortiz**
- Study period: **2008–2013**. Clinic closed publicly **2014**.
- Protocol: **Protocol 7A**
- Key room: **413**. The blue door is always on the left. The hallway always bends left.
- Key phrase: **PLEASE WAIT TO BE RECALLED**
- Participant IDs: `PTX-XXX` (study), `VIS-XXXXX` (visitors, five-digit zero-padded)
- Shared environment: **the night floor**, **the Dorsal site**, or **the indexed space** — never "a dream" in internal documents after 2011

## Tone — `sites/` HTML and Copy

- Write clinic copy as if no one expects anyone to read it carefully.
- Never use horror adjectives: dark, sinister, eerie, unsettling, creepy, disturbing.
- Use medical/administrative adjectives: consistent, elevated, anomalous, discontinued, archived, active, recalled, pending, unresolved.
- Staff notes sound tired, not frightened. System messages sound automated, not threatening.
- Clues go inside genuinely boring text, not beside it.

## Site Aesthetic — `sites/` Only

- No CSS frameworks (no Tailwind, no Bootstrap).
- No Google Fonts. System fonts only: Georgia, Times New Roman, Verdana, Arial, Tahoma, Courier New.
- No flexbox or CSS grid on pages that should look old. Use floats and tables.
- Navigation: left sidebars, horizontal tab bars, plain anchor links.
- Broken links return the plain era-appropriate `404.html`. Not a styled error page.
- Do not add `console.log` that breaks immersion. Console clues must read as system output.
- Hidden puzzle elements: HTML comments, hidden form fields with unusual names, metadata, data attributes, off-screen positioned elements. Never visually obvious.

## Lambda Rules — `lambda/` Only

- Puzzle answers are never stored in plaintext. Hash with `PUZZLE_ANSWER_SALT` before comparison.
- Do not return error details that could reveal puzzle answers or system internals to clients.
- API Gateway responses must include CORS headers for the site domains.
- DynamoDB table names come from environment variables, not hardcoded strings.
- Rate-limit all puzzle submission endpoints.
- Do not log visitor emails or IDs in CloudWatch in an exposable way.
