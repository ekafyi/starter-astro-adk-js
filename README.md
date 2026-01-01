# Astro + ADK TypeScript starter site

Clone of [this Next.js starter](https://github.com/ekafyi/starter-nextjs-adk-js/tree/main) in [Astro](https://astro.build).

## DB commands

- `npm run db:push` - Push schema changes to the database. **Remote only** (requires `ASTRO_DB_REMOTE_URL`). Local DB is managed automatically.
- `npm run db:verify` - Verify database configuration. **Remote only**.
- `npm run db:seed` - Execute the seed file. **Runs automatically** during `npm run dev`. Use manually to re-seed.
- `npm run db:shell` - Open interactive database shell for **local** database. Requires a query flag:
    ```bash
    npm run db:shell -- --query "SELECT * FROM Users"
    npm run db:shell -- --query "SELECT * FROM Sessions"
    ```
