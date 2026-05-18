import type { ClipboardEvent, DragEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Finding, FindingImage, FindingSeverity } from "../domain/reviewTypes";
import type { FindingErrors } from "../domain/reviewValidation";

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const maxImageSizeBytes = 2 * 1024 * 1024;

interface FindingsEditorProps {
  findings: Finding[];
  errors?: FindingErrors;
  onAdd?: () => void;
  onRemove: (index: number) => void;
  onChange: <Key extends keyof Finding>(index: number, key: Key, value: Finding[Key]) => void;
}

const SEV_META: Record<FindingSeverity, { pillClass: string; btnClass: string; activeBtnClass: string }> = {
  "!": { pillClass: "rf-sev-fatal",     btnClass: "severity-fatal",     activeBtnClass: "active-fatal"     },
  "+": { pillClass: "rf-sev-important", btnClass: "severity-important", activeBtnClass: "active-important" },
  "A": { pillClass: "rf-sev-recurring", btnClass: "severity-already",   activeBtnClass: "active-already"   },
  "-": { pillClass: "rf-sev-minor",     btnClass: "severity-minor",     activeBtnClass: "active-minor"     },
  "?": { pillClass: "rf-sev-question",  btnClass: "severity-question",  activeBtnClass: "active-question"  },
  "*": { pillClass: "rf-sev-note",      btnClass: "severity-note",      activeBtnClass: "active-note"      },
};

const SEVERITIES: FindingSeverity[] = ["!", "+", "A", "-", "?", "*"];

const SEV_I18N_KEYS: Record<FindingSeverity, string> = {
  "!": "findings.fatal",
  "+": "findings.important",
  "A": "findings.recurring",
  "-": "findings.minor",
  "?": "findings.question",
  "*": "findings.note",
};

export function SevPill({ severity }: { severity: FindingSeverity }) {
  const { t } = useTranslation();
  const m = SEV_META[severity];
  return (
    <span className={`rf-sev-pill ${m.pillClass}`}>
      <span className="rf-sev-dot" />
      {t(SEV_I18N_KEYS[severity])}
    </span>
  );
}

export function FindingsEditor({ findings, errors = [], onAdd, onRemove, onChange }: FindingsEditorProps) {
  const { t } = useTranslation();

  function restoreScrollPosition(scrollHost: Element | null, scrollTop: number) {
    if (!(scrollHost instanceof HTMLElement)) return;
    requestAnimationFrame(() => {
      scrollHost.scrollTop = scrollTop;
    });
  }

  function openImagePicker(finding: Finding, findingIndex: number, trigger: HTMLElement | null) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = allowedImageTypes.join(",");
    input.multiple = true;

    input.addEventListener("change", () => {
      const scrollHost = trigger?.closest(".dash-content") ?? null;
      const scrollTop = scrollHost instanceof HTMLElement ? scrollHost.scrollTop : 0;
      void addImagesFromFiles(finding, findingIndex, Array.from(input.files || []), scrollHost).finally(() => {
        restoreScrollPosition(scrollHost, scrollTop);
        trigger?.blur();
      });
    }, { once: true });

    input.click();
  }

  async function addImagesFromFiles(finding: Finding, findingIndex: number, files: File[], scrollHost?: Element | null) {
    const validFiles = files.filter((file) => allowedImageTypes.includes(file.type) && file.size <= maxImageSizeBytes);
    if (!validFiles.length) return;
    const images = await Promise.all(validFiles.map(readImageFile));
    onChange(findingIndex, "images", [...finding.images, ...images]);
    restoreScrollPosition(scrollHost ?? null, scrollHost instanceof HTMLElement ? scrollHost.scrollTop : 0);
  }

  async function addImagesFromPaste(finding: Finding, findingIndex: number, event: ClipboardEvent<HTMLElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    if (files.length) {
      event.preventDefault();
      const scrollHost = event.currentTarget.closest(".dash-content");
      const scrollTop = scrollHost instanceof HTMLElement ? scrollHost.scrollTop : 0;
      await addImagesFromFiles(finding, findingIndex, files, scrollHost);
      restoreScrollPosition(scrollHost, scrollTop);
    }
  }

  async function addImagesFromDrop(finding: Finding, findingIndex: number, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const scrollHost = event.currentTarget.closest(".dash-content");
    const scrollTop = scrollHost instanceof HTMLElement ? scrollHost.scrollTop : 0;
    await addImagesFromFiles(finding, findingIndex, Array.from(event.dataTransfer.files || []), scrollHost);
    restoreScrollPosition(scrollHost, scrollTop);
  }

  function updateImage(finding: Finding, findingIndex: number, imageId: string, patch: Partial<FindingImage>) {
    onChange(findingIndex, "images", finding.images.map((image) => image.id === imageId ? { ...image, ...patch } : image));
  }

  function removeImage(finding: Finding, findingIndex: number, imageId: string) {
    onChange(findingIndex, "images", finding.images.filter((image) => image.id !== imageId));
  }

  return (
    <div>
      {findings.map((finding, index) => (
        <div
          className="rf-finding-edit-card"
          key={index}
          onPaste={(event) => void addImagesFromPaste(finding, index, event)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void addImagesFromDrop(finding, index, event)}
        >
          <div className="rf-finding-sev-bar">
            {SEVERITIES.map((sev) => {
              const m = SEV_META[sev];
              const active = finding.severity === sev;
              const tKey = sev === "!" ? "fatal" : sev === "+" ? "important" : sev === "A" ? "recurring" : sev === "-" ? "minor" : sev === "?" ? "question" : "note";
              return (
                <button
                  key={sev}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange(index, "severity", sev)}
                  className={`severity-btn ${m.btnClass}${active ? ` ${m.activeBtnClass}` : ""}`}
                >
                  {t(`findings.${tKey}`)}
                </button>
              );
            })}
            <button
              className="rf-icon-btn danger"
              style={{ marginLeft: "auto" }}
              type="button"
              title={t("findings.remove")}
              aria-label={t("findings.remove")}
              onClick={() => onRemove(index)}
            >
              <TrashIcon />
            </button>
          </div>

          <textarea
            className={`rf-finding-textarea${errors[index]?.text ? " error" : ""}`}
            value={finding.text}
            placeholder={t("findings.descriptionPlaceholder")}
            onChange={(event) => onChange(index, "text", event.target.value)}
          />
          {errors[index]?.text && (
            <div className="rf-input-error">{errors[index].text}</div>
          )}

          <div className="rf-drop-zone" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <button
                className="drop-zone-trigger"
                style={{ cursor: "pointer" }}
                type="button"
                onClick={(event) => openImagePicker(finding, index, event.currentTarget)}
              >
                {t("findings.addImage")}
              </button>
              <span className="muted" style={{ fontSize: 11.5, textAlign: "center" }}>{t("findings.imageHint")}</span>
            </div>
            <p className="muted" style={{ marginTop: 4, fontSize: 11.5, margin: 0 }}>{t("findings.imageFormats")}</p>
          </div>

          {finding.images.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {finding.images.map((image) => (
                <div className="sub-card" key={image.id} style={{ padding: 8 }}>
                  <img
                    className="image-frame mb-2 h-32 w-full rounded object-contain"
                    src={image.dataUrl}
                    alt={image.altText || image.name}
                  />
                  <input
                    className="input"
                    style={{ marginBottom: 8 }}
                    value={image.altText}
                    placeholder={t("findings.altTextPlaceholder")}
                    onChange={(event) => updateImage(finding, index, image.id, { altText: event.target.value })}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span className="muted" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {image.name}
                    </span>
                    <button
                      className="rf-icon-btn danger"
                      type="button"
                      title={t("findings.removeImage")}
                      aria-label={t("findings.removeImage")}
                      onClick={() => removeImage(finding, index, image.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {onAdd && (
        <div style={{ padding: "12px 18px" }}>
          <button className="rf-ghost-btn" type="button" onClick={onAdd}>
            <PlusIcon />
            <span>{t("findings.add")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function readImageFile(file: File): Promise<FindingImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: getImageName(file),
        dataUrl: String(reader.result),
        altText: "",
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getImageName(file: File): string {
  if (file.name && !isClipboardImageName(file.name)) return file.name;
  return `capture-${formatTimestamp(new Date())}-${createShortId()}.${getImageExtension(file.type)}`;
}

function isClipboardImageName(name: string): boolean {
  return /^image\.(png|jpe?g|webp)$/i.test(name);
}

function getImageExtension(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "png";
}

function formatTimestamp(date: Date): string {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((p) => String(p).padStart(2, "0")).join("-");
}

function createShortId(): string {
  return crypto.randomUUID().slice(0, 8);
}
