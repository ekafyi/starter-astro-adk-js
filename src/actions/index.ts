import { ActionError, defineAction } from "astro:actions";
import { db, eq, Sessions } from "astro:db";
import { z } from "zod";
import {
	deleteUsernameCookie,
	getUser,
	getUsernameFromCookie,
	setUsernameCookie,
	validateUsername,
} from "@/lib/auth";

export const server = {
	login: defineAction({
		accept: "form",
		input: z.object({
			username: z.string(),
		}),
		handler: async ({ username: usernameInput }, context) => {
			let username = "";

			try {
				username = validateUsername(usernameInput);
			} catch (error) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "username_required",
				});
			}

			// Check if user exists in database
			const user = await getUser(username);
			if (!user) {
				throw new ActionError({
					code: "NOT_FOUND",
					message: "user_not_found",
				});
			}

			setUsernameCookie(context.cookies, username);
			return { success: true };
		},
	}),

	logout: defineAction({
		accept: "form",
		handler: async (_, context) => {
			deleteUsernameCookie(context.cookies);
			return { success: true };
		},
	}),

	getSessionHistory: defineAction({
		input: z.object({
			sessionId: z.string(),
		}),
		handler: async ({ sessionId }, context) => {
			const userId = await getUsernameFromCookie(context.cookies);
			if (!userId) {
				throw new ActionError({
					code: "UNAUTHORIZED",
					message: "Authentication required",
				});
			}

			const [session] = await db
				.select()
				.from(Sessions)
				.where(eq(Sessions.id, sessionId))
				.limit(1);

			if (!session) {
				return { events: [] };
			}

			if (session.userId !== userId) {
				throw new ActionError({
					code: "FORBIDDEN",
					message: "Access denied",
				});
			}

			const events = JSON.parse(session.events);
			return { events };
		},
	}),
};
