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
  const fileWord = files.length !== 1 ? t("ui.files") : t("ui.file");
  const findingWord = totalFindings !== 1 ? t("ui.findings") : t("ui.finding");
  const detail = `${files.length} ${fileWord} · ${totalFindings} ${findingWord}`;

  return { name, detail };
}

