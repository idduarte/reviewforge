import { useTranslation } from "react-i18next";
import type { TabId } from "../domain/reviewTypes";

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  const { t } = useTranslation();

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "meta", label: t("tabs.meta") },
    { id: "schematics", label: t("tabs.schematics") },
    { id: "bom", label: t("tabs.bom") },
    { id: "layout", label: t("tabs.layout") },
    { id: "extraDocuments", label: t("tabs.extraDocuments") },
    { id: "output", label: t("tabs.output") },
  ];

  return (
    <nav className="tabs-nav" aria-label={t("tabs.ariaLabel")}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={activeTab === tab.id ? "tab-button tab-button-active" : "tab-button"}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
