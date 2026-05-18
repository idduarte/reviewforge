import { useTranslation } from "react-i18next";
import { PageHeader } from "./PageHeader";
import { FileListView } from "./FileListView";
import { FindingsEditor } from "./FindingsEditor";
import type { Finding, SchematicFile } from "../domain/reviewTypes";
import type { NamedFileErrors, SectionFindingErrors } from "../domain/reviewValidation";

interface SchematicsEditorProps {
  schematics: SchematicFile[];
  selectedIndex: number;
  errors: NamedFileErrors;
  findingErrors: SectionFindingErrors;
  onAddSchematic: () => void;
  onRemoveSchematic: (index: number) => void;
  onSchematicNameChange: (index: number, name: string) => void;
  onAddSchematicFinding: (schematicIndex: number) => void;
  onRemoveSchematicFinding: (schematicIndex: number, findingIndex: number) => void;
  onSchematicFindingChange: <Key extends keyof Finding>(schematicIndex: number, findingIndex: number, key: Key, value: Finding[Key]) => void;
  onSelectFile: (index: number) => void;
}

export function SchematicsEditor({
  schematics, selectedIndex, errors, findingErrors,
  onAddSchematic, onRemoveSchematic, onSchematicNameChange,
  onAddSchematicFinding, onRemoveSchematicFinding, onSchematicFindingChange, onSelectFile,
}: SchematicsEditorProps) {
  const { t } = useTranslation();
  const totalFindings = schematics.reduce((n, s) => n + s.findings.length, 0);
  const fatalCount = schematics.reduce((n, s) => n + s.findings.filter((f) => f.severity === "!").length, 0);
  const file = schematics[selectedIndex] ?? null;

  return (
    <>
      <PageHeader
        kicker={t("ui.sectionFiles")}
        title={t("schematics.title")}
        subtitle={t("schematics.subtitle")}
        tiles={[
          { label: t("ui.sectionFiles"), value: String(schematics.length), sub: ".sch" },
          { label: t("ui.findings"), value: String(totalFindings), sub: t("ui.total") },
          ...(fatalCount > 0 ? [{ label: t("findings.fatal"), value: String(fatalCount), sub: t("findings.fatal").toLowerCase(), color: "#8f2f2a" }] : []),
        ]}
        cta={<button className="rf-primary-btn" type="button" onClick={onAddSchematic}><PlusIcon /><span>{t("schematics.addFile")}</span></button>}
      />

      {selectedIndex === -1 && (
        <FileListView
          files={schematics}
          onSelect={onSelectFile}
          onAdd={onAddSchematic}
          addLabel={t("schematics.addFile")}
          formatHint="KiCad · Altium · EAGLE"
        />
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
                placeholder={t("schematics.filePlaceholder")}
                onChange={(e) => onSchematicNameChange(selectedIndex, e.target.value)}
              />
              {errors[selectedIndex]?.name && <div className="rf-input-error" style={{ paddingLeft: 8 }}>{errors[selectedIndex].name}</div>}
            </div>
            <span className="rf-findings-pill">{file.findings.length} {file.findings.length === 1 ? t("ui.finding") : t("ui.findings")}</span>
            <button className="rf-ghost-btn sm" type="button" onClick={() => onAddSchematicFinding(selectedIndex)}>
              <PlusIcon size={12} /><span>{t("schematics.addFinding")}</span>
            </button>
            <button className="rf-icon-btn danger" type="button" title={t("schematics.removeFile")} onClick={() => onRemoveSchematic(selectedIndex)}>
              <TrashIcon />
            </button>
          </div>
          <FindingsEditor
            findings={file.findings}
            errors={findingErrors[selectedIndex]}
            onRemove={(fi) => onRemoveSchematicFinding(selectedIndex, fi)}
            onChange={(fi, key, value) => onSchematicFindingChange(selectedIndex, fi, key, value)}
          />
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
