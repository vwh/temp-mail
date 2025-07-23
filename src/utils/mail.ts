export function getDomain(senderAddress: string) {
    const parts = senderAddress.split("@");
	const domain = (parts.length > 1 ? parts.pop() : senderAddress)?.trim();

    return domain
}