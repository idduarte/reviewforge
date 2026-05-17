import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function FileListView({
  files,
  onSelect,
  onAdd,
  addLabel,
  dropHint,
  formatHint,
}: {
  files: Array<{ name: string; findings: unknown[] }>;
  onSelect: (index: number) => void;
  onAdd: () => void;
  addLabel: string;
  dropHint?: ReactNode;
  formatHint?: string;
}) {
  const { t } = useTranslation();
  if (files.length === 0) {
    return (
      <div className="rf-file-drop-zone" onClick={onAdd} style={{ cursor: "pointer" }}>
        <div className="rf-file-drop-icon"><PlusIcon /></div>
        {dropHint ?? <span>{addLabel}</span>}
        {formatHint && (
          <span style={{ color: "#94a3b8", fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{formatHint}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {files.map((file, i) => (
          <FileRow key={i} file={file} index={i} onSelect={onSelect} findingLabel={t("ui.finding")} findingsLabel={t("ui.findings")} />
        ))}
      </div>

      <div className="rf-file-drop-zone" onClick={onAdd} style={{ cursor: "pointer", padding: "16px 18px" }}>
        <div className="rf-file-drop-icon"><PlusIcon /></div>
        <span>{addLabel}</span>
      </div>
    </div>
  );
}

function FileRow({
  file,
  index,
  onSelect,
  findingLabel,
  findingsLabel,
}: {
  file: { name: string; findings: unknown[] };
  index: number;
  onSelect: (i: number) => void;
  findingLabel: string;
  findingsLabel: string;
}) {
  return (
    <button
      onClick={() => onSelect(index)}
      className="rf-file-list-row"
    >
      <div className="rf-file-icon"><DocIcon /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="rf-file-name">
          {file.name || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
        </div>
        <div className="rf-file-meta">
          <span>{file.findings.length} {file.findings.length === 1 ? findingLabel : findingsLabel}</span>
        </div>
      </div>
      <ChevronIcon />
    </button>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}
function DocIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>;
}
