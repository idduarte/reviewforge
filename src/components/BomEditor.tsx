import { useTranslation } from "react-i18next";
import { PageHeader } from "./PageHeader";
import { FileListView } from "./FileListView";
import { FindingsEditor } from "./FindingsEditor";
import type { BomFile, Finding } from "../domain/reviewTypes";
import type { NamedFileErrors, SectionFindingErrors } from "../domain/reviewValidation";

interface BomEditorProps {
  files: BomFile[];
  selectedIndex: number;
  errors: NamedFileErrors;
  findingErrors: SectionFindingErrors;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
  onFileNameChange: (index: number, name: string) => void;
  onAddFinding: (fileIndex: number) => void;
  onRemoveFinding: (fileIndex: number, findingIndex: number) => void;
  onFindingChange: <Key extends keyof Finding>(fileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) => void;
  onSelectFile: (index: number) => void;
}

export function BomEditor({
  files, selectedIndex, errors, findingErrors,
  onAddFile, onRemoveFile, onFileNameChange,
  onAddFinding, onRemoveFinding, onFindingChange, onSelectFile,
}: BomEditorProps) {
  const { t } = useTranslation();
  const totalFindings = files.reduce((n, f) => n + f.findings.length, 0);
  const file = files[selectedIndex] ?? null;

  return (
    <>
      <PageHeader
        kicker={t("ui.sectionFiles")}
        title={t("bom.title")}
        subtitle={t("bom.subtitle")}
        tiles={[
          { label: t("ui.sectionFiles"), value: String(files.length), sub: ".csv / .xlsx" },
          { label: t("ui.findings"), value: String(totalFindings), sub: t("ui.total") },
        ]}
        cta={<button className="rf-primary-btn" type="button" onClick={onAddFile}><PlusIcon /><span>{t("bom.addFile")}</span></button>}
      />

      {selectedIndex === -1 && (
        <FileListView files={files} onSelect={onSelectFile} onAdd={onAddFile} addLabel={t("bom.addFile")} formatHint=".csv · .xlsx · .xls" />
      )}

      {selectedIndex >= 0 && file && (
        <section className="rf-file-card">
          <div className="rf-file-card-header">
            <div className="rf-file-icon"><DocIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                className={`rf-cell-input mono${errors[selectedIndex]?.name ? " error" : ""}`}
                style={{ fontWeight: 600, fontSize: 13.5 }}
                value={file.name}
                placeholder={t("bom.filePlaceholder")}
                onChange={(e) => onFileNameChange(selectedIndex, e.target.value)}
              />
              {errors[selectedIndex]?.name && <div className="rf-input-error" style={{ paddingLeft: 8 }}>{errors[selectedIndex].name}</div>}
            </div>
            <span className="rf-findings-pill">{file.findings.length} {file.findings.length === 1 ? t("ui.finding") : t("ui.findings")}</span>
            <button className="rf-ghost-btn sm" type="button" onClick={() => onAddFinding(selectedIndex)}><PlusIcon size={12} /><span>{t("bom.addFinding")}</span></button>
            <button className="rf-icon-btn danger" type="button" title={t("bom.removeFile")} onClick={() => onRemoveFile(selectedIndex)}><TrashIcon /></button>
          </div>
          <FindingsEditor findings={file.findings} errors={findingErrors[selectedIndex]} onRemove={(fi) => onRemoveFinding(selectedIndex, fi)} onChange={(fi, key, value) => onFindingChange(selectedIndex, fi, key, value)} />
        </section>
      )}
    </>
  );
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
}
function DocIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
