import type { TabId } from "../domain/reviewTypes";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "meta", label: "Encabezado" },
  { id: "schematics", label: "Esquemáticos" },
  { id: "bom", label: "BOM" },
  { id: "layout", label: "Layout" },
  { id: "extraDocuments", label: "Documentos extra" },
  { id: "output", label: "Resumen" },
];

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <nav className="tabs-nav" aria-label="Secciones del formulario">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={
            activeTab === tab.id
              ? "tab-button tab-button-active"
              : "tab-button"
          }
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
