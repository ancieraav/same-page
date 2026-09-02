import { z } from "zod";

export const ROOM_CODE_LENGTH = 7;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

const roleNameSchema = z.string().trim().min(1).max(60);

export const createRoomSchema = z
  .object({
    roomName: z.string().trim().min(2).max(80),
    topic: z.string().trim().min(2).max(160),
    notes: z.string().trim().max(4000).default(""),
    participantMode: z.enum(["flexible", "fixed"]),
    participantCount: z.string().trim().max(3).default(""),
    useMemes: z.enum(["no", "yes"]),
    useRoles: z.enum(["no", "yes"]),
    separateAccess: z.enum(["no", "yes"]),
    shareResponses: z.enum(["no", "yes"]),
    anonymousNames: z.enum(["no", "yes"]),
    roles: z.array(roleNameSchema).max(12).default([]),
  })
  .superRefine((value, context) => {
    if (value.participantMode === "fixed") {
      const count = Number(value.participantCount);
      if (!Number.isInteger(count) || count < 2 || count > 100) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["participantCount"],
          message: "Fixed rooms need between 2 and 100 participants.",
        });
      }
    }

    if (value.useRoles === "yes" && value.roles.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roles"],
        message: "Add at least one role when roles are enabled.",
      });
    }

    if (value.shareResponses === "no" && value.anonymousNames === "no") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anonymousNames"],
        message: "Anonymous names only apply when responses are shared.",
      });
    }
  });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const participantNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name to join the room.")
  .max(60, "Names must be 60 characters or fewer.");

export const roomCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => /^[A-Z0-9]{7}$/.test(value),
    "Enter the 7-character room code.",
  );

export const answerSchema = z
  .string()
  .trim()
  .min(1, "Write an answer before submitting.")
  .max(4000, "Answers must be 4,000 characters or fewer.");

export const newQuestionSchema = z
  .string()
  .trim()
  .min(5, "Questions must be at least 5 characters.")
  .max(400, "Questions must be 400 characters or fewer.");

export function normalizeRoomCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, ROOM_CODE_LENGTH).toUpperCase();
}

export function normalizeRoleNames(roles: string[]): string[] {
  return Array.from(
    new Set(roles.map((role) => role.trim()).filter(Boolean)),
  ).slice(0, 12);
}
