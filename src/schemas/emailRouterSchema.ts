import { z } from 'zod';

export const emailAddressParamSchema = z.object({
	emailAddress: z.string().email()
});

export const emailIdParamSchema = z.object({
	emailId: z.string().cuid2()
});

export const emailQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).optional().default(10),
	offset: z.coerce.number().min(0).optional().default(0)
});