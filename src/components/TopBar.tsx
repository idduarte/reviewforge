import { useTranslation } from "react-i18next";
import type { MetaSubTab, Review, TabId } from "../domain/reviewTypes";

interface TopBarProps {
  activeTab: TabId;
  metaSubTab?: MetaSubTab;
  review: Review;
}

const META_SUB_LABEL_KEYS: Record<MetaSubTab, string> = {
  encabezado:    "meta.sub_encabezado",
  logo:          "meta.sub_logo",
  resumen:       "meta.sub_resumen",
  participantes: "meta.sub_participantes",
};

const SECTION_ORDER: TabId[] = ["meta", "schematics", "bom", "layout", "extraDocuments", "output"];

const SECTION_INDEX: Record<TabId, number> = {
  meta:           1,
  schematics:     2,
  bom:            3,
  layout:         4,
  extraDocuments: 5,
  output:         6,
};

export function TopBar({ activeTab, metaSubTab, review }: TopBarProps) {
  const { t } = useTranslation();

  const sectionLabel = t(`tabs.${activeTab}`);
  const isFilesSection = ["schematics", "bom", "layout", "extraDocuments"].includes(activeTab);
  const isMetaSection = activeTab === "meta";

  const contextInfo = getContextInfo(activeTab, review, t);

  return (
    <header className="dash-topbar">
      {/* Breadcrumb */}
      <div className="tb-breadcrumb">
        {isFilesSection ? (
          <>
            <span>{t("ui.breadcrumbFiles")}</span>
            <span className="tb-breadcrumb-sep">/</span>
            <span className="tb-breadcrumb-active">{sectionLabel}</span>
          </>
        ) : isMetaSection && metaSubTab ? (
          <>
            <span>{sectionLabel}</span>
            <span className="tb-breadcrumb-sep">/</span>
            <span className="tb-breadcrumb-active">{t(META_SUB_LABEL_KEYS[metaSubTab])}</span>
          </>
        ) : (
          <span className="tb-breadcrumb-active">{sectionLabel}</span>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search placeholder */}
      <div className="tb-search" role="search" aria-label="Buscar hallazgo">
        <SearchIcon />
        <span style={{ flex: 1, color: "#9ca3af" }}>{t("ui.searchPlaceholder")}</span>
        <span className="tb-search-kbd">⌘K</span>
      </div>

      {/* Context */}
      {contextInfo && (
        <div className="tb-context">
          <span className="tb-context-name">{contextInfo.name}</span>
          <span className="tb-sep">·</span>
          <span>{contextInfo.detail}</span>
        </div>
      )}
    </header>
  );
}

function getContextInfo(
  tab: TabId,
  review: Review,
  t: (k: string) => string,
): { name: string; detail: string } | null {
  if (tab === "meta") {
    const title = review.metadata.reviewTitle;
    return title ? { name: title, detail: `Rev. ${review.metadata.revision || "0"}` } : null;
  }

  const fileSections: Record<string, Array<{ name: string; findings: unknown[] }>> = {
    schematics:     review.schematics,
    bom:            review.bomFiles,
    layout:         review.layoutFiles,
    extraDocuments: review.extraDocumentFiles,
  };

  const files = fileSections[tab];
  if (!files) return null;

  const totalFindings = files.reduce((sum, f) => sum + f.findings.length, 0);
  if (!files.length) return null;

  const name = files[0].name || "—";
  const detail = `${files.length} archivo${files.length !== 1 ? "s" : ""} · ${totalFindings} hallazgo${totalFindings !== 1 ? "s" : ""}`;

  return { name, detail };
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
