import type { APIRoute } from 'astro';
import { db, Sessions, eq } from 'astro:db';
import { getUsernameFromCookie } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
	try {
		const userId = await getUsernameFromCookie(cookies);
		if (!userId) {
			return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
		}

		const url = new URL(request.url);
		const sessionId = url.searchParams.get('sessionId');

		if (!sessionId) {
			return new Response(JSON.stringify({ error: "Session ID required" }), { status: 400 });
		}

		const [session] = await db
			.select()
			.from(Sessions)
			.where(eq(Sessions.id, sessionId))
			.limit(1);

		if (!session || session.userId !== userId) {
			return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
		}

		const events = JSON.parse(session.events);

		return new Response(JSON.stringify({ events }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});

	} catch (error) {
		console.error("Session history fetch error:", error);
		return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
	}
}
