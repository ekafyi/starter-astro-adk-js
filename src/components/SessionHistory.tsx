"use client";

import { useState } from "react";
import { actions } from "astro:actions";

interface AgentEvent {
	content: {
		role?: string;
		parts: Array<{
			text?: string;
			functionResponse?: { name: string };
		}>;
	};
}

interface SessionHistoryProps {
	sessionId?: string | null;
}

export default function SessionHistory({ sessionId }: SessionHistoryProps) {
	const [history, setHistory] = useState<AgentEvent[] | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchHistory = async () => {
		if (!sessionId || history) return;

		setLoading(true);
		try {
			const { data, error } = await actions.getSessionHistory({ sessionId });
			if (error) {
				console.error(error);
			} else {
				setHistory(data.events || []);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const formatHistory = () => {
		if (!history) return [];

		const messages: string[] = [];
		for (const event of history) {
			if (event.content.role === "user") {
				const text = event.content.parts.find(p => p.text)?.text;
				if (text) messages.push(`user: ${text}`);
			} else if (event.content.role === "model") {
				const text = event.content.parts.find(p => p.text)?.text;
				if (text) {
					try {
						const parsed = JSON.parse(text);
						messages.push(`agent: ${parsed.message || text}`);
					} catch {
						messages.push(`agent: ${text}`);
					}
				}
			}
		}
		return messages;
	};

	if (!sessionId) return null;

	return (
		<details className="bg-muted/50 shadow-sm">
			<summary className="px-4 py-3 font-semibold cursor-pointer">Session History</summary>
			<div className="px-4 pb-4 space-y-2">
				{!history && !loading && (
					<button
						onClick={fetchHistory}
						className="bg-primary text-primary-foreground py-2 px-4 rounded text-sm"
					>
						Load History
					</button>
				)}
				{loading && <p className="text-sm opacity-80">Loading...</p>}
				{history && (
					<div className="space-y-1 text-sm font-mono">
						{formatHistory().map((msg, i) => (
							<p key={i}>{msg}</p>
						))}
					</div>
				)}
			</div>
		</details>
	);
}
