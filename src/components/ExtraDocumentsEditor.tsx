import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "./Field";
import { FindingsEditor } from "./FindingsEditor";
import type { ExtraDocumentFile, Finding } from "../domain/reviewTypes";
import type { NamedFileErrors, SectionFindingErrors } from "../domain/reviewValidation";

interface ExtraDocumentsEditorProps {
  files: ExtraDocumentFile[];
  errors: NamedFileErrors;
  findingErrors: SectionFindingErrors;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
  onFileNameChange: (index: number, name: string) => void;
  onAddFinding: (fileIndex: number) => void;
  onRemoveFinding: (fileIndex: number, findingIndex: number) => void;
  onFindingChange: <Key extends keyof Finding>(fileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) => void;
}

export function ExtraDocumentsEditor({
  files,
  errors,
  findingErrors,
  onAddFile,
  onRemoveFile,
  onFileNameChange,
  onAddFinding,
  onRemoveFinding,
  onFindingChange,
}: ExtraDocumentsEditorProps) {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(files.length);

  useEffect(() => {
    if (files.length > prevLengthRef.current) {
      gridRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevLengthRef.current = files.length;
  }, [files.length]);

  return (
    <Section title={t("extraDocuments.title")}>
      <div className="mb-3 flex justify-end">
        <button className="btn-secondary" type="button" onClick={onAddFile}>
          {t("extraDocuments.addFile")}
        </button>
      </div>

      <div ref={gridRef} className="grid gap-3">
        {files.map((file, fileIndex) => (
          <article className="sub-card" key={fileIndex}>
            <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                className={`input font-medium ${errors[fileIndex]?.name ? "error-input" : ""}`}
                value={file.name}
                placeholder={t("extraDocuments.filePlaceholder")}
                onChange={(event) => onFileNameChange(fileIndex, event.target.value)}
              />
              <button
                className="btn-danger btn-danger-icon"
                type="button"
                title={t("extraDocuments.removeFile")}
                aria-label={t("extraDocuments.removeFile")}
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

      {files.length > 0 && (
        <div className="mt-3 flex justify-end">
          <button className="btn-secondary" type="button" onClick={onAddFile}>
            {t("extraDocuments.addFile")}
          </button>
        </div>
      )}
    </Section>
  );
}
