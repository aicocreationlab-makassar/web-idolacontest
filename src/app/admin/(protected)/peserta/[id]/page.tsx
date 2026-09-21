import { notFound } from "next/navigation";
import { admin } from "@/lib/supabase/server";
import {
  AdminControl,
  PrivateMedia,
  WorksheetUpload,
} from "@/components/admin-controls";
import { PageHeading } from "@/components/shared";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { db } = await admin(["admin", "super_admin"]);
  const { id } = await params;
  const { data: r, error } = await db
    .from("registrations")
    .select(
      "*,participants(*),participant_media(*),worksheets(*),submissions(*)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !r) notFound();
  const p = r.participants;
  return (
    <>
      <PageHeading
        title={p.full_name}
        description={`${r.registration_code} · ${r.competition_type} · ${r.category}`}
      />
      <div className="grid2">
        <section className="card stack">
          <h3>Data privat peserta</h3>
          <p>
            Nama publik: {p.public_name} · Usia: {p.age}
            <br />
            Sekolah: {p.school_name} · Kelas: {r.class_label}
            <br />
            Cita-cita: {r.dream_job}
          </p>
          <p>
            Orang tua: {p.parent_name}
            <br />
            WhatsApp: {p.whatsapp}
            <br />
            Instagram: {p.instagram_username}
          </p>
          <p>
            {p.address_line}
            <br />
            {p.village_name}, {p.district_name}, {p.regency_name},{" "}
            {p.province_name} {p.postal_code}
          </p>
          <p>
            Persetujuan orang tua, publikasi, syarat, dan biaya: tercatat{" "}
            {new Date(r.consented_at).toLocaleString("id-ID")}
          </p>
          {r.participant_media.map((m: { id: string }) => (
            <PrivateMedia key={m.id} id={m.id} kind="participant" />
          ))}
          <h3>Pembayaran: {r.payment_status}</h3>
          <AdminControl action="payment" id={r.id} />
        </section>
        <section className="card stack">
          <h3>Worksheet & karya</h3>
          {r.competition_type === "coloring" && (
            <WorksheetUpload id={r.id} />
          )}{" "}
          {r.worksheets.map((w: { id: string; version: number }) => (
            <div key={w.id}>
              <p>Worksheet versi {w.version}</p>
              <PrivateMedia id={w.id} kind="worksheet" />
            </div>
          ))}
          {r.submissions.map(
            (s: { id: string; status: string; publication_status: string }) => (
              <div className="card stack" key={s.id}>
                <p>
                  {s.status} · {s.publication_status}
                </p>
                <PrivateMedia id={s.id} kind="submission" />
                {s.publication_status === "approved" ? (
                  <AdminControl action="unpublish" id={s.id} />
                ) : (
                  <AdminControl action="review" id={s.id} />
                )}
              </div>
            ),
          )}
        </section>
      </div>
    </>
  );
}
