import { z } from "zod";

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  createdAt: z.string().datetime(),
});

export type Tenant = z.infer<typeof TenantSchema>;
