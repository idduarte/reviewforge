import type { ChangeEvent, ClipboardEvent, DragEvent } from "react";
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

export function FindingsEditor({ findings, errors = [], onAdd, onRemove, onChange }: FindingsEditorProps) {
  const { t } = useTranslation();

  const severities: Array<{ value: FindingSeverity; label: string; baseClassName: string; activeClassName: string }> = [
    { value: "!", label: t("findings.fatal"), baseClassName: "severity-fatal", activeClassName: "active-fatal" },
    { value: "+", label: t("findings.important"), baseClassName: "severity-important", activeClassName: "active-important" },
    { value: "-", label: t("findings.minor"), baseClassName: "severity-minor", activeClassName: "active-minor" },
    { value: "?", label: t("findings.question"), baseClassName: "severity-question", activeClassName: "active-question" },
    { value: "*", label: t("findings.note"), baseClassName: "severity-note", activeClassName: "active-note" },
    { value: "A", label: t("findings.recurring"), baseClassName: "severity-already", activeClassName: "active-already" },
  ];

  async function addImagesFromFiles(finding: Finding, findingIndex: number, files: File[]) {
    const validFiles = files.filter((file) => allowedImageTypes.includes(file.type) && file.size <= maxImageSizeBytes);

    if (!validFiles.length) return;

    const images = await Promise.all(validFiles.map(readImageFile));
    onChange(findingIndex, "images", [...finding.images, ...images]);
  }

  async function addImagesFromInput(finding: Finding, findingIndex: number, event: ChangeEvent<HTMLInputElement>) {
    await addImagesFromFiles(finding, findingIndex, Array.from(event.target.files || []));
    event.target.value = "";
  }

  async function addImagesFromPaste(finding: Finding, findingIndex: number, event: ClipboardEvent<HTMLElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file));

    if (files.length) {
      event.preventDefault();
      await addImagesFromFiles(finding, findingIndex, files);
    }
  }

  async function addImagesFromDrop(finding: Finding, findingIndex: number, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    await addImagesFromFiles(finding, findingIndex, Array.from(event.dataTransfer.files || []));
  }

  function updateImage(finding: Finding, findingIndex: number, imageId: string, patch: Partial<FindingImage>) {
    onChange(
      findingIndex,
      "images",
      finding.images.map((image) => image.id === imageId ? { ...image, ...patch } : image),
    );
  }

  function removeImage(finding: Finding, findingIndex: number, imageId: string) {
    onChange(
      findingIndex,
      "images",
      finding.images.filter((image) => image.id !== imageId),
    );
  }

  return (
    <div>
      <div className="grid gap-2">
        {findings.map((finding, index) => (
          <article
            className="nested-card"
            key={index}
            onPaste={(event) => void addImagesFromPaste(finding, index, event)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => void addImagesFromDrop(finding, index, event)}
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {severities.map((severity) => (
                <button
                  key={severity.value}
                  type="button"
                  aria-pressed={finding.severity === severity.value}
                  onClick={() => onChange(index, "severity", severity.value)}
                  className={`severity-btn ${severity.baseClassName} ${finding.severity === severity.value ? severity.activeClassName : ""}`}
                >
                  {severity.label}
                </button>
              ))}
              <button
                className="btn-danger btn-danger-icon ml-auto"
                type="button"
                title={t("findings.remove")}
                aria-label={t("findings.remove")}
                onClick={() => onRemove(index)}
              >
                <span aria-hidden="true">X</span>
              </button>
            </div>

            <textarea
              className={`input min-h-20 resize-y leading-6 ${errors[index]?.text ? "error-input" : ""}`}
              value={finding.text}
              placeholder={t("findings.descriptionPlaceholder")}
              onChange={(event) => onChange(index, "text", event.target.value)}
            />
            {errors[index]?.text ? <span className="danger-text mt-1 block text-xs">{errors[index].text}</span> : null}

            <div className="drop-zone">
              <div className="drop-zone-content">
                <label className="drop-zone-trigger cursor-pointer">
                  {t("findings.addImage")}
                  <input
                    className="sr-only"
                    type="file"
                    accept={allowedImageTypes.join(",")}
                    multiple
                    onChange={(event) => void addImagesFromInput(finding, index, event)}
                  />
                </label>
                <span className="muted max-w-2xl text-xs">{t("findings.imageHint")}</span>
              </div>
              <p className="muted mt-1 text-xs">{t("findings.imageFormats")}</p>
            </div>

            {finding.images.length ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {finding.images.map((image) => (
                  <div className="sub-card p-2" key={image.id}>
                    <img className="image-frame mb-2 h-32 w-full rounded object-contain" src={image.dataUrl} alt={image.altText || image.name} />
                    <input
                      className="input mb-2"
                      value={image.altText}
                      placeholder={t("findings.altTextPlaceholder")}
                      onChange={(event) => updateImage(finding, index, image.id, { altText: event.target.value })}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="muted truncate text-xs">{image.name}</span>
                      <button
                        className="btn-danger btn-danger-icon"
                        type="button"
                        title={t("findings.removeImage")}
                        aria-label={t("findings.removeImage")}
                        onClick={() => removeImage(finding, index, image.id)}
                      >
                        <span aria-hidden="true">X</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {onAdd ? (
        <button className="btn-secondary mt-2" type="button" onClick={onAdd}>
          {t("findings.add")}
        </button>
      ) : null}
    </div>
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
  if (file.name && !isClipboardImageName(file.name)) {
    return file.name;
  }

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
  const parts = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];

  return parts.map((part) => String(part).padStart(2, "0")).join("-");
}

function createShortId(): string {
  return crypto.randomUUID().slice(0, 8);
}
