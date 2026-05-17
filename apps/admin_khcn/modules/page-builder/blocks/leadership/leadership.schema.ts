import { z } from "zod";

export const LeadershipDataSchema = z.object({
  leaderIds: z.array(z.number()).default([]),
  leaders: z.array(z.object({
    id: z.number(),
    fullName: z.string(),
    positionName: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
  })).default([]),
});

export type LeadershipData = z.infer<typeof LeadershipDataSchema>;
export type LeaderInfo = LeadershipData["leaders"][number];
