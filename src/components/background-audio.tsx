"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Music2, Volume2, VolumeX } from "lucide-react";

export function BackgroundAudio() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isAdmin || !enabled) return;

    const play = () => {
      audio.volume = 0.32;
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    };
    play();
    window.addEventListener("pointerdown", play, { once: true });
    window.addEventListener("keydown", play, { once: true });
    return () => {
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("keydown", play);
    };
  }, [enabled, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    audioRef.current?.pause();
    queueMicrotask(() => setPlaying(false));
  }, [isAdmin]);

  if (isAdmin)
    return (
      <audio ref={audioRef} src="/jingleidolacontest.mp3" loop preload="auto" />
    );

  return (
    <>
      <audio
        ref={audioRef}
        src="/jingleidolacontest.mp3"
        autoPlay
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`audio-toggle${playing ? " playing" : ""}`}
        aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
        title={playing ? "Matikan musik" : "Nyalakan musik"}
        onClick={() => {
          const audio = audioRef.current;
          if (!audio) return;
          if (playing) {
            audio.pause();
            setEnabled(false);
          } else {
            setEnabled(true);
            audio.volume = 0.32;
            void audio
              .play()
              .then(() => setPlaying(true))
              .catch(() => {});
          }
        }}
      >
        <span className="audio-note" aria-hidden="true">
          <Music2 />
        </span>
        {playing ? <Volume2 /> : <VolumeX />}
        <span>{playing ? "Musik aktif" : "Putar musik"}</span>
      </button>
    </>
  );
}
