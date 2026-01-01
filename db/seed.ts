import { db, Users } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	await db.insert(Users).values([
		{ id: 'testuser', created_at: new Date() },
	]).onConflictDoNothing();
}
