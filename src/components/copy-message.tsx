"use client";

import { useMemo, useState } from "react";
import { Copy, Check, MessageCircleHeart } from "lucide-react";
import {
  availableStages,
  composeMessage,
  currentStage,
  stageLabels,
  type MessageContext,
  type MessageStage,
} from "@/lib/messages";
import { showSuccess } from "@/lib/success-event";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/**
 * One-tap personal Instagram DM for the participant's current stage, with a
 * preview and the option to pick another stage.
 */
export function CopyMessage({
  context,
  compact = false,
  stage: preferred,
}: {
  context: MessageContext;
  compact?: boolean;
  stage?: MessageStage;
}) {
  const stages = useMemo(() => availableStages(context), [context]);
  const [stage, setStage] = useState<MessageStage>(preferred ?? currentStage(context));
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(!compact);
  const text = useMemo(() => composeMessage(stage, context), [stage, context]);

  async function copy() {
    const ok = await copyText(text);
    setCopied(ok);
    showSuccess(
      ok
        ? `Pesan "${stageLabels[stage]}" untuk Mommy ${context.public_name} siap ditempel di DM Instagram.`
        : "Browser menolak akses clipboard. Salin manual dari pratinjau.",
      "copy",
      ok ? "Pesan tersalin!" : "Belum tersalin",
    );
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className={`copy-message${compact ? " compact" : ""}`}>
      <div className="copy-message-bar">
        <label className="field copy-message-stage">
          <span>
            <MessageCircleHeart size={15} aria-hidden="true" /> Pesan DM untuk Mommy{" "}
            {context.public_name}
          </span>
          <select value={stage} onChange={(e) => setStage(e.target.value as MessageStage)}>
            {stages.map((item, i) => (
              <option key={item} value={item}>
                {i === 0 ? "● " : ""}
                {stageLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />} {copied ? "Tersalin" : "Salin pesan"}
        </button>
        {compact && (
          <button
            type="button"
            className="link-button"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Sembunyikan" : "Lihat pesan"}
          </button>
        )}
      </div>
      {open && (
        <textarea
          className="copy-message-preview"
          readOnly
          value={text}
          rows={compact ? 7 : 12}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Pratinjau pesan"
        />
      )}
    </div>
  );
}
