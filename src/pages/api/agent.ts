import type { APIRoute } from 'astro';
import { db, Sessions, eq } from 'astro:db';
import { getUsernameFromCookie } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const text = await request.text();
		console.log("Request body:", text);

		if (!text) {
			return new Response(JSON.stringify({ error: "Empty request body" }), { status: 400 });
		}

		const body = JSON.parse(text);
		const { message } = body;

		if (!message) {
			return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
		}

		const userId = await getUsernameFromCookie(cookies);
		if (!userId) {
			return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
		}

		// Check for existing session
		const [userSession] = await db.select().from(Sessions).where(eq(Sessions.userId, userId));

		let sessionId = userSession?.id;
		let previousEvents: any[] = [];

		if (userSession) {
			try {
				previousEvents = JSON.parse(userSession.events);
			} catch (e) {
				console.error("Failed to parse session events", e);
			}
		} else {
			sessionId = crypto.randomUUID();
		}

		// MOCK AGENT EXECUTION
		const newEvent = {
			role: "model",
			parts: [{ text: "This is a placeholder response from the Astro Agent API." }]
		};
		const events = [...previousEvents, { role: "user", parts: [{ text: message }] }, newEvent];

		// Persist to DB
		await db.insert(Sessions).values({
			id: sessionId,
			userId: userId,
			events: JSON.stringify(events),
			// created_at is default
		}).onConflictDoUpdate({
			target: Sessions.id,
			set: {
				events: JSON.stringify(events)
			}
		});

		return new Response(JSON.stringify({ events, userId, sessionId }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});

	} catch (error) {
		console.error("Agent execution error:", error);
		return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
	}
}
