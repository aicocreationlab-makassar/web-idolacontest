import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AdminStep } from "@/lib/admin-steps";
import { ContestBadge } from "./contest-badge";

/**
 * One participant in an admin list: a short summary that is always visible
 * (who, which contest, what happens next, the main action) and the rest folded
 * under "Lihat detail".
 */
export function AdminRecord({
  name,
  href,
  code,
  competition,
  category,
  step,
  meta,
  badges,
  action,
  children,
}: {
  name: string;
  href: string;
  code: string;
  competition: string;
  category: string;
  step?: AdminStep;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className={`admin-record${step ? ` tone-${step.tone}` : ""}`}>
      <div className="admin-record-summary">
        <div className="admin-record-who">
          <Link className="admin-record-name" href={href}>
            {name}
          </Link>
          <span className="admin-record-code">{code}</span>
          {meta && <span className="admin-record-meta">{meta}</span>}
        </div>
        <div className="admin-record-tags">
          <ContestBadge
            type={competition}
            label={competition === "coloring" ? "Mewarnai" : "Fotogenik"}
          />
          <span className="admin-record-category">{category}</span>
          {badges}
        </div>
        {step && (
          <span className={`admin-next-step tone-${step.tone}`}>
            <ArrowRight aria-hidden="true" />
            {step.label}
          </span>
        )}
      </div>
      {action && <div className="admin-record-action">{action}</div>}
      {children && (
        <details className="admin-record-details">
          <summary>Lihat detail</summary>
          <div className="admin-record-body">{children}</div>
        </details>
      )}
    </article>
  );
}
