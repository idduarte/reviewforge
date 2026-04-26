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
  return (
    <Section title="Participantes">
      {listError ? (
        <div className="alert-error text-xs">
          {listError}
        </div>
      ) : null}

      <div className="mb-2 grid gap-3">
        {participants.map((participant, index) => (
          <div className="grid gap-2 md:grid-cols-[1fr_110px_180px_1fr_auto] md:items-start" key={index}>
            <ParticipantInput
              value={participant.name}
              placeholder="Nombre completo"
              error={errors[index]?.name}
              onChange={(value) => onChange(index, "name", value)}
            />
            <ParticipantInput
              value={participant.initials}
              placeholder="Iniciales"
              error={errors[index]?.initials}
              onChange={(value) => onChange(index, "initials", value)}
            />
            <ParticipantInput
              value={participant.role}
              placeholder="Rol/cargo"
              error={errors[index]?.role}
              onChange={(value) => onChange(index, "role", value)}
            />
            <ParticipantInput
              type="email"
              value={participant.email}
              placeholder="Email"
              error={errors[index]?.email}
              onChange={(value) => onChange(index, "email", value)}
            />
            <button
              className="btn-danger btn-danger-icon"
              type="button"
              title="Eliminar participante"
              aria-label="Eliminar participante"
              onClick={() => onRemove(index)}
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
        ))}
      </div>

      <button className="btn-secondary" type="button" onClick={onAdd}>
        + Añadir participante
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
