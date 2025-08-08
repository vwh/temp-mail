import { KV_LIMITS } from "@/config/constants";
import { getDomain } from "@/utils/mail";

/**
 * Update sender statistics
 */
export async function updateSenderStats(kv: KVNamespace, senderAddress: string) {
	const senderKey = `sender_count:${getDomain(senderAddress)}`;

	try {
		const currentCountStr = await kv.get(senderKey);
		const newCount = (currentCountStr ? parseInt(currentCountStr, 10) : 0) + 1;

		await kv.put(senderKey, newCount.toString());

		return { success: true, count: newCount, error: undefined };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			count: 0,
			error: new Error(`Failed to update KV for ${senderKey}: ${errorMessage}`),
		};
	}
}

/**
 * Get top senders from KV
 */
export async function getTopSenders(kv: KVNamespace, limit = 10) {
	try {
		const allKeys = [];
		let cursor: string | undefined;
		const maxKeys = KV_LIMITS.MAX_SENDER_KEYS; // Prevent excessive memory usage

		// Collect all sender keys with pagination
		while (allKeys.length < maxKeys) {
			const page: KVNamespaceListResult<unknown, string> = await kv.list({
				prefix: "sender_count:",
				cursor,
				limit: Math.min(KV_LIMITS.LIST_BATCH_SIZE, maxKeys - allKeys.length), // Batch size optimization
			});

			allKeys.push(...page.keys);

			if (page.list_complete) {
				break;
			}

			cursor = page.cursor;
		}

		const batchSize = KV_LIMITS.BATCH_SIZE; // Cloudflare KV concurrent request limit consideration
		const allSenders = [];

		for (let i = 0; i < allKeys.length; i += batchSize) {
			const batch = allKeys.slice(i, i + batchSize);
			const batchResults = await Promise.all(
				batch.map(async ({ name }) => {
					try {
						const count = await kv.get(name);
						return {
							name: name.replace("sender_count:", ""),
							count: parseInt(count || "0", 10),
						};
					} catch (_error) {
						return null;
					}
				}),
			);

			// Filter out failed entries
			allSenders.push(...batchResults.filter((sender) => sender !== null));
		}

		return allSenders.sort((a, b) => b.count - a.count).slice(0, limit);
	} catch (error) {
		console.error("Failed to get top senders:", error);
		return [];
	}
}
