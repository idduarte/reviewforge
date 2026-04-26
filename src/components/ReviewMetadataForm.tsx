import { useId } from "react";
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
  const logoInputId = useId();

  return (
    <>
      <Section title="Información general">
        <div className="grid gap-2.5">
          <Field required error={errors.reviewTitle} label="Título de la revisión" value={metadata.reviewTitle} placeholder="Ej: revisión de esquemáticos SVEC" onChange={(event) => onChange("reviewTitle", event.target.value)} />
          <Field required error={errors.reviewDate} label="Fecha de revisión" type="date" value={metadata.reviewDate} onChange={(event) => onChange("reviewDate", event.target.value)} />
          <Field required error={errors.meetingDate} label="Fecha de reunión" type="date" value={metadata.meetingDate} onChange={(event) => onChange("meetingDate", event.target.value)} />
          <Field required error={errors.meetingStart} label="Hora inicio" type="time" value={metadata.meetingStart} onChange={(event) => onChange("meetingStart", event.target.value)} />
          <Field required error={errors.meetingEnd} label="Hora fin" type="time" value={metadata.meetingEnd} onChange={(event) => onChange("meetingEnd", event.target.value)} />
          <Field required error={errors.meetingPlace} label="Lugar" value={metadata.meetingPlace} placeholder="Ej: CERN Prevessin, Building 864, Room 1-A15" onChange={(event) => onChange("meetingPlace", event.target.value)} />
          <Field required error={errors.meetingSubject} label="Asunto" value={metadata.meetingSubject} placeholder="Ej: revisión XXX" onChange={(event) => onChange("meetingSubject", event.target.value)} />
          <Field error={errors.svnGit} label="SVN/GIT" value={metadata.svnGit} placeholder="Opcional: URL del repositorio" onChange={(event) => onChange("svnGit", event.target.value)} />
          <Field required error={errors.revision} label="Revisión #" value={metadata.revision} placeholder="0" onChange={(event) => onChange("revision", event.target.value)} />
          <Field label="Nombre empresa" value={metadata.companyName} placeholder="Opcional: nombre de la empresa" onChange={(event) => onChange("companyName", event.target.value)} />
          <label className="grid gap-2 md:grid-cols-[160px_1fr] md:items-start">
            <span className="field-label">Logo</span>
            <span className="grid gap-2">
              <input
                id={logoInputId}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={(event) => onLogoChange(event.target.files?.[0] ?? null)}
              />
              <label className="btn-secondary w-fit cursor-pointer" htmlFor={logoInputId}>
                + Añadir logo
              </label>
              {metadata.companyLogoDataUrl ? (
                <span className="logo-upload-preview">
                  <img className="logo-upload-thumb" src={metadata.companyLogoDataUrl} alt="Vista previa del logo" />
                  <button className="btn-danger" type="button" onClick={() => onChange("companyLogoDataUrl", "")}>
                    X
                  </button>
                </span>
              ) : (
                <span className="muted text-xs">Opcional: se usará en la portada del PDF si existe logo o nombre empresa.</span>
              )}
            </span>
          </label>
        </div>
      </Section>

      <Section title="Resumen de la reunión">
        <TextAreaField
          label="Resumen"
          value={metadata.meetingSummary}
          placeholder="Resumen general de la reunión y estado del proyecto..."
          onChange={(event) => onChange("meetingSummary", event.target.value)}
        />
      </Section>
    </>
  );
}
