/**
 * Update sender statistics
 */
export async function updateSenderStats(kv: KVNamespace, senderAddress: string): Promise<number> {
	const senderKey = `sender_count:${senderAddress}`;

	try {
		const currentCountStr = await kv.get(senderKey);
		const newCount = (currentCountStr ? parseInt(currentCountStr, 10) : 0) + 1;

		kv.put(senderKey, newCount.toString()).catch((error) => {
			console.error(`KV put failed for ${senderKey}:`, error);
		});

		return newCount;
	} catch (error) {
		console.error(`Failed to get/update KV for ${senderKey}:`, error);
		throw error;
	}
}
