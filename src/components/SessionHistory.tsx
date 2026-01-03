"use client";

import { actions } from "astro:actions";
import { useState } from "react";

interface AgentEvent {
	content: {
		role?: string;
		parts: Array<{
			text?: string;
			functionResponse?: { name: string };
		}>;
	};
	timestamp?: number;
}

interface SessionHistoryProps {
	sessionId?: string | null;
}

export default function SessionHistory({ sessionId }: SessionHistoryProps) {
	const [history, setHistory] = useState<AgentEvent[] | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchHistory = async () => {
		if (!sessionId) return;

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

		const messages: Array<{ id: string; role: string; message: string; timestamp?: number }> = [];
		let messageIndex = 0;

		for (let i = 0; i < history.length; i++) {
			const event = history[i];
			if (event.content.role === "user") {
				const text = event.content.parts.find((p) => p.text)?.text;
				if (text) {
					messages.push({
						id: `msg-${messageIndex++}`,
						role: "user",
						message: text,
						timestamp: event.timestamp,
					});
				}
			} else if (event.content.role === "model") {
				const text = event.content.parts.find((p) => p.text)?.text;
				if (text) {
					try {
						const parsed = JSON.parse(text);
						messages.push({
							id: `msg-${messageIndex++}`,
							role: "agent",
							message: parsed.message || text,
							timestamp: event.timestamp,
						});
					} catch {
						messages.push({
							id: `msg-${messageIndex++}`,
							role: "agent",
							message: text,
							timestamp: event.timestamp,
						});
					}
				}
			}
		}
		return messages;
	};

	const formatTime = (timestamp?: number) => {
		if (!timestamp) return "";
		return new Date(timestamp).toLocaleTimeString();
	};

	if (!sessionId) return null;

	return (
		<details className="bg-muted/50 shadow-sm">
			<summary className="px-4 py-3 font-semibold cursor-pointer">
				Session History
			</summary>
			<div className="px-4 pb-4 space-y-4">
				{!loading && (
					<button
						type="button"
						onClick={fetchHistory}
						className="border text-foreground py-2 px-4 rounded text-sm hover:bg-foreground/10"
					>
						{history ? "Update History" : "Load History"}
					</button>
				)}
				{loading && <p className="opacity-80">Loading...</p>}
				{history && (
					<ol className="space-y-2 text-sm list-none">
						{formatHistory().map((msg) => (
							<li key={msg.id} data-id={msg.id} className="flex justify-between gap-4">
								<div>
									<strong>{msg.role}:</strong> {msg.message}
								</div>
								{msg.timestamp && (
									<time dateTime={new Date(msg.timestamp).toISOString()} className="opacity-60 shrink-0">
										{formatTime(msg.timestamp)}
									</time>
								)}
							</li>
						))}
					</ol>
				)}
			</div>
		</details>
	);
}
