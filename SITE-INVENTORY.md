# Site Inventory

## 1. Main frontend

- Folder: `frontend/`
- Status: Review first
- Notes: Contains site icons, logo files, `_headers`, `_redirects`, `.well-known`, and `index.html`.
- Caution: Treat deployment configuration and verification files as protected until their purpose is confirmed.
- Site identity found: EvoMirror
- Browser title: `EvoMirror - A Living Reflection of You`
- Meta description: `A 3D mirror that listens to your voice and reflects it back as a living symbol that evolves with you, one seal at a time.`
- Social sharing: Open Graph and Twitter card metadata are present.
- Share image: `https://evomirror.com/og-image.jpg` (1200 × 630)
- External libraries: Three.js r128 and OrbitControls, loaded from cdnjs and jsDelivr.

## 2. Aujoule

- Folder: `aujoule-frontend/`
- Status: Review after the main frontend
- Visible files: `index.html`, `manifest.webmanifest`
- Goal: Identify current content, links, branding, and intended deployment.
- Site identity found: Aujoule
- Browser title: `AuJoule - Your Real Accumulated Energy`
- Meta description: `AuJoule measures the real, cumulative energy behind every seal you've generated across the system - not currency, an honest reflection of what you've actually made.`
- Social sharing: Open Graph and Twitter card metadata are present.
- Social URL: `https://aujoule.com`
- Audit note: No `og:image` was seen in the initial metadata review.
- Audit note: The viewport uses `maximum-scale=1.0`; review later for mobile zoom accessibility.
- Wallet metadata: `crypto-address` and `sovereign-wallet` are present and use the same address.

## 3. Evolving Roots

- Folder: `evolvingroots-frontend/`
- Status: Review after Aujoule
- Visible files: `index.html`, `manifest.webmanifest`
- Goal: Identify current content, links, branding, and intended deployment.
- Site identity found: Evolving Roots
- Browser title: `Evolving Roots - A Constellation Built From Your History`
- Meta description: `A space built entirely from your own sealed history - real stars for every real moment, a universe only your evolution could have made.`
- Social sharing: Open Graph and Twitter card metadata are present.
- Social URL: `https://evolvingroots.org`
- Audit note: No `og:image` was seen in the initial metadata review.
- Audit note: The viewport uses `maximum-scale=1.0`; review later for mobile zoom accessibility.
- Wallet metadata: `crypto-address` and `sovereign-wallet` are present and use the same address.

## 4. Lisa J Evolving

- Folder: `lisajevolving-frontend/`
- Status: Review after Evolving Roots
- Visible files: `index.html`, `lisajevolves.jpg`, `thedraft.mp3`
- Goal: Identify current content, media behavior, links, and intended deployment.
- Site identity found: LisaJEvolving / `soulsista191`
- Browser title: `soulsista191 - LisaJEvolving`
- Meta description: `soulsista191's personal space - a nostalgic profile that's alive, evolving, and reacting to what's actually playing.`
- Social sharing: Open Graph and Twitter card metadata are present.
- Social URL: `https://lisajevolving.com`
- Audit note: No `og:image` was seen in the initial metadata review.
- External library: Three.js r128 is loaded from cdnjs.
- Security note: The external Three.js script did not show Subresource Integrity attributes; review and test later before changing it.
- Media asset: `thedraft.mp3` is present in the project folder.

## Review checklist

- Confirm the page title and description.
- Identify external links, forms, email addresses, and payment or wallet links.
- Confirm images, icons, and audio assets load correctly.
- Check navigation and mobile layout.
- Record any deployment-related files without editing them.
- Make one small, tested change per commit.