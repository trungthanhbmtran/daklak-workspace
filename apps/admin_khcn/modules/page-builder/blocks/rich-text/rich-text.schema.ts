import { z } from "zod";

export const RichTextDataSchema = z.object({
  // RichText primarily uses the core multilingual content string field (widget.content).
  // This object handles additional styling overrides if necessary.
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
});

export type RichTextData = z.infer<typeof RichTextDataSchema>;
