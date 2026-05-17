import { useTranslation } from "react-i18next";
import { PageHeader } from "./PageHeader";
import type { Participant } from "../domain/reviewTypes";
import type { ParticipantErrors } from "../domain/reviewValidation";

interface ParticipantsEditorProps {
  participants: Participant[];
  errors: ParticipantErrors;
  listError?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: <Key extends keyof Participant>(index: number, key: Key, value: Participant[Key]) => void;
}

const AVATAR_COLORS = ["#1a5fa8", "#8f2f2a", "#3f6e8c", "#4f5fa3", "#7a5a0d", "#6b7785"];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function uniqueDomains(participants: Participant[]): string[] {
  const domains = new Set<string>();
  for (const p of participants) {
    const at = p.email.indexOf("@");
    if (at !== -1) domains.add(p.email.slice(at + 1));
  }
  return Array.from(domains);
}

function uniqueRoles(participants: Participant[]): { role: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of participants) {
    if (p.role.trim()) map.set(p.role.trim(), (map.get(p.role.trim()) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([role, count]) => ({ role, count }));
}

export function ParticipantsEditor({ participants, errors, listError, onAdd, onRemove, onChange }: ParticipantsEditorProps) {
  const { t } = useTranslation();
  const domains = uniqueDomains(participants);
  const roles = uniqueRoles(participants);

  return (
    <>
      <PageHeader
        kicker={t("ui.sectionProject")}
        title={t("participants.title")}
        subtitle={t("participants.subtitle")}
        tiles={[
          { label: t("participants.tileCount"), value: String(participants.length), sub: t("ui.total") },
          { label: t("participants.tileRoles"), value: String(roles.length), sub: t("participants.distintos") },
          ...(domains.length > 0 ? [{ label: t("participants.tileDomains"), value: String(domains.length), sub: domains.join(" · "), color: "#1a5fa8" }] : []),
        ]}
        cta={
          <button className="rf-primary-btn" type="button" onClick={onAdd}>
            <PlusIcon />
            <span>{t("participants.add")}</span>
          </button>
        }
      />

      {listError && <div className="alert-error" style={{ marginBottom: 16 }}>{listError}</div>}

      <section className="rf-card" style={{ overflow: "hidden", marginBottom: 16 }}>
        <table className="rf-table">
          <colgroup>
            <col />
            <col style={{ width: 96 }} />
            <col style={{ width: 200 }} />
            <col style={{ width: "38%" }} />
            <col style={{ width: 56 }} />
          </colgroup>
          <thead>
            <tr>
              <th className="rf-th">{t("participants.name")}</th>
              <th className="rf-th center">{t("participants.initialsCol")}</th>
              <th className="rf-th">{t("participants.role")}</th>
              <th className="rf-th">{t("participants.email")}</th>
              <th className="rf-th" />
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr className="rf-tr" key={index}>
                <td className="rf-td">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 6 }}>
                    <div className="rf-avatar" style={{ background: getAvatarColor(index) }}>
                      {participant.initials || deriveInitials(participant.name) || "?"}
                    </div>
                    <input
                      className="rf-cell-input"
                      style={{ fontWeight: 500 }}
                      value={participant.name}
                      placeholder={t("participants.namePlaceholder")}
                      aria-invalid={Boolean(errors[index]?.name)}
                      onChange={(e) => onChange(index, "name", e.target.value)}
                    />
                  </div>
                  {errors[index]?.name && <div className="rf-input-error" style={{ paddingLeft: 42 }}>{errors[index].name}</div>}
                </td>
                <td className="rf-td">
                  <input
                    className="rf-cell-input mono"
                    style={{ textAlign: "center", textTransform: "uppercase" }}
                    value={participant.initials}
                    placeholder="—"
                    aria-invalid={Boolean(errors[index]?.initials)}
                    onChange={(e) => onChange(index, "initials", e.target.value)}
                  />
                  {errors[index]?.initials && <div className="rf-input-error">{errors[index].initials}</div>}
                </td>
                <td className="rf-td">
                  <input
                    className="rf-cell-input"
                    value={participant.role}
                    placeholder={t("participants.rolePlaceholder")}
                    aria-invalid={Boolean(errors[index]?.role)}
                    onChange={(e) => onChange(index, "role", e.target.value)}
                  />
                  {errors[index]?.role && <div className="rf-input-error">{errors[index].role}</div>}
                </td>
                <td className="rf-td">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#94a3b8", paddingLeft: 4, flexShrink: 0 }}>
                      <MailIcon />
                    </span>
                    <input
                      className="rf-cell-input mono"
                      type="email"
                      value={participant.email}
                      placeholder={t("participants.emailPlaceholder")}
                      aria-invalid={Boolean(errors[index]?.email)}
                      onChange={(e) => onChange(index, "email", e.target.value)}
                    />
                  </div>
                  {errors[index]?.email && <div className="rf-input-error">{errors[index].email}</div>}
                </td>
                <td className="rf-td" style={{ textAlign: "right", paddingRight: 10 }}>
                  <button
                    className="rf-icon-btn danger rf-row-actions"
                    type="button"
                    title={t("participants.remove")}
                    aria-label={t("participants.remove")}
                    onClick={() => onRemove(index)}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}

            {/* Add row */}
            <tr className="rf-tr" style={{ cursor: "pointer" }} onClick={onAdd}>
              <td className="rf-td">
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 6 }}>
                  <div className="rf-avatar-ghost">
                    <PlusIcon size={14} />
                  </div>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>{t("participants.addName")}</span>
                </div>
              </td>
              <td className="rf-td" colSpan={3} />
              <td className="rf-td" style={{ textAlign: "right", paddingRight: 14 }}>
                <span style={{ fontSize: 10.5, color: "#94a3b8", fontFamily: "var(--font-mono)" }}>↵</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="rf-table-infobar">
          <InfoIcon />
          <span>{t("participants.initialsHint")}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            {participants.length} {t("participants.rowsLabel")} · {t("participants.manualOrder")}
          </span>
        </div>
      </section>

      {roles.length > 0 && (
        <section className="rf-roles-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="rf-section-kicker">3.1</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 2 }}>
                {t("participants.rolesSummary")}
              </div>
            </div>
            <span style={{ fontSize: 11.5, color: "#6b7280" }}>{t("participants.rolesFromTable")}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {roles.map((r, i) => (
              <div className="rf-role-pill" key={i}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a5fa8" }} />
                <span style={{ color: "#111827", fontWeight: 500 }}>{r.role}</span>
                <span style={{ color: "#6b7280", fontFamily: "var(--font-mono)" }}>×{r.count}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
