import type { ReactNode } from "react";

interface StatTile {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

interface PageHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  tiles?: StatTile[];
  cta?: ReactNode;
}

export function PageHeader({ kicker, title, subtitle, tiles, cta }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-body">
        <div className="page-header-kicker">{kicker}</div>
        <h1 className="page-header-h1">{title}</h1>
        {subtitle && <p className="page-header-sub">{subtitle}</p>}
      </div>

      {tiles && tiles.length > 0 && (
        <div className="page-header-tiles">
          {tiles.map((tile, i) => (
            <div className="page-stat-tile" key={i}>
              <span className="page-stat-label">{tile.label}</span>
              <span className="page-stat-value" style={tile.color ? { color: tile.color } : undefined}>
                {tile.value}
              </span>
              {tile.sub && (
                <span className="page-stat-sub" style={tile.color ? { color: tile.color } : undefined}>
                  {tile.sub}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {cta && <div style={{ flexShrink: 0 }}>{cta}</div>}
    </div>
  );
}

export function RfSectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="rf-section-title">
      <div className="rf-section-kicker">{kicker}</div>
      <div className="rf-section-name">{title}</div>
      {sub && <div className="rf-section-sub">{sub}</div>}
    </div>
  );
}
