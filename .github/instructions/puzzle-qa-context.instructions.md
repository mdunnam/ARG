---
applyTo: "sites/somnatek/archive/**,sites/somnatek/portal/**,sites/somnatek/docs/**,lambda/**"
---

# Puzzle QA Context — Auto-loaded

When editing puzzle-bearing files you are touching content that will be experienced by real players with no designer assistance. Apply QA discipline before every change.

## QA Severity Reference

| Level | Meaning | Action |
|---|---|---|
| Green | Strong, minor cleanup | Ship |
| Yellow | Friction exists | Fix before promotion |
| Orange | Likely confusion | Fix before ship |
| Red | Broken at launch | Do not ship |
| Black | Fundamentally broken | Redesign |

## Live Puzzle Status — Known Issues

| Issue | Location | Severity |
|---|---|---|
| PDF form numbers → PTX IDs: no explicit prompt connecting trailing digits to ID format | `docs/` PDFs → `portal.html` | Yellow |
| SUPP-010 and SUPP-005 only reachable via SUPP-INDEX HTML source | `archive/7A-SUPP-INDEX/` | Orange — requires view-source habit |
| Fax morse `413` has no downstream connection | `(404) 671-9774` → ??? | Yellow — orphaned signal |
| Admin Tier 3 client-side SHA-256: no rate limiting | `admin/` | Yellow — brute-forceable in theory |

## QA Checklist for Every New Puzzle Element

Before adding any new clue or puzzle gate:

- [ ] Is the entry point visible without designer knowledge?
- [ ] Can it be solved using only planted information?
- [ ] Is every required piece actually reachable by a player who hasn't been told it exists?
- [ ] Is guessing slower than solving?
- [ ] Does inspect element / view-source make the answer trivially obvious?
- [ ] Is there a hint path that doesn't require contacting the game master?
- [ ] Does the solve feedback clearly indicate success or failure?
- [ ] Is the payoff proportional to the effort?
- [ ] Does it work on mobile?
- [ ] Does solving this advance the overall experience meaningfully?

## Common ARG Failure Modes to Catch

- **Designer curse** — you know the answer; test as if you don't
- **Single leap collapse** — one required insight too obscure, blocks all progress
- **Orphaned signal** — clue element with no downstream connection
- **Busywork inflation** — tedious steps mistaken for depth
- **Guessable finish** — answer obvious before solve is complete
- **Anti-climax** — hard solve, weak reward

## Example Prompts

- "QA the cross-form PDF cipher — is the connection between form trailing numbers and PTX IDs fair without a hint, or does it need a secondary signal?"
- "QA the Admin Tier 3 SHA-256 gate — can it be brute-forced, and is the credential discovery path through SUPP-INDEX fair for a player who hasn't read the correspondence?"
- "QA the fax morse clue as a standalone artifact — what is the quit risk window, and what downstream step is needed before it can be considered a complete puzzle?"
- "I'm adding a new HTML comment to `closure-notice.html` as a credential breadcrumb — QA this as a discovery mechanism before I ship it"
- "Run the full Phase 1 progression map through all six player personas and return a severity rating for each node"
