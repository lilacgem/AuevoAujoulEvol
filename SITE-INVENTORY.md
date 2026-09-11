# Site Inventory

## 1. Main frontend

- Folder: `frontend/`
- Status: Review first
- Notes: Contains site icons, logo files, `_headers`, `_redirects`, `.well-known`, and `index.html`.
- Caution: Treat deployment configuration and verification files as protected until their purpose is confirmed.

## 2. Aujoule

- Folder: `aujoule-frontend/`
- Status: Review after the main frontend
- Visible files: `index.html`, `manifest.webmanifest`
- Goal: Identify current content, links, branding, and intended deployment.

## 3. Evolving Roots

- Folder: `evolvingroots-frontend/`
- Status: Review after Aujoule
- Visible files: `index.html`, `manifest.webmanifest`
- Goal: Identify current content, links, branding, and intended deployment.

## 4. Lisa J Evolving

- Folder: `lisajevolving-frontend/`
- Status: Review after Evolving Roots
- Visible files: `index.html`, `lisajevolves.jpg`, `thedraft.mp3`
- Goal: Identify current content, media behavior, links, and intended deployment.

## Review checklist

- Confirm the page title and description.
- Identify external links, forms, email addresses, and payment or wallet links.
- Confirm images, icons, and audio assets load correctly.
- Check navigation and mobile layout.
- Record any deployment-related files without editing them.
- Make one small, tested change per commit.