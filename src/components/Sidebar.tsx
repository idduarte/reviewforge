import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FileSectionTab, MetaSubTab, Review, TabId } from "../domain/reviewTypes";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  metaSubTab: MetaSubTab;
  onMetaSubTabChange: (sub: MetaSubTab) => void;
  selectedFile: Record<FileSectionTab, number>;
  onSelectFile: (tab: FileSectionTab, index: number) => void;
  review: Review;
  canPrint: boolean;
  onSave: () => void;
  onRestore: (file: File) => void;
  onPrint: () => void;
}

const META_SUB_KEYS: MetaSubTab[] = ["encabezado", "logo", "resumen", "participantes"];

const FILE_SECTIONS: Array<{ tab: TabId; key: keyof Review }> = [
  { tab: "schematics",     key: "schematics" },
  { tab: "bom",            key: "bomFiles" },
  { tab: "layout",         key: "layoutFiles" },
  { tab: "extraDocuments", key: "extraDocumentFiles" },
];

export function Sidebar({ activeTab, onTabChange, metaSubTab, onMetaSubTabChange, selectedFile, onSelectFile, review, canPrint, onSave, onRestore, onPrint }: SidebarProps) {
  const { t, i18n } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  const [open, setOpen] = useState<Record<string, boolean>>({
    meta: true,
    schematics: true,
    bom: false,
    layout: false,
    extraDocuments: false,
  });

  function toggleSection(tab: string) {
    setOpen((prev) => ({ ...prev, [tab]: !prev[tab] }));
  }

  function handleTabClick(tab: TabId) {
    onTabChange(tab);
    setOpen((prev) => ({ ...prev, [tab]: true }));
  }

  function handleMetaSubClick(sub: MetaSubTab) {
    onTabChange("meta");
    onMetaSubTabChange(sub);
  }

  function handleFileTabClick(tab: FileSectionTab) {
    onTabChange(tab);
    onSelectFile(tab, -1);
    setOpen((prev) => ({ ...prev, [tab]: true }));
  }

  function getLangs() {
    return Object.keys(i18n.options.resources ?? {});
  }

  function getNativeName(lang: string): string {
    const bundle = i18n.getResourceBundle(lang, "translation") as Record<string, Record<string, string>> | undefined;
    return bundle?.lang?.nativeName ?? lang.toUpperCase();
  }

  function selectLang(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setLangOpen(false);
  }

  const countFindings = (tab: TabId) => {
    const section = FILE_SECTIONS.find((s) => s.tab === tab);
    if (!section) return 0;
    const files = review[section.key] as Array<{ findings: unknown[] }>;
    return files.reduce((sum, f) => sum + f.findings.length, 0);
  };

  const countFiles = (tab: TabId) => {
    const section = FILE_SECTIONS.find((s) => s.tab === tab);
    if (!section) return 0;
    return (review[section.key] as unknown[]).length;
  };

  const getFileNames = (tab: TabId): string[] => {
    const section = FILE_SECTIONS.find((s) => s.tab === tab);
    if (!section) return [];
    return (review[section.key] as Array<{ name: string }>).map((f) => f.name || "—");
  };

  const tabLabel: Record<string, string> = {
    schematics:     t("tabs.schematics"),
    bom:            t("tabs.bom"),
    layout:         t("tabs.layout"),
    extraDocuments: t("tabs.extraDocuments"),
  };

  return (
    <aside className="dash-sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <LogoIcon size={47} />
        <span className="sb-wordmark">
          Review<strong>Forge</strong>
        </span>
      </div>
      <div className="sb-version-bar">
        <span className="sb-version">v{__APP_VERSION__}</span>
      </div>

      {/* Nav */}
      <nav className="sb-nav" aria-label={t("ui.mainNav")}>

        {/* PROYECTO */}
        <div className="sb-section-label">{t("ui.sectionProject")}</div>

        <div className={`sb-nav-item${activeTab === "meta" ? " sb-nav-item-active" : ""}`} style={{ cursor: "default" }}>
          <button
            className="sb-chevron-btn"
            aria-label={open["meta"] ? t("ui.collapse") : t("ui.expand")}
            onClick={() => toggleSection("meta")}
          >
            <span className={`sb-chevron${open["meta"] ? " sb-chevron-open" : ""}`}>
              <ChevronRightIcon />
            </span>
          </button>
          <button className="sb-nav-label-btn" onClick={() => handleTabClick("meta")}>
            {t("tabs.meta")}
          </button>
        </div>

        {open["meta"] && (
          <div>
            {META_SUB_KEYS.map((key) => {
              const isActive = activeTab === "meta" && metaSubTab === key;
              const label = t(`meta.sub_${key}`);
              return (
                <button
                  key={key}
                  className={`sb-sub-file${isActive ? " sb-sub-file-active" : ""}`}
                  onClick={() => handleMetaSubClick(key)}
                  title={label}
                >
                  <span className={`sb-sub-dot${isActive ? " sb-sub-dot-active" : ""}`} />
                  <span className="sb-sub-file-name">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ARCHIVOS */}
        <div className="sb-section-label">{t("ui.sectionFiles")}</div>

        {FILE_SECTIONS.map(({ tab }) => {
          const isActive = activeTab === tab;
          const isOpen = open[tab];
          const files = getFileNames(tab as FileSectionTab);
          const fileCount = countFiles(tab);
          const activeFileIdx = selectedFile[tab as FileSectionTab];

          return (
            <div key={tab}>
              {/* Nav item row: label navigates, chevron-btn toggles */}
              <div className={`sb-nav-item${isActive ? " sb-nav-item-active" : ""}`} style={{ cursor: "default" }}>
                <button
                  className="sb-chevron-btn"
                  aria-label={isOpen ? t("ui.collapse") : t("ui.expand")}
                  onClick={(e) => { e.stopPropagation(); toggleSection(tab); }}
                >
                  <span className={`sb-chevron${isOpen ? " sb-chevron-open" : ""}`}>
                    <ChevronRightIcon />
                  </span>
                </button>
                <button
                  className="sb-nav-label-btn"
                  onClick={() => handleFileTabClick(tab as FileSectionTab)}
                >
                  {tabLabel[tab]}
                </button>
                {fileCount > 0 && (
                  <span className="sb-badge">{fileCount}</span>
                )}
              </div>

              {isOpen && files.length > 0 && (
                <div>
                  {files.map((name, i) => {
                    const isFileActive = isActive && activeFileIdx === i;
                    return (
                      <button
                        key={i}
                        className={`sb-sub-file${isFileActive ? " sb-sub-file-active" : ""}`}
                        onClick={() => onSelectFile(tab as FileSectionTab, i)}
                        title={name}
                      >
                        <span className={`sb-sub-dot${isFileActive ? " sb-sub-dot-active" : ""}`} />
                        <span className="sb-sub-file-name">{name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="sb-divider" />

        <button
          className={`sb-nav-item${activeTab === "output" ? " sb-nav-item-active" : ""}`}
          onClick={() => onTabChange("output")}
        >
          <span className="sb-dot" />
          <span className="sb-nav-label">{t("tabs.output")}</span>
        </button>
      </nav>

      {/* Bottom bar */}
      <div className="sb-bottom">
        <div className="sb-lang-wrapper" ref={langRef}>
          {langOpen && (
            <div className="sb-lang-dropdown">
              {getLangs().map((lang) => (
                <button
                  key={lang}
                  className={`sb-lang-option${i18n.language === lang ? " active" : ""}`}
                  onClick={() => selectLang(lang)}
                >
                  {getNativeName(lang)}
                </button>
              ))}
            </div>
          )}
          <button className="sb-ghost-btn" onClick={() => setLangOpen((v) => !v)} title={t("ui.changeLang")}>
            <GlobeIcon />
            <span>{i18n.language.toUpperCase()}</span>
          </button>
        </div>

        <button className="sb-ghost-btn" onClick={onSave} title={t("actions.save")}>
          <SaveIcon />
        </button>

        <label className="sb-ghost-btn" title={t("actions.restore")} style={{ cursor: "pointer" }}>
          <RestoreIcon />
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) { onRestore(file); e.target.value = ""; }
            }}
          />
        </label>

        <div style={{ flex: 1 }} />

        <button
          className="sb-pdf-btn"
          disabled={!canPrint}
          onClick={onPrint}
          title={canPrint ? t("actions.exportPdf") : t("actions.exportPdfDisabled")}
        >
          <PdfIcon />
          <span>PDF</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Inline SVG icons ──────────────────────────────────────────────────── */

function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: "block", flexShrink: 0 }}>
      {/* PCB chip package body — left half */}
      <polygon points="32 7 28 7 28 3 14 3 14 9 7 9 7 17 3 17 3 47 7 47 7 55 14 55 14 61 28 61 28 57 32 57 32 7" fill="#cfe1f4" />
      {/* PCB chip package body — right half */}
      <polygon points="32 7 36 7 36 3 50 3 50 9 57 9 57 17 61 17 61 47 57 47 57 55 50 55 50 61 36 61 36 57 32 57 32 7" fill="#a8c4e0" />
      {/* White circuit traces */}
      <path d="M25,13H23V7a1,1,0,0,1,1-1h4V8H25Z" fill="#fff" />
      <path d="M29,57H27V52H23a1,1,0,0,1-1-1V47h2v3h4a1,1,0,0,1,1,1Z" fill="#fff" />
      <path d="M18,56H14V54h3V43a1,1,0,0,1,1-1h6v2H19V55A1,1,0,0,1,18,56Z" fill="#fff" />
      <path d="M12,48H7V46h4V39H9v2H7V38a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v9A1,1,0,0,1,12,48Z" fill="#fff" />
      <path d="M24,24H18a1,1,0,0,1-1-1V18H14a1,1,0,0,1-1-1V9h2v7h3a1,1,0,0,1,1,1v5h5Z" fill="#fff" />
      <path d="M12,28H7a1,1,0,0,1-1-1V17H8v9h4Z" fill="#fff" />
      <path d="M41,13H39V8H36V6h4a1,1,0,0,1,1,1Z" fill="#fff" />
      <path d="M37,57H35V51a1,1,0,0,1,1-1h4V47h2v4a1,1,0,0,1-1,1H37Z" fill="#fff" />
      <path d="M50,56H46a1,1,0,0,1-1-1V44H40V42h6a1,1,0,0,1,1,1V54h3Z" fill="#fff" />
      <path d="M57,48H52a1,1,0,0,1-1-1V38a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v3H55V39H53v7h4Z" fill="#fff" />
      <path d="M46,24H40V22h5V17a1,1,0,0,1,1-1h3V9h2v8a1,1,0,0,1-1,1H47v5A1,1,0,0,1,46,24Z" fill="#fff" />
      <path d="M57,28H52V26h4V17h2V27A1,1,0,0,1,57,28Z" fill="#fff" />
      {/* Chip outline — dark */}
      <path d="M61,16H58V9a1,1,0,0,0-1-1H51V3a1,1,0,0,0-1-1H36a1,1,0,0,0-1,1V6H29V3a1,1,0,0,0-1-1H14a1,1,0,0,0-1,1V8H7A1,1,0,0,0,6,9v7H3a1,1,0,0,0-1,1V47a1,1,0,0,0,1,1H6v7a1,1,0,0,0,1,1h6v5a1,1,0,0,0,1,1H28a1,1,0,0,0,1-1V58h6v3a1,1,0,0,0,1,1H50a1,1,0,0,0,1-1V56h6a1,1,0,0,0,1-1V48h3a1,1,0,0,0,1-1V17A1,1,0,0,0,61,16ZM60,46H53V39h2v2h2V38a1,1,0,0,0-1-1H52a1,1,0,0,0-1,1v9a1,1,0,0,0,1,1h4v6H47V43a1,1,0,0,0-1-1H40v2h5V55a1,1,0,0,0,1,1h3v4H37V52h4a1,1,0,0,0,1-1V47H40v3H36a1,1,0,0,0-1,1v5H33V40.212H31V56H29V51a1,1,0,0,0-1-1H24V47H22v4a1,1,0,0,0,1,1h4v8H15V56h3a1,1,0,0,0,1-1V44h5V42H18a1,1,0,0,0-1,1V54H8V48h4a1,1,0,0,0,1-1V38a1,1,0,0,0-1-1H8a1,1,0,0,0-1,1v3H9V39h2v7H4V18H6v9a1,1,0,0,0,1,1h5V26H8V10h5v7a1,1,0,0,0,1,1h3v5a1,1,0,0,0,1,1h6V22H19V17a1,1,0,0,0-1-1H15V4H27V6H24a1,1,0,0,0-1,1v6h2V8h6V24h2V8h6v5h2V7a1,1,0,0,0-1-1H37V4H49V16H46a1,1,0,0,0-1,1v5H40v2h6a1,1,0,0,0,1-1V18h3a1,1,0,0,0,1-1V10h5V26H52v2h5a1,1,0,0,0,1-1V18h2Z" fill="#0f172a" />
      {/* Center gear — RF primary blue */}
      <path d="M38.8,33.848l2-.711V30.863l-2-.711L38.119,28.5l.912-1.921-1.607-1.607-1.921.912L33.848,25.2l-.711-2H30.863l-.711,2-1.655.686-1.921-.912-1.607,1.607.912,1.921L25.2,30.152l-2,.711v2.274l2,.711.686,1.655-.912,1.921,1.607,1.607,1.921-.912,1.655.685.711,2h2.274l.711-2,1.655-.685,1.921.912,1.607-1.607L38.119,35.5ZM32,35a3,3,0,1,1,3-3A3,3,0,0,1,32,35Z" fill="#1a5fa8" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M8 4v5h7V4M8 21v-7h9v7" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 14.5h1a1 1 0 1 0 0-2h-1v4M13 12.5v4M13 12.5h1.5M13 14.5h1M16.5 12.5h2" />
    </svg>
  );
}
