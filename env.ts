import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string(),
  AIRTABLE_TOKEN: z.string(),
  PORT: z.string().default("3000"),
});
export default envSchema.parse(process.env);
