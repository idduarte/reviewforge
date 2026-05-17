import { useId, type ChangeEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "./PageHeader";
import { TextAreaField } from "./Field";
import type { MetaSubTab, ReviewMetadata } from "../domain/reviewTypes";
import type { MetadataErrors } from "../domain/reviewValidation";

interface ReviewMetadataFormProps {
  metadata: ReviewMetadata;
  errors: MetadataErrors;
  subTab: MetaSubTab;
  onChange: <Key extends keyof ReviewMetadata>(key: Key, value: ReviewMetadata[Key]) => void;
  onLogoChange: (file: File | null) => void;
}

function FormRow({
  label,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="rf-form-row">
      <div className="rf-form-label">
        <span>{label}</span>
        {required && <span className="rf-form-required">*</span>}
      </div>
      <div>
        {children}
        {error && (
          <div className="rf-input-error">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {hint && !error && <div className="rf-input-hint">{hint}</div>}
      </div>
    </div>
  );
}

function RfInput({
  value,
  placeholder,
  error,
  mono,
  type = "text",
  onChange,
}: {
  value: string;
  placeholder?: string;
  error?: boolean;
  mono?: boolean;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`rf-input${mono ? " mono" : ""}${error ? " error" : ""}`}
    />
  );
}

export function ReviewMetadataForm({ metadata, errors, subTab, onChange, onLogoChange }: ReviewMetadataFormProps) {
  const { t } = useTranslation();
  const logoInputId = useId();

  const errorCount = Object.values(errors).filter(Boolean).length;
  const completedRequired = [
    Boolean(metadata.reviewTitle),
    Boolean(metadata.reviewDate),
    Boolean(metadata.meetingDate),
    Boolean(metadata.meetingStart),
    Boolean(metadata.meetingEnd),
    Boolean(metadata.meetingPlace),
    Boolean(metadata.meetingSubject),
    Boolean(metadata.revision),
  ].filter(Boolean).length;

  if (subTab === "encabezado") {
    const dash = "—";
    const fmt = (v: string) => v.trim() || dash;
    const fmtDate = (v: string) => {
      if (!v) return dash;
      const [y, m, d] = v.split("-");
      return `${d}.${m}.${y}`;
    };

    return (
      <>
        <PageHeader
          kicker={t("ui.sectionProject")}
          title={t("meta.generalTitle")}
          subtitle={t("meta.generalDesc")}
          tiles={[
            { label: t("ui.completed"), value: `${completedRequired}/8`, sub: t("ui.required"), color: "#1a5fa8" },
            ...(errorCount > 0 ? [{ label: t("ui.errors"), value: String(errorCount), sub: t("ui.toFix"), color: "#b42318" }] : []),
          ]}
        />

        <div className="rf-meta-split">
          <section className="rf-card" style={{ padding: "22px 26px 18px" }}>
            <div style={{ paddingTop: 6 }}>
              <FormRow label={t("meta.reviewTitle")} required error={errors.reviewTitle}>
                <RfInput value={metadata.reviewTitle} placeholder={t("meta.reviewTitlePlaceholder")} error={Boolean(errors.reviewTitle)} onChange={(e) => onChange("reviewTitle", e.target.value)} />
              </FormRow>

              <div className="rf-2col">
                <FormRow label={t("meta.reviewDate")} required error={errors.reviewDate}>
                  <RfInput type="date" value={metadata.reviewDate} mono error={Boolean(errors.reviewDate)} onChange={(e) => onChange("reviewDate", e.target.value)} />
                </FormRow>
                <FormRow label={t("meta.meetingDate")} required error={errors.meetingDate}>
                  <RfInput type="date" value={metadata.meetingDate} mono error={Boolean(errors.meetingDate)} onChange={(e) => onChange("meetingDate", e.target.value)} />
                </FormRow>
              </div>

              <div className="rf-2col">
                <FormRow label={t("meta.meetingStart")} required error={errors.meetingStart}>
                  <RfInput type="time" value={metadata.meetingStart} mono error={Boolean(errors.meetingStart)} onChange={(e) => onChange("meetingStart", e.target.value)} />
                </FormRow>
                <FormRow label={t("meta.meetingEnd")} required error={errors.meetingEnd}>
                  <RfInput type="time" value={metadata.meetingEnd} mono error={Boolean(errors.meetingEnd)} onChange={(e) => onChange("meetingEnd", e.target.value)} />
                </FormRow>
              </div>

              <FormRow label={t("meta.meetingPlace")} required error={errors.meetingPlace}>
                <RfInput value={metadata.meetingPlace} placeholder={t("meta.meetingPlacePlaceholder")} error={Boolean(errors.meetingPlace)} onChange={(e) => onChange("meetingPlace", e.target.value)} />
              </FormRow>

              <FormRow label={t("meta.meetingSubject")} required error={errors.meetingSubject}>
                <RfInput value={metadata.meetingSubject} placeholder={t("meta.meetingSubjectPlaceholder")} error={Boolean(errors.meetingSubject)} onChange={(e) => onChange("meetingSubject", e.target.value)} />
              </FormRow>

              <FormRow label={t("meta.svnGit")} hint={t("meta.svnGitPlaceholder")}>
                <RfInput value={metadata.svnGit} placeholder={t("meta.svnGitPlaceholder")} mono onChange={(e) => onChange("svnGit", e.target.value)} />
              </FormRow>

              <FormRow label={t("meta.revision")} required error={errors.revision}>
                <RfInput type="number" value={metadata.revision} mono error={Boolean(errors.revision)} onChange={(e) => onChange("revision", e.target.value)} />
              </FormRow>
            </div>
          </section>

          {/* Live preview table */}
          <section className="rf-card rf-meta-preview">
            <div className="rf-meta-preview-title">{t("ui.preview")}</div>
            <table className="rf-preview-table">
              <tbody>
                <tr>
                  <td className="rf-preview-label">{t("output.companyRow")}</td>
                  <td className="rf-preview-value">{fmt(metadata.companyName)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("output.subjectRow")}</td>
                  <td className="rf-preview-value">{fmt(metadata.meetingSubject)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("meta.reviewDate")}</td>
                  <td className="rf-preview-value mono">{fmtDate(metadata.reviewDate)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("meta.meetingDate")}</td>
                  <td className="rf-preview-value mono">{fmtDate(metadata.meetingDate)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("meta.meetingStart")}</td>
                  <td className="rf-preview-value mono">{fmt(metadata.meetingStart)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("meta.meetingEnd")}</td>
                  <td className="rf-preview-value mono">{fmt(metadata.meetingEnd)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("output.placeRow")}</td>
                  <td className="rf-preview-value">{fmt(metadata.meetingPlace)}</td>
                </tr>
                <tr>
                  <td className="rf-preview-label">{t("output.revisionRow")}</td>
                  <td className="rf-preview-value mono">{fmt(metadata.revision)}</td>
                </tr>
                {metadata.svnGit && (
                  <tr>
                    <td className="rf-preview-label">{t("output.svnGitRow")}</td>
                    <td className="rf-preview-value mono" style={{ wordBreak: "break-all" }}>{metadata.svnGit}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </>
    );
  }

  if (subTab === "logo") {
    return (
      <>
        <PageHeader
          kicker={t("ui.sectionProject")}
          title={t("meta.logo")}
          subtitle={t("meta.logoHint")}
          tiles={[
            { label: t("ui.logo"), value: metadata.companyLogoDataUrl ? "✓" : "—", sub: metadata.companyLogoDataUrl ? t("ui.logoLoaded") : t("ui.noLogo") },
          ]}
        />

        <section className="rf-card" style={{ padding: "22px 26px 18px" }}>
          <div style={{ paddingTop: 6 }}>
            <FormRow label={t("meta.companyName")} hint={t("meta.companyNamePlaceholder")}>
              <RfInput value={metadata.companyName} placeholder={t("meta.companyNamePlaceholder")} onChange={(e) => onChange("companyName", e.target.value)} />
            </FormRow>
          </div>
        </section>

        <section className="rf-card" style={{ padding: "22px 26px 22px", marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20, alignItems: "start" }}>
            <div style={{ paddingTop: 9, fontSize: 13, color: "#111827", fontWeight: 500 }}>{t("meta.logo")}</div>

            <div>
              {metadata.companyLogoDataUrl && (
                <div className="rf-logo-preview">
                  <div className="rf-logo-thumb">
                    <img src={metadata.companyLogoDataUrl} alt={t("meta.logoPreview")} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rf-logo-name">{t("meta.logoPreview")}</div>
                    <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>
                      {metadata.companyName || "Logo de empresa"}
                    </div>
                  </div>
                  <button className="rf-ghost-btn sm" type="button" onClick={() => onChange("companyLogoDataUrl", "")}>
                    <TrashIcon />
                    <span>{t("meta.removeLogo")}</span>
                  </button>
                </div>
              )}

              <label className="rf-drop-zone" htmlFor={logoInputId} style={{ cursor: "pointer" }}>
                <div className="rf-drop-zone-icon">
                  <UploadIcon />
                </div>
                <span>{t("meta.addLogo")}</span>
                <a>{t("meta.selectFile")}</a>
                <span style={{ color: "#94a3b8", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
                  .svg · .png · .jpg
                </span>
              </label>

              <input
                id={logoInputId}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
              />

              <div className="rf-input-hint">{t("meta.logoHint")}</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (subTab === "resumen") {
    return (
      <>
        <PageHeader
          kicker={t("ui.sectionProject")}
          title={t("meta.summaryTitle")}
          subtitle={t("meta.summaryPlaceholder")}
          tiles={[
            { label: t("ui.characters"), value: String(metadata.meetingSummary.length), sub: metadata.meetingSummary.length > 0 ? t("ui.drafted") : t("ui.empty") },
          ]}
        />

        <section className="rf-card" style={{ padding: "22px 26px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
          <TextAreaField
            label={t("meta.summaryLabel")}
            value={metadata.meetingSummary}
            placeholder={t("meta.summaryPlaceholder")}
            onChange={(e) => onChange("meetingSummary", e.target.value)}
            style={{ minHeight: 480, resize: "vertical" }}
          />
        </section>
      </>
    );
  }

  return null;
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
