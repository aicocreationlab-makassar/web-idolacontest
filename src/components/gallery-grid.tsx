"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MapPin, Palette, Sparkles, X } from "lucide-react";
import { categories, competitions } from "@/lib/business-rules";
import { Share } from "./share";

type GalleryItem = {
  slug: string;
  public_name: string;
  public_file_path: string;
  competition_type: keyof typeof competitions;
  category: keyof typeof categories;
  regency_name: string;
  province_name: string;
  imageUrl: string;
};

export function GalleryGrid({
  items,
  highlighted,
}: {
  items: GalleryItem[];
  highlighted?: string;
}) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [selected]);

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <button
            type="button"
            id={`finalis-${item.slug}`}
            className={`gallery-card${highlighted === item.slug ? " gallery-highlight" : ""}`}
            key={item.slug}
            onClick={() => setSelected(item)}
            aria-label={`Lihat karya ${item.public_name}`}
          >
            <Image
              src={item.imageUrl}
              width={360}
              height={360}
              sizes="(max-width:760px) 90vw, 30vw"
              alt={`Karya ${item.public_name}`}
              className="rounded-xl aspect-square object-cover w-full"
            />
            <span className="eyebrow block mt-5">
              {competitions[item.competition_type]} ·{" "}
              {categories[item.category]}
            </span>
            <h3 className="mt-2">{item.public_name}</h3>
            <p className="muted text-sm">
              {item.regency_name}, {item.province_name}
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="gallery-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            className="gallery-quick-view"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
          >
            <button
              className="gallery-modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Tutup informasi karya"
            >
              <X />
            </button>
            <Image
              src={selected.imageUrl}
              width={800}
              height={800}
              sizes="(max-width:760px) 100vw, 55vw"
              alt={`Karya ${selected.public_name}`}
              className="gallery-modal-image"
              priority
            />
            <div className="gallery-modal-copy stack">
              <span className="pill">
                <Sparkles /> FINALIS IDOLA CONTEST
              </span>
              <h2 id="gallery-dialog-title">{selected.public_name}</h2>
              <p className="gallery-modal-competition">
                <Palette /> {competitions[selected.competition_type]} ·{" "}
                {categories[selected.category]}
              </p>
              <p className="muted gallery-modal-location">
                <MapPin /> {selected.regency_name}, {selected.province_name}
              </p>
              <p>
                Tema: <b>Cita Citaku</b>
              </p>
              <Share
                url={`https://idolacontest.my.id/finalis/${selected.slug}`}
                name={selected.public_name}
              />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
