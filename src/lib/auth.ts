import { db, Users, eq } from 'astro:db';
import type { AstroCookies } from 'astro';

export const COOKIE_NAME = "username";
export const COOKIE_MAX_AGE = 60 * 60; // 1 hour in seconds

/**
 * Gets the username from the cookie, returns null if not found or expired
 */
export async function getUsernameFromCookie(cookies: AstroCookies): Promise<string | null> {
	const cookie = cookies.get(COOKIE_NAME);
	const username = cookie?.value;

	if (!username) return null;

	try {
		const [user] = await db.select().from(Users).where(eq(Users.id, username));
		return user ? user.id : null;
	} catch (error) {
		console.error("Error verifying user:", error);
		return null;
	}
}

/**
 * Sets the username cookie (helper if needed, though usually done in actions/API)
 */
export function setUsernameCookie(cookies: AstroCookies, username: string) {
	cookies.set(COOKIE_NAME, username, {
		path: '/',
		httpOnly: true,
		maxAge: COOKIE_MAX_AGE,
		secure: import.meta.env.PROD
	});
}
