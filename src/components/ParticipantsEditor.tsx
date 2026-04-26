import { useTranslation } from "react-i18next";
import { Section } from "./Field";
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

export function ParticipantsEditor({ participants, errors, listError, onAdd, onRemove, onChange }: ParticipantsEditorProps) {
  const { t } = useTranslation();

  return (
    <Section title={t("participants.title")}>
      {listError ? (
        <div className="alert-error text-xs">{listError}</div>
      ) : null}

      <div className="mb-2 grid gap-3">
        {participants.map((participant, index) => (
          <div className="grid gap-2 md:grid-cols-[1fr_110px_180px_1fr_auto] md:items-start" key={index}>
            <ParticipantInput
              value={participant.name}
              placeholder={t("participants.namePlaceholder")}
              error={errors[index]?.name}
              onChange={(value) => onChange(index, "name", value)}
            />
            <ParticipantInput
              value={participant.initials}
              placeholder={t("participants.initialsPlaceholder")}
              error={errors[index]?.initials}
              onChange={(value) => onChange(index, "initials", value)}
            />
            <ParticipantInput
              value={participant.role}
              placeholder={t("participants.rolePlaceholder")}
              error={errors[index]?.role}
              onChange={(value) => onChange(index, "role", value)}
            />
            <ParticipantInput
              type="email"
              value={participant.email}
              placeholder={t("participants.emailPlaceholder")}
              error={errors[index]?.email}
              onChange={(value) => onChange(index, "email", value)}
            />
            <button
              className="btn-danger btn-danger-icon"
              type="button"
              title={t("participants.remove")}
              aria-label={t("participants.remove")}
              onClick={() => onRemove(index)}
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
        ))}
      </div>

      <button className="btn-secondary" type="button" onClick={onAdd}>
        {t("participants.add")}
      </button>
    </Section>
  );
}

function ParticipantInput({
  value,
  placeholder,
  error,
  type = "text",
  onChange,
}: {
  value: string;
  placeholder: string;
  error?: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <span>
      <input
        className={`input ${error ? "error-input" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="danger-text mt-1 block text-xs">{error}</span> : null}
    </span>
  );
}
