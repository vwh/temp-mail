import type { Context } from "hono";
import { DOMAINS_SET } from "@/config/domains";
import { ERR } from "@/utils/http";
import { getDomain } from "@/utils/mail";

const validateDomain = async (c: Context, next: () => Promise<void>) => {
	const emailAddress = c.req.param("emailAddress");

	if (emailAddress) {
		const domain = getDomain(emailAddress);
		if (!DOMAINS_SET.has(domain)) {
			return c.json(
				ERR("Domain not supported", "DomainError", {
					supportedDomains: Array.from(DOMAINS_SET),
				}),
				404,
			);
		}
	}

	await next();
};

export default validateDomain;
