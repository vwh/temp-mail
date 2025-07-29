import { getDomain } from "@/utils/mail";

/**
 * Update sender statistics
 */
export async function updateSenderStats(kv: KVNamespace, senderAddress: string) {
	const senderKey = `sender_count:${getDomain(senderAddress)}`;

	try {
		const currentCountStr = await kv.get(senderKey);
		const newCount = (currentCountStr ? parseInt(currentCountStr, 10) : 0) + 1;

		kv.put(senderKey, newCount.toString()).catch((error) => {
			throw new Error(`KV put failed for ${senderKey}: ${error}`);
		});

		return newCount;
	} catch (error) {
		throw new Error(`Failed to get/update KV for ${senderKey}: ${error}`);
	}
}

/**
 * Get top senders from KV
 */
export async function getTopSenders(kv: KVNamespace, limit = 10) {
	const allKeys = [];
	let cursor: string | undefined;

	while (true) {
		const page = await kv.list({
			prefix: "sender_count:",
			cursor,
		});

		allKeys.push(...page.keys);

		if (page.list_complete) {
			break;
		}

		cursor = page.cursor;
	}

	const allSenders = await Promise.all(
		allKeys.map(async ({ name }) => {
			const count = await kv.get(name);
			return {
				name: name.replace("sender_count:", ""),
				count: parseInt(count || "0", 10),
			};
		}),
	);

	return allSenders.sort((a, b) => b.count - a.count).slice(0, limit);
}
