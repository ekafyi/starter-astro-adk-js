import 'dotenv/config';
import type { APIRoute } from 'astro';
import { db, Sessions, eq } from 'astro:db';
import { InMemoryRunner } from "@google/adk";
import { createUserContent } from "@google/genai";
import { rootAgent } from "@/agents/agent";
import { getUsernameFromCookie } from '@/lib/auth';

const APP_NAME = "sample_astro_app";

// Define runner outside the handler to persist state across requests.
const runner = new InMemoryRunner({ agent: rootAgent, appName: APP_NAME });

function cleanEvents(events: any[]) {
	return events
		.filter((event) => {
			// Filter out empty marker events (where content.parts is empty)
			if (
				event.content &&
				Array.isArray(event.content.parts) &&
				event.content.parts.length === 0
			) {
				return false;
			}
			return true;
		})
		.map((event) => {
			// biome-ignore lint/correctness/noUnusedVariables: unused to remove
			const { actions, usageMetadata, ...rest } = event;
			return rest;
		});
}

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const text = await request.text();
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

		let session = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId,
			sessionId,
		});

		if (!session) {
			session = await runner.sessionService.createSession({
				appName: APP_NAME,
				userId,
				sessionId,
			});
			if (previousEvents && previousEvents.length > 0) {
				const service = runner.sessionService as any;
				if (service.sessions?.[APP_NAME]?.[userId]?.[sessionId]) {
					service.sessions[APP_NAME][userId][sessionId].events = previousEvents;
				}
			}
		}

		// runAsync returns an AsyncGenerator<Event>
		const iterator = runner.runAsync({
			userId,
			sessionId,
			newMessage: createUserContent(message) as Parameters<
				typeof runner.runAsync
			>[0]["newMessage"],
		});

		const events = [];
		for await (const event of iterator) {
			events.push(event);
		}

		const updatedSession = await runner.sessionService.getSession({
			appName: APP_NAME,
			userId,
			sessionId,
		});

		if (updatedSession) {
			const cleanedEvents = cleanEvents(updatedSession.events);
			await db.insert(Sessions).values({
				id: sessionId!,
				userId: userId,
				events: JSON.stringify(cleanedEvents),
				// created_at is default
			}).onConflictDoUpdate({
				target: Sessions.id,
				set: {
					events: JSON.stringify(cleanedEvents)
				}
			});
		}

		return new Response(JSON.stringify({ events, userId, sessionId }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});

	} catch (error) {
		console.error("Agent execution error:", error);
		return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
	}
}
