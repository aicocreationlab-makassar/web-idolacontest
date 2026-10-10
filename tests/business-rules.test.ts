import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSubmissionDeadline,
  canAcceptRegistration,
  canAcceptSubmission,
  canPublishSubmission,
  generateRegistrationCode,
  validateCompetitionCategory,
  weightedScore,
} from "../src/lib/business-rules";
import {
  registrationSchema,
  registrationSchemaFor,
  codeSchema,
} from "../src/lib/validation";
import { resolveContent, ageRuleFor } from "../src/lib/contest-modes";
test("Preschool coloring is rejected, photogenic allowed", () => {
  assert.equal(validateCompetitionCategory("coloring", "preschool"), false);
  assert.equal(validateCompetitionCategory("photogenic", "preschool"), true);
  assert.equal(validateCompetitionCategory("coloring", "tk"), true);
});
test("Deadline chooses earlier of seven days and global close", () => {
  assert.equal(
    calculateSubmissionDeadline(
      "2026-09-21T00:00:00Z",
      "2026-10-06T15:59:59Z",
    ).toISOString(),
    "2026-09-28T00:00:00.000Z",
  );
  assert.equal(
    calculateSubmissionDeadline(
      "2026-10-05T00:00:00Z",
      "2026-10-06T15:59:59Z",
    ).toISOString(),
    "2026-10-06T15:59:59.000Z",
  );
});
test("Registration and submission gates enforce time and payment", () => {
  assert.equal(
    canAcceptRegistration("2026-09-21", "2026-10-06", new Date("2026-10-07")),
    false,
  );
  assert.equal(
    canAcceptSubmission(
      "2026-09-21",
      "2026-10-06",
      false,
      new Date("2026-09-22"),
    ),
    false,
  );
  assert.equal(
    canAcceptSubmission(
      "2026-09-21",
      "2026-10-06",
      true,
      new Date("2026-09-29"),
    ),
    false,
  );
});
test("Publication requires approval, paid status and explicit consent", () => {
  assert.equal(canPublishSubmission("pending_review", true, true), false);
  assert.equal(canPublishSubmission("approved", false, true), false);
  assert.equal(canPublishSubmission("approved", true, false), false);
  assert.equal(canPublishSubmission("approved", true, true), true);
});
test("Weighted scores honor all five criteria", () => {
  assert.equal(weightedScore([100, 80, 60, 40, 20]), 70);
  assert.equal(weightedScore([100, 100, 100, 100, 100]), 100);
  assert.throws(() => weightedScore([101, 0, 0, 0, 0]));
  assert.throws(() => weightedScore([50]));
});
test("Registration codes are short, name-based, random and validate", () => {
  const codes = new Set(
    Array.from({ length: 1000 }, () =>
      generateRegistrationCode("Ahmad Ghifari"),
    ),
  );
  assert.equal(codes.size, 1000);
  codes.forEach((c) => {
    assert.match(c, /^IDC-AHMAD-[A-HJ-NP-Z2-9]{8}$/);
    assert.equal(codeSchema.parse(c), c);
  });
  assert.equal(
    codeSchema.safeParse("IDC-S1-1234567890ABCDEF12345678").success,
    true,
  );
  assert.equal(codeSchema.safeParse("IDC-S1-000001").success, false);
});
test("National mode validates Baby/Kids ages and makes the school optional", () => {
  const content = resolveContent({
    contest_mode: "national",
    registration_fee: 35000,
    claim_fee: 0,
    content: {},
    quota: 200,
  });
  assert.equal(content.registration_fee, 35000);
  assert.equal(content.categories.map((c) => c.key).join(","), "baby,kids");
  const schema = registrationSchemaFor(content);
  const base = {
    full_name: "Anak Uji",
    public_name: "Bintang",
    age: 7,
    age_unit: "years",
    school_name: "",
    parent_name: "Orang Tua",
    whatsapp: "081234567890",
    instagram_username: "ortu",
    address_line: "Jalan Uji Nomor 1",
    province_code: "73",
    province_name: "Sulawesi Selatan",
    regency_code: "7371",
    regency_name: "Makassar",
    district_code: "7371010",
    district_name: "Kecamatan",
    village_code: "7371010001",
    village_name: "Kelurahan",
    postal_code: "",
    competition_type: "coloring",
    category: "kids",
    dream_job: "Dokter",
    consent_parent_guardian: true,
    consent_publication: true,
    consent_terms: true,
    consent_fee: true,
  };
  assert.equal(schema.safeParse(base).success, true);
  assert.equal(
    schema.safeParse({ ...base, category: "baby", age: 18, age_unit: "months" }).success,
    true,
  );
  assert.equal(schema.safeParse({ ...base, category: "baby", age: 6 }).success, false);
  assert.equal(
    schema.safeParse({ ...base, category: "kids", age: 30, age_unit: "months" }).success,
    false,
  );
  assert.equal(schema.safeParse({ ...base, category: "tk" }).success, false);
  assert.equal(schema.safeParse({ ...base, age: 14 }).success, false);
  assert.equal(ageRuleFor(content, "baby", "months").allowed, true);
  assert.equal(ageRuleFor(content, "kids", "months").allowed, false);
  assert.equal(validateCompetitionCategory("coloring", "baby"), true);
  // Classic rules stay untouched.
  assert.equal(registrationSchema.safeParse({ ...base, school_name: "" }).success, false);
  assert.equal(
    registrationSchema.safeParse({ ...base, school_name: "TK Uji", category: "tk" }).success,
    true,
  );
});
test("Registration refuses omitted consent and malformed address", () => {
  assert.equal(
    registrationSchema.safeParse({
      full_name: "Anak",
      competition_type: "coloring",
      category: "preschool",
      consent_fee: false,
      postal_code: "123",
    }).success,
    false,
  );
});
