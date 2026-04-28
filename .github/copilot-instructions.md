# Somnatek ARG — GitHub Copilot Instructions

## Project Overview

This is an ongoing interactive horror ARG (alternate reality game) website project called the Somnatek ARG.

The fictional premise is a defunct sleep clinic whose patient portal, study archives, forum, and corporate records have been left online. Players investigate the site and gradually discover that the clinic mapped a shared dream environment called the night floor, and that the follow-up study never actually ended.

The project is a live public ARG intended to run indefinitely. New content is dropped daily, weekly, and monthly. Players are eventually treated as participants in the experiment.

## Stack

- In-world sites: plain HTML, CSS, and vanilla JavaScript. No frameworks. Sites must look authentically old and institutional.
- Puzzle validation: Node.js AWS Lambda functions behind API Gateway.
- Infrastructure: AWS CDK (TypeScript).
- Storage: AWS S3 for static hosting and assets. AWS DynamoDB for visitor state.
- Email: AWS SES for opt-in in-world transmissions.
- CI/CD: GitHub Actions for deploy pipelines.

## Project Structure

```
sites/somnatek/         Main clinic site
sites/restwell/         Patient support forum
sites/wexler/           University research archive
sites/harrow-county/    County business records
lambda/                 AWS Lambda functions (Node.js)
infra/                  AWS CDK stacks (TypeScript)
scripts/                Content drop tooling
assets/                 Source images, audio, PDFs before processing
docs/                   Planning and production bible
```

## In-World Site Rules

These rules apply to all HTML, CSS, and JS files inside `sites/`:

- Sites must look like real abandoned institutional websites from the late 2000s or early 2010s.
- Do not use modern CSS frameworks like Tailwind or Bootstrap.
- Do not use modern web fonts from Google Fonts. Use system fonts: Georgia, Times New Roman, Verdana, Arial, Tahoma, Courier New.
- Do not use flexbox or CSS grid layouts on pages that should look old. Use floats and tables for layout where appropriate.
- Navigation must feel dated: left sidebars, horizontal tab bars, plain anchor links.
- Images should reference low-resolution or compressed versions. Placeholder alt text should be clinical and institutional, not descriptive.
- Hidden puzzle elements must be semantically invisible: HTML comments, hidden form fields with unusual names, metadata, data attributes, off-screen positioned elements. Do not make puzzle elements visually obvious.
- Do not add console.log statements that break immersion. If console clues are used, they must read as system output, not developer notes.
- Broken links should return a plain 404 page consistent with the site's era. Not a stylized error page.
- All copy must match the tone: clinical, restrained, bureaucratic, and emotionally flat. Do not write horror copy. Write institutional copy that becomes horror through context.

## Lambda / API Rules

- Lambda functions live in `lambda/`. Each function is its own folder with an `index.js` entry point.
- Puzzle answers must never be stored in plaintext. Hash answers with the `PUZZLE_ANSWER_SALT` environment variable before comparison.
- Do not return error details that could reveal puzzle answers or system internals to clients.
- Visitor IDs follow the format `VIS-XXXXX` (five-digit zero-padded number). Early canonical participants use `PTX-XXX`.
- API Gateway responses must include appropriate CORS headers for the site domains.
- DynamoDB operations should use the table names from environment variables, not hardcoded strings.

## CDK Infrastructure Rules

- CDK stacks live in `infra/`. Use TypeScript.
- Each in-world site should be a separate S3 bucket and CloudFront distribution.
- S3 buckets must have public access blocked. Content is served through CloudFront only.
- CloudFront distributions should have a custom error response for 403 that returns the site's 404 page.
- Lambda functions should have the minimum required IAM permissions.

## Content Drop Rules

- Unreleased content lives in `staged/` or on a private S3 prefix. It is never committed to a public repository branch.
- The content ledger in DynamoDB tracks release state: `drafted`, `scheduled`, `released`, `discovered`, `superseded`, `removed`.
- Release scripts live in `scripts/`. They copy staged artifacts to the public S3 path and update the ledger.

## Lore Consistency Rules

These facts must remain consistent across all generated code, copy, and documents:

- The clinic name is Somnatek Sleep Health Center.
- The county is Harrow County.
- The university is Wexler University.
- The corporate successor is Dorsal Health Holdings LLC.
- The medical director is Dr. Mara Ellison.
- The university researcher is Dr. Edwin Vale.
- The sleep technician is Lena Ortiz.
- Patient IDs follow the format PTX-XXX for study participants and VIS-XXXXX for later visitors.
- The key room number is 413.
- The key phrase is: PLEASE WAIT TO BE RECALLED.
- The study ran 2008 to 2013. The clinic closed publicly in 2014.
- The Protocol name is Protocol 7A.
- The internal name for the shared environment is the Dorsal site, the night floor, or the indexed space. Never call it a dream in internal documents after 2011.
- The blue door is always on the left. The hallway always bends left.

## Tone and Copy Rules

- Write clinic copy as if no one expects anyone to read it carefully.
- Clues should be hidden inside genuinely boring text, not beside it.
- Never use horror adjectives: dark, sinister, eerie, unsettling, creepy, disturbing.
- Use medical and administrative adjectives: consistent, elevated, anomalous, discontinued, archived, active, recalled, pending, unresolved.
- Staff notes should sound tired, not frightened.
- System messages should sound automated, not threatening.

## Security Notes

- No real medical data. No real patient information. No real PII.
- Do not log visitor emails or IDs in CloudWatch in a way that could be exposed.
- Puzzle endpoints must rate-limit submissions to prevent brute force.
- Never expose the content drop schedule or unreleased artifact paths publicly.
- Do not use real institution names, real clinic names, real county names, or real university names.
