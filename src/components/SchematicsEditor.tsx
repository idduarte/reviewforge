import { useTranslation } from "react-i18next";
import { Section } from "./Field";
import { FindingsEditor } from "./FindingsEditor";
import type { Finding, SchematicFile } from "../domain/reviewTypes";
import type { NamedFileErrors, SectionFindingErrors } from "../domain/reviewValidation";

interface SchematicsEditorProps {
  schematics: SchematicFile[];
  errors: NamedFileErrors;
  findingErrors: SectionFindingErrors;
  onAddSchematic: () => void;
  onRemoveSchematic: (index: number) => void;
  onSchematicNameChange: (index: number, name: string) => void;
  onAddSchematicFinding: (schematicIndex: number) => void;
  onRemoveSchematicFinding: (schematicIndex: number, findingIndex: number) => void;
  onSchematicFindingChange: <Key extends keyof Finding>(schematicIndex: number, findingIndex: number, key: Key, value: Finding[Key]) => void;
}

export function SchematicsEditor({
  schematics,
  errors,
  findingErrors,
  onAddSchematic,
  onRemoveSchematic,
  onSchematicNameChange,
  onAddSchematicFinding,
  onRemoveSchematicFinding,
  onSchematicFindingChange,
}: SchematicsEditorProps) {
  const { t } = useTranslation();

  return (
    <Section title={t("schematics.title")}>
      <div className="mb-3 flex justify-end">
        <button className="btn-secondary" type="button" onClick={onAddSchematic}>
          {t("schematics.addFile")}
        </button>
      </div>

      <div className="grid gap-3">
        {schematics.map((schematic, index) => (
          <article className="sub-card" key={index}>
            <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                className={`input font-medium ${errors[index]?.name ? "error-input" : ""}`}
                value={schematic.name}
                placeholder={t("schematics.filePlaceholder")}
                onChange={(event) => onSchematicNameChange(index, event.target.value)}
              />
              <button
                className="btn-danger btn-danger-icon"
                type="button"
                title={t("schematics.removeFile")}
                aria-label={t("schematics.removeFile")}
                onClick={() => onRemoveSchematic(index)}
              >
                <span aria-hidden="true">X</span>
              </button>
              {errors[index]?.name ? <span className="danger-text mt-1 block text-xs md:col-span-2">{errors[index].name}</span> : null}
            </div>

            <FindingsEditor
              findings={schematic.findings}
              errors={findingErrors[index]}
              onAdd={() => onAddSchematicFinding(index)}
              onRemove={(findingIndex) => onRemoveSchematicFinding(index, findingIndex)}
              onChange={(findingIndex, key, value) => onSchematicFindingChange(index, findingIndex, key, value)}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
