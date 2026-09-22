# Database Design — Idola Contest

Gunakan UUID primary keys dan `created_at`/`updated_at`.

## `seasons`

- id
- name
- slug unique
- registration_open_at
- registration_close_at
- submission_global_close_at
- judging_at
- announcement_at
- shipping_at
- quota nullable
- is_active
- created_at
- updated_at

## `participants`

- id
- full_name
- public_name
- age
- school_name
- parent_name
- whatsapp
- instagram_username
- address_line
- province_code/name
- regency_code/name
- district_code/name
- village_code/name
- postal_code
- created_at
- updated_at

## `registrations`

- id
- season_id
- participant_id
- registration_code unique
- competition_type
- category
- dream_job
- class_label nullable
- registration_source
- registration_status
- payment_status
- consent_parent_guardian
- consent_publication
- consent_terms
- consent_fee
- created_at
- updated_at

Enums:

- competition_type: `photogenic`, `coloring`
- source: `website`, `instagram_dm`, `admin_manual`
- status: `registered`, `verified`, `cancelled`, `disqualified`
- payment: `pending`, `paid`, `rejected`, `refunded`
- category: `preschool`, `paud`, `tk`, `sd_1_2`, `sd_3_4`, `sd_5_6`

## `participant_media`

- id
- registration_id
- storage_path
- mime_type
- size_bytes
- status
- created_at

## `submissions`

- id
- registration_id
- submission_type
- private_file_path
- public_file_path nullable
- status
- publication_status
- submitted_at
- reviewed_at nullable
- reviewed_by nullable
- review_note nullable
- created_at
- updated_at

Statuses: `not_submitted`, `pending_review`, `approved`, `revision_required`, `rejected`.

Publication: `hidden`, `approved`.

## `worksheets`

- id
- registration_id
- private_file_path
- version
- created_by
- created_at

## `judging_scores`

- id
- submission_id
- judge_id
- criteria jsonb
- total_score numeric
- notes nullable
- created_at
- updated_at

## `results`

- id
- registration_id
- final_score
- award_code
- is_published
- published_at nullable
- created_at
- updated_at

## `payments`

- id
- registration_id
- payment_type (`registration`, `award_claim`)
- amount
- status
- verified_by nullable
- verified_at nullable
- admin_note nullable
- created_at
- updated_at

## `claim_invoices`

- id
- registration_id
- invoice_number unique
- amount default 120000
- status (`draft`, `issued`, `paid`, `cancelled`)
- created_at
- paid_at nullable

## `shipments`

- id
- registration_id
- courier
- tracking_number nullable
- shipping_status (`waiting`, `prepared`, `shipped`, `delivered`)
- shipped_at nullable
- delivered_at nullable
- created_at
- updated_at

## `admin_profiles`

- user_id fk auth.users
- display_name
- role (`super_admin`, `admin`, `judge`)
- created_at

## `admin_audit_logs`

- id
- admin_user_id
- action
- entity_type
- entity_id
- before_data jsonb nullable
- after_data jsonb nullable
- created_at

## `event_settings`

- id
- season_id
- key
- value jsonb
- created_at
- updated_at

## Indexes

Index: registration_code, season_id, competition_type, category, payment_status, publication_status, province_code, created_at, submission.status, shipment.shipping_status.

## Constraints

- coloring tidak boleh preschool;
- consent wajib true untuk public registration;
- code unique;
- public_file_path hanya bila publication approved;
- award result satu per registration per season.

## Deadline

`effectiveSubmissionDeadline = min(registrationCreatedAt + 7 days, season.submissionGlobalCloseAt)`

Wajib divalidasi server-side.
