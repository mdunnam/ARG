---
applyTo: "sites/somnatek/archive/**,sites/somnatek/portal/**,sites/somnatek/docs/**,scripts/generate-pdfs.js,assets/**,lambda/**"
---

# Crypto Architect Context — Auto-loaded

When editing files in these paths you are working on a layer that may carry or affect cryptographic puzzle elements. Never introduce content that collides with an existing active cipher system.

## Active Cipher Inventory — Do Not Duplicate

| Layer | Location | Mechanism | Output |
|---|---|---|---|
| Cross-form cipher | Five PDFs form numbers | Trailing digits 07-11-14-18-31 | PTX-007/011/014/018/031 |
| Metadata Subject chain | Five PDFs in order | Subject field per PDF | "When you find this room 413 is waiting" |
| Acrostic: LORTIZ | `patient-intake-form.pdf` | First letter of each instruction sentence | Lena Ortiz |
| Acrostic: NIGHTFLR | `sleep-study-consent.pdf` | First letter of Participant Rights items | Night floor |
| Numeric: 4.13 per row | `cpap-compliance-log.pdf` | Hours field in all sample rows | Room 413 |
| Acrostic: NIGHTFLOOR | `sleep-hygiene-guide.pdf` | First word of each of 10 tips | Night floor |
| Acrostic: RECALL | `insurance-auth-request.pdf` | First letter of carrier notes sentences | Recall |
| Ghost text | All five PDFs | White-on-white selectable text | Direct protocol / PTX references |
| Morse | Fax line (404) 671-9774 | Audio — fax handshake failure | `413` |
| SHA-256 gate | `portal/protocol-7a/` | Client-side hash | Answer: `15PTX018413` |
| ICD code | `insurance-auth-request.pdf` | Fabricated code G47.413 | Room 413 |
| Facility code | `insurance-auth-request.pdf` | HRWCO-FAC-0031 | Harrow County + PTX-031 |
| ModDate anomalies | All five PDFs | Dates tied to lore events | Ellison leave, EC-003, Ortiz cert, closure |

## Available Lore Keys for New Ciphers

- Key number: **413**
- Key phrase: **PLEASE WAIT TO BE RECALLED** (26 characters — usable as Vigenère key)
- Participant IDs: PTX-007, PTX-011, PTX-014, PTX-018, PTX-031
- Terminal anomaly: **00000000** (all-zero, unregistered)
- Employee anomaly: **EMP-247** (not in standard personnel)
- Closure date: **2014-09-18** (usable as numeric key)
- EC-004 co-signature date: **2013-03-14**

## Cipher Design Rules

- Every puzzle needs a handle — something to grab before the encoding starts
- Difficulty from design, not randomness
- Theme must match medical/institutional aesthetic
- Never require obscure trivia with no clue path
- Avoid brute-force-faster-than-thinking designs
- New ciphers must feel different from all existing layers

## Example Prompts

- "Design a Vigenère cipher using PLEASE WAIT TO BE RECALLED as the key — where does the ciphertext live and where is the key breadcrumb hidden"
- "Add a new cipher layer to `sleep-study-consent.pdf` that doesn't collide with the existing NIGHTFLR acrostic"
- "PTX-031 is the only Active status participant — design a cipher where the five PTX IDs together form the key material"
- "Write a book cipher using Protocol 7A EC-004 as the source — what does it decode to and where do we plant the index"
- "Embed a Morse code breadcrumb into the CPAP log sample data that doesn't conflict with the 4.13 row cipher already there"
