# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Database (Cloudflare D1)

This project stores its data (published listings, contact messages, demo
purchases, favorite/"vedette" heart counts, newsletter signups) in
`src/backend/store.ts`, which automatically picks the right backend:

- **Local dev / self-hosted Node** (`npm run dev`, or `node .output/server`
  after a Node-preset build): an in-memory store mirrored to
  `.data/autosale-store.json`. No setup needed — this is what you get out
  of the box.
- **Cloudflare Workers** (the default build target, `npm run build`): a real
  [Cloudflare D1](https://developers.cloudflare.com/d1/) SQL database, once
  you've created one and applied the migration below. Until you do, the
  Workers deployment still runs, but each request starts with empty data
  (Workers have no filesystem and don't share memory across requests).

### One-time setup

1. Create the database (requires a Cloudflare account and `wrangler` login —
   `npx wrangler login` first if needed):

   ```sh
   npx wrangler d1 create autosale-db
   ```

   This prints a `database_id`. Copy it.

2. Paste that id into `wrangler.json` at the project root, replacing
   `REPLACE_WITH_YOUR_D1_DATABASE_ID`:

   ```json
   {
     "d1_databases": [
       { "binding": "DB", "database_name": "autosale-db", "database_id": "<paste here>" }
     ]
   }
   ```

   Nitro automatically merges this file into its generated Cloudflare
   config at build time — no other configuration needed.

3. Apply the schema (`migrations/0001_init.sql`) to the live database:

   ```sh
   npx wrangler d1 execute autosale-db --remote --file=migrations/0001_init.sql
   ```

4. Build and deploy as usual:

   ```sh
   npm run build
   npx wrangler deploy .output/server/index.mjs
   ```

   (Or deploy however you normally publish this project — nitro merges
   `wrangler.json`'s binding into the generated
   `.output/server/wrangler.json` automatically.)

That's it — `src/backend/store.ts` detects the `DB` binding at runtime and
switches from the JSON-file store to real SQL queries with no code changes
needed anywhere else.

### Notes

- To test D1 locally instead of the JSON-file fallback, use
  `npx wrangler dev` (Wrangler's local D1 emulator) instead of `npm run dev`.
- `src/backend/d1-types.ts` declares a minimal local type for the D1 API
  instead of adding the `@cloudflare/workers-types` package. For full
  Workers type coverage elsewhere in the project, install that package as a
  devDependency and add it to `tsconfig.json`'s `"types"` array.

