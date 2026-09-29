# Lisa J Evolving deployment

The site is a Cloudflare Pages project with a D1 database. Cloudflare Access protects the writing desk and every endpoint that can read or change private drafts. The public `/api/entries` endpoint only returns published entries.

## 1. Create the D1 database

From the repository root, create the database with Wrangler:

```powershell
npx wrangler d1 create lisajevolving-journal
```

Apply the schema from this project directory:

```powershell
cd lisajevolving-frontend
npx wrangler d1 execute lisajevolving-journal --remote --file=./migrations/0001_create_journal_entries.sql
```

Alternatively, create a D1 database in the Cloudflare dashboard and run the SQL in `migrations/0001_create_journal_entries.sql` in its SQL console.

## 2. Configure Pages

Connect the repository to Cloudflare Pages. Set the project root to `lisajevolving-frontend`, leave the build command empty, and set the build output directory to `.`. Add a D1 binding named `DB` that points to `lisajevolving-journal` in both production and preview environments. Deploy once so the Pages Functions are available.

Add these Pages environment variables in production (and preview only if preview deployments should have a working private editor):

| Variable | Value |
| --- | --- |
| `ACCESS_TEAM_DOMAIN` | Your Cloudflare Access team host, such as `example.cloudflareaccess.com`, without `https://` |
| `ACCESS_AUD` | The Audience (AUD) tag for the Access application protecting the admin paths |
| `OWNER_EMAIL` | The exact email address allowed to edit this journal |

Redeploy after changing bindings or variables.

## 3. Protect the owner paths

In Cloudflare Zero Trust, create self-hosted Access applications for the Pages hostname and protect both path patterns:

- `/admin*`
- `/api/admin/*`

For each application, create an Allow policy that includes only the owner email configured as `OWNER_EMAIL`. Do not add a public or everyone policy. The Pages Functions independently verify the Access JWT signature, issuer, audience, expiry, and owner email before returning drafts or accepting changes.

The public journal reads from `/api/entries`; leave that path outside Access so visitors can see published posts. Confirm both Access applications use the same team domain and the `ACCESS_AUD` value matches the Audience tag used by the protected API application.

## 4. Publish a note

Visit `/admin/` on the deployed domain and sign in through Cloudflare Access. Use **Save draft** to keep writing private or **Publish entry** to make the note appear in the public archive. Editing a published entry and saving it as a draft removes it from the public archive. The sign-out link returns through Cloudflare Access logout.

## Local preview

Opening `index.html` directly from disk shows the design but cannot load posts because the `/api/entries` endpoint is a Pages Function. A full local preview requires Wrangler, the D1 binding, and the Access environment values; never replace Access verification with a browser-side password or local-storage flag.