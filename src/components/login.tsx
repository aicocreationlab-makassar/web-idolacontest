"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccess } from "@/lib/success-event";
export function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await fetch("/api/admin/login", {
            method: "POST",
            body: new FormData(e.currentTarget),
          });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          showSuccess(
            "Login berhasil. Selamat datang di ruang pengelola.",
            "login",
          );
          router.replace("/admin/dashboard");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>
        Hanya untuk pengelola dan juri resmi. Peserta menggunakan kode
        registrasi.
      </p>
      <label className="field">
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="field">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      <button className="btn" disabled={busy}>
        Masuk
      </button>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
    </form>
  );
}
