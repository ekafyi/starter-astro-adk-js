import { defineAction, ActionError } from 'astro:actions';
import { z } from 'zod';
import { validateUsername, getUser, setUsernameCookie, deleteUsernameCookie } from '@/lib/auth';

export const server = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			username: z.string(),
		}),
		handler: async ({ username: usernameInput }, context) => {
			let username = "";

			try {
				username = validateUsername(usernameInput);
			} catch (error) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: 'username_required',
				});
			}

			// Check if user exists in database
			const user = await getUser(username);
			if (!user) {
				throw new ActionError({
					code: 'NOT_FOUND',
					message: 'user_not_found',
				});
			}

			setUsernameCookie(context.cookies, username);
			return { success: true };
		},
	}),

	logout: defineAction({
		accept: 'form',
		handler: async (_, context) => {
			deleteUsernameCookie(context.cookies);
			return { success: true };
		},
	}),
};
