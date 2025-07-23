import { throwError } from "@/utils/helpers";
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
			throwError(`KV put failed for ${senderKey}: ${error}`);
		});

		return newCount;
	} catch (error) {
		throwError(`Failed to get/update KV for ${senderKey}: ${error}`);
	}
}
