import { z } from "zod";
import { validateCompetitionCategory } from "./business-rules";
import {
  ageRuleFor,
  categoryOptions,
  defaultContent,
  defaultFees,
  type ResolvedContent,
} from "./contest-modes";
const text = z
  .string()
  .trim()
  .min(1, "Wajib diisi")
  .max(120, "Maksimum 120 karakter");

/**
 * Registration rules depend on the active season's contest mode: the national
 * mode has its own categories with age ranges and makes the school optional.
 */
export function registrationSchemaFor(content: ResolvedContent) {
  const national = content.mode === "national";
  return z
    .object({
      full_name: text,
      public_name: text,
      age: z.coerce
        .number()
        .int("Usia harus berupa angka bulat")
        .min(1, "Usia minimal 1"),
      age_unit: z.enum(["years", "months"]).default("years"),
      school_name: national
        ? z.string().trim().max(120, "Maksimum 120 karakter").default("")
        : text,
      parent_name: text,
      whatsapp: z
        .string()
        .trim()
        .regex(/^(\+62|62|0)8\d{7,12}$/, "Nomor WhatsApp Indonesia tidak valid"),
      instagram_username: text,
      address_line: z.string().trim().min(5).max(300),
      province_code: text,
      province_name: text,
      regency_code: text,
      regency_name: text,
      district_code: text,
      district_name: text,
      village_code: text,
      village_name: text,
      postal_code: z
        .union([
          z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
          z.literal(""),
        ])
        .optional()
        .default(""),
      competition_type: z.enum(["photogenic", "coloring"]),
      category: national
        ? z.string().trim().min(1, "Pilih kategori")
        : z.enum(["preschool", "paud", "tk", "sd_1_2", "sd_3_4", "sd_5_6"]),
      dream_job: text,
      class_label: z.string().max(40).default(""),
      registration_source: z
        .enum(["website", "instagram_dm", "admin_manual"])
        .default("website"),
      consent_parent_guardian: z.literal(true),
      consent_publication: z.literal(true),
      consent_terms: z.literal(true),
      consent_fee: z.literal(true),
      website: z.string().max(0).optional(),
    })
    .superRefine((d, ctx) => {
      if (national) {
        const allowed = categoryOptions(content, d.competition_type).some(
          (category) => category.key === d.category,
        );
        if (!allowed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["category"],
            message: "Kategori tidak tersedia pada season ini.",
          });
          return;
        }
      }
      const rule = ageRuleFor(content, d.category, d.age_unit);
      if (!rule.allowed) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["age_unit"], message: rule.message });
        return;
      }
      if (d.age < rule.min || d.age > rule.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["age"],
          message: rule.message,
        });
      }
    })
    .refine(
      (d) =>
        national || validateCompetitionCategory(d.competition_type, d.category),
      {
        path: ["category"],
        message: "Preschool tidak dapat mengikuti mewarnai.",
      },
    );
}

/** Season 1 rules, kept for callers and tests that predate contest modes. */
export const registrationSchema = registrationSchemaFor({
  ...defaultContent.classic,
  mode: "classic",
  registration_fee: defaultFees.classic.registration,
  claim_fee: defaultFees.classic.claim,
  quota: null,
});

export const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^IDC-(?:[A-Z0-9]{1,12}-[A-F0-9]{24}|[A-Z0-9]{2,6}-[A-HJ-NP-Z2-9]{8})$/,
    "Kode registrasi tidak valid.",
  );
