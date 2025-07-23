import { z } from "zod";

// Email address parameter schema
export const emailAddressParamSchema = z.object({
	emailAddress: z.string().email(),
});

// Email ID parameter schema
export const emailIdParamSchema = z.object({
	emailId: z.string().cuid2(),
});

// Email query schema
export const emailQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).optional().default(10),
	offset: z.coerce.number().min(0).optional().default(0),
});
