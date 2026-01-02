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
## Verifying Data Persistence

To check if data is being saved to the `Sessions` table, run the following command in your terminal:

```bash
npm run db:shell -- --query "SELECT * FROM Sessions where userId = 'testuser'"
```

Alternatively, you can use `sqlite`.

```bash
sqlite3 .astro/content.db "SELECT * FROM Sessions WHERE userId = 'testuser';"
```

You should see a list of session records including `id`, `user_id`, `events`, and `created_at`.
