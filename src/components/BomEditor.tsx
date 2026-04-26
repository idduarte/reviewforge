import { Section } from "./Field";
import { FindingsEditor } from "./FindingsEditor";
import type { BomFile, Finding } from "../domain/reviewTypes";
import type { NamedFileErrors, SectionFindingErrors } from "../domain/reviewValidation";

interface BomEditorProps {
  files: BomFile[];
  errors: NamedFileErrors;
  findingErrors: SectionFindingErrors;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
  onFileNameChange: (index: number, name: string) => void;
  onAddFinding: (fileIndex: number) => void;
  onRemoveFinding: (fileIndex: number, findingIndex: number) => void;
  onFindingChange: <Key extends keyof Finding>(fileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) => void;
}

export function BomEditor({
  files,
  errors,
  findingErrors,
  onAddFile,
  onRemoveFile,
  onFileNameChange,
  onAddFinding,
  onRemoveFinding,
  onFindingChange,
}: BomEditorProps) {
  return (
    <Section title="Archivos BOM">
      <div className="mb-3 flex justify-end">
        <button className="btn-secondary" type="button" onClick={onAddFile}>
          + Añadir archivo BOM
        </button>
      </div>

      <div className="grid gap-3">
        {files.map((file, fileIndex) => (
          <article className="sub-card" key={fileIndex}>
            <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                className={`input font-medium ${errors[fileIndex]?.name ? "error-input" : ""}`}
                value={file.name}
                placeholder="Nombre del archivo BOM (Ej: XXX_BOM.xlsx)"
                onChange={(event) => onFileNameChange(fileIndex, event.target.value)}
              />
              <button
                className="btn-danger btn-danger-icon"
                type="button"
                title="Eliminar archivo BOM"
                aria-label="Eliminar archivo BOM"
                onClick={() => onRemoveFile(fileIndex)}
              >
                <span aria-hidden="true">X</span>
              </button>
              {errors[fileIndex]?.name ? <span className="danger-text mt-1 block text-xs md:col-span-2">{errors[fileIndex].name}</span> : null}
            </div>

            <FindingsEditor
              findings={file.findings}
              errors={findingErrors[fileIndex]}
              onAdd={() => onAddFinding(fileIndex)}
              onRemove={(findingIndex) => onRemoveFinding(fileIndex, findingIndex)}
              onChange={(findingIndex, key, value) => onFindingChange(fileIndex, findingIndex, key, value)}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
