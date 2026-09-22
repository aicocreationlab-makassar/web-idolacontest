import { z } from "zod";
import { validateCompetitionCategory } from "./business-rules";
const text = z
  .string()
  .trim()
  .min(1, "Wajib diisi")
  .max(120, "Maksimum 120 karakter");
export const registrationSchema = z
  .object({
    full_name: text,
    public_name: text,
    age: z.coerce.number().int().min(1).max(18),
    school_name: text,
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
    postal_code: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
    competition_type: z.enum(["photogenic", "coloring"]),
    category: z.enum(["preschool", "paud", "tk", "sd_1_2", "sd_3_4", "sd_5_6"]),
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
  .refine((d) => validateCompetitionCategory(d.competition_type, d.category), {
    path: ["category"],
    message: "Preschool tidak dapat mengikuti mewarnai.",
  });
export const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^IDC-(?:[A-Z0-9]{1,12}-[A-F0-9]{24}|[A-Z0-9]{2,6}-[A-HJ-NP-Z2-9]{8})$/,
    "Kode registrasi tidak valid.",
  );
