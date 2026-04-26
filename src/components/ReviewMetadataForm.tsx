import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Field, Section, TextAreaField } from "./Field";
import type { ReviewMetadata } from "../domain/reviewTypes";
import type { MetadataErrors } from "../domain/reviewValidation";

interface ReviewMetadataFormProps {
  metadata: ReviewMetadata;
  errors: MetadataErrors;
  onChange: <Key extends keyof ReviewMetadata>(key: Key, value: ReviewMetadata[Key]) => void;
  onLogoChange: (file: File | null) => void;
}

export function ReviewMetadataForm({ metadata, errors, onChange, onLogoChange }: ReviewMetadataFormProps) {
  const { t } = useTranslation();
  const logoInputId = useId();

  return (
    <>
      <Section title={t("meta.generalTitle")}>
        <div className="grid gap-2.5">
          <Field required error={errors.reviewTitle} label={t("meta.reviewTitle")} value={metadata.reviewTitle} placeholder={t("meta.reviewTitlePlaceholder")} onChange={(event) => onChange("reviewTitle", event.target.value)} />
          <Field required error={errors.reviewDate} label={t("meta.reviewDate")} type="date" value={metadata.reviewDate} onChange={(event) => onChange("reviewDate", event.target.value)} />
          <Field required error={errors.meetingDate} label={t("meta.meetingDate")} type="date" value={metadata.meetingDate} onChange={(event) => onChange("meetingDate", event.target.value)} />
          <Field required error={errors.meetingStart} label={t("meta.meetingStart")} type="time" value={metadata.meetingStart} onChange={(event) => onChange("meetingStart", event.target.value)} />
          <Field required error={errors.meetingEnd} label={t("meta.meetingEnd")} type="time" value={metadata.meetingEnd} onChange={(event) => onChange("meetingEnd", event.target.value)} />
          <Field required error={errors.meetingPlace} label={t("meta.meetingPlace")} value={metadata.meetingPlace} placeholder={t("meta.meetingPlacePlaceholder")} onChange={(event) => onChange("meetingPlace", event.target.value)} />
          <Field required error={errors.meetingSubject} label={t("meta.meetingSubject")} value={metadata.meetingSubject} placeholder={t("meta.meetingSubjectPlaceholder")} onChange={(event) => onChange("meetingSubject", event.target.value)} />
          <Field error={errors.svnGit} label={t("meta.svnGit")} value={metadata.svnGit} placeholder={t("meta.svnGitPlaceholder")} onChange={(event) => onChange("svnGit", event.target.value)} />
          <Field required error={errors.revision} label={t("meta.revision")} value={metadata.revision} placeholder={t("meta.revisionPlaceholder")} onChange={(event) => onChange("revision", event.target.value)} />
          <Field label={t("meta.companyName")} value={metadata.companyName} placeholder={t("meta.companyNamePlaceholder")} onChange={(event) => onChange("companyName", event.target.value)} />
          <label className="grid gap-2 md:grid-cols-[160px_1fr] md:items-start">
            <span className="field-label">{t("meta.logo")}</span>
            <span className="grid gap-2">
              <input
                id={logoInputId}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={(event) => onLogoChange(event.target.files?.[0] ?? null)}
              />
              <label className="btn-secondary w-fit cursor-pointer" htmlFor={logoInputId}>
                {t("meta.addLogo")}
              </label>
              {metadata.companyLogoDataUrl ? (
                <span className="logo-upload-preview">
                  <img className="logo-upload-thumb" src={metadata.companyLogoDataUrl} alt={t("meta.logoPreview")} />
                  <button className="btn-danger" type="button" onClick={() => onChange("companyLogoDataUrl", "")}>
                    X
                  </button>
                </span>
              ) : (
                <span className="muted text-xs">{t("meta.logoHint")}</span>
              )}
            </span>
          </label>
        </div>
      </Section>

      <Section title={t("meta.summaryTitle")}>
        <TextAreaField
          label={t("meta.summaryLabel")}
          value={metadata.meetingSummary}
          placeholder={t("meta.summaryPlaceholder")}
          onChange={(event) => onChange("meetingSummary", event.target.value)}
        />
      </Section>
    </>
  );
}
