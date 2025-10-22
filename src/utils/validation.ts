import { DOMAINS_SET } from "@/config/domains";
import { ERR } from "@/utils/http";
import { getDomain } from "@/utils/mail";

/**
 * Validate email domain after Zod validation
 * Returns validation result with error if invalid
 */
export function validateEmailDomain(emailAddress: string) {
	const domain = getDomain(emailAddress);
	if (!DOMAINS_SET.has(domain)) {
		return {
			valid: false,
			error: ERR("Domain not supported", "DomainError", {
				supported_domains: Array.from(DOMAINS_SET),
			}),
		};
	}
	return { valid: true };
}
