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
	const { keys } = await kv.list({ prefix: "sender_count:", limit });

	const topSenders = await Promise.all(
		keys.map(async ({ name }) => {
			const count = await kv.get(name);
			return { name: name.replace("sender_count:", ""), count: parseInt(count || "0", 10) };
		}),
	);

	return topSenders.sort((a, b) => b.count - a.count);
}
