import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BomEditor } from "./components/BomEditor";
import { ExtraDocumentsEditor } from "./components/ExtraDocumentsEditor";
import { LayoutEditor } from "./components/LayoutEditor";
import { OutputPreview } from "./components/OutputPreview";
import { ParticipantsEditor } from "./components/ParticipantsEditor";
import { ProjectActions } from "./components/ProjectActions";
import { ReviewMetadataForm } from "./components/ReviewMetadataForm";
import { SchematicsEditor } from "./components/SchematicsEditor";
import { Tabs } from "./components/Tabs";
import { createBomFile, createExtraDocumentFile, createFinding, createLayoutFile, createParticipant, createReview, createSchematic } from "./domain/reviewDefaults";
import { buildSaveFileName, createSavedReview, parseSavedReview } from "./domain/reviewPersistence";
import type { Finding, Participant, ReviewMetadata, TabId } from "./domain/reviewTypes";
import { validateReview } from "./domain/reviewValidation";

export default function App() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("meta");
  const [review, setReview] = useState(createReview);
  const [projectStatus, setProjectStatus] = useState("");
  const validation = useMemo(() => validateReview(review), [review, i18nInstance.language]);

  function showProjectStatus(message: string) {
    setProjectStatus(message);
    window.setTimeout(() => setProjectStatus(""), 3000);
  }

  function saveProgress() {
    const payload = JSON.stringify(createSavedReview(review), null, 2);
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = buildSaveFileName(review.metadata.reviewTitle);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showProjectStatus(t("status.saved"));
  }

  function restoreProgress(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        setReview(parseSavedReview(String(reader.result)));
        showProjectStatus(t("status.restored"));
      } catch {
        showProjectStatus(t("status.restoreError"));
      }
    };
    reader.onerror = () => showProjectStatus(t("status.readError"));
    reader.readAsText(file);
  }

  function updateMetadata<Key extends keyof ReviewMetadata>(key: Key, value: ReviewMetadata[Key]) {
    setReview((current) => ({
      ...current,
      metadata: { ...current.metadata, [key]: value },
    }));
  }

  function updateCompanyLogo(file: File | null) {
    if (!file) {
      updateMetadata("companyLogoDataUrl", "");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateMetadata("companyLogoDataUrl", String(reader.result ?? ""));
    };
    reader.onerror = () => showProjectStatus(t("status.logoError"));
    reader.readAsDataURL(file);
  }

  function updateParticipant<Key extends keyof Participant>(index: number, key: Key, value: Participant[Key]) {
    setReview((current) => ({
      ...current,
      participants: current.participants.map((participant, participantIndex) =>
        participantIndex === index ? { ...participant, [key]: value } : participant,
      ),
    }));
  }

  function updateBomFinding<Key extends keyof Finding>(bomFileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) {
    setReview((current) => ({
      ...current,
      bomFiles: current.bomFiles.map((bomFile, currentBomFileIndex) =>
        currentBomFileIndex === bomFileIndex
          ? {
              ...bomFile,
              findings: bomFile.findings.map((finding, currentFindingIndex) =>
                currentFindingIndex === findingIndex ? { ...finding, [key]: value } : finding,
              ),
            }
          : bomFile,
      ),
    }));
  }

  function updateLayoutFinding<Key extends keyof Finding>(layoutFileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) {
    setReview((current) => ({
      ...current,
      layoutFiles: current.layoutFiles.map((layoutFile, currentLayoutFileIndex) =>
        currentLayoutFileIndex === layoutFileIndex
          ? {
              ...layoutFile,
              findings: layoutFile.findings.map((finding, currentFindingIndex) =>
                currentFindingIndex === findingIndex ? { ...finding, [key]: value } : finding,
              ),
            }
          : layoutFile,
      ),
    }));
  }

  function updateExtraDocumentFinding<Key extends keyof Finding>(documentFileIndex: number, findingIndex: number, key: Key, value: Finding[Key]) {
    setReview((current) => ({
      ...current,
      extraDocumentFiles: current.extraDocumentFiles.map((documentFile, currentDocumentFileIndex) =>
        currentDocumentFileIndex === documentFileIndex
          ? {
              ...documentFile,
              findings: documentFile.findings.map((finding, currentFindingIndex) =>
                currentFindingIndex === findingIndex ? { ...finding, [key]: value } : finding,
              ),
            }
          : documentFile,
      ),
    }));
  }

  function updateSchematicFinding<Key extends keyof Finding>(schematicIndex: number, findingIndex: number, key: Key, value: Finding[Key]) {
    setReview((current) => ({
      ...current,
      schematics: current.schematics.map((schematic, currentSchematicIndex) =>
        currentSchematicIndex === schematicIndex
          ? {
              ...schematic,
              findings: schematic.findings.map((finding, currentFindingIndex) =>
                currentFindingIndex === findingIndex ? { ...finding, [key]: value } : finding,
              ),
            }
          : schematic,
      ),
    }));
  }

  return (
    <main className="app-shell">
      <div className="app-sticky-shell app-sticky-shell-visible">
        <div className="app-sticky-nav">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          <div className="app-nav-actions">
            <LanguageSwitcher />
            <ProjectActions
              status={projectStatus}
              review={review}
              canPrint={validation.isValid}
              onSave={saveProgress}
              onRestore={restoreProgress}
            />
          </div>
        </div>
      </div>
      <div className="app-container">
        <header className="app-header">
          <div className="app-brand">
            <div className="app-brand-mark">
              <img className="app-brand-icon" src="./favicon.svg" alt="" aria-hidden="true" />
              <h1 className="app-title">
                Review<span>Forge</span>
              </h1>
            </div>
          </div>

          <div className="app-header-bar mb-5">
            <div className="app-header-copy">
              <p className="app-kicker">{t("app.tagline")}</p>
              <p className="app-subtitle app-header-summary" dangerouslySetInnerHTML={{ __html: sanitizeInlineSummaryHtml(t("app.summary")) }} />
            </div>
          </div>
        </header>

        {activeTab === "meta" && (
        <>
          <ReviewMetadataForm metadata={review.metadata} errors={validation.metadata} onChange={updateMetadata} onLogoChange={updateCompanyLogo} />
          <ParticipantsEditor
            participants={review.participants}
            errors={validation.participants}
            listError={validation.participantList}
            onAdd={() => setReview((current) => ({ ...current, participants: [...current.participants, createParticipant()] }))}
            onRemove={(index) => setReview((current) => ({ ...current, participants: current.participants.filter((_, currentIndex) => currentIndex !== index) }))}
            onChange={updateParticipant}
          />
        </>
        )}

        {activeTab === "schematics" && (
        <SchematicsEditor
          schematics={review.schematics}
          errors={validation.schematics}
          findingErrors={validation.schematicFindings}
          onAddSchematic={() => setReview((current) => ({ ...current, schematics: [...current.schematics, createSchematic()] }))}
          onRemoveSchematic={(index) => setReview((current) => ({ ...current, schematics: current.schematics.filter((_, currentIndex) => currentIndex !== index) }))}
          onSchematicNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((schematic, currentIndex) => currentIndex === index ? { ...schematic, name } : schematic),
            }))
          }
          onAddSchematicFinding={(schematicIndex) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((schematic, currentIndex) =>
                currentIndex === schematicIndex ? { ...schematic, findings: [...schematic.findings, createFinding()] } : schematic,
              ),
            }))
          }
          onRemoveSchematicFinding={(schematicIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((schematic, currentIndex) =>
                currentIndex === schematicIndex
                  ? { ...schematic, findings: schematic.findings.filter((_, currentFindingIndex) => currentFindingIndex !== findingIndex) }
                  : schematic,
              ),
            }))
          }
          onSchematicFindingChange={updateSchematicFinding}
        />
        )}

        {activeTab === "bom" && (
        <BomEditor
          files={review.bomFiles}
          errors={validation.bomFiles}
          findingErrors={validation.bomFindings}
          onAddFile={() => setReview((current) => ({ ...current, bomFiles: [...current.bomFiles, createBomFile()] }))}
          onRemoveFile={(index) => setReview((current) => ({ ...current, bomFiles: current.bomFiles.filter((_, currentIndex) => currentIndex !== index) }))}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((bomFile, currentIndex) => currentIndex === index ? { ...bomFile, name } : bomFile),
            }))
          }
          onAddFinding={(bomFileIndex) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((bomFile, currentIndex) =>
                currentIndex === bomFileIndex ? { ...bomFile, findings: [...bomFile.findings, createFinding()] } : bomFile,
              ),
            }))
          }
          onRemoveFinding={(bomFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((bomFile, currentIndex) =>
                currentIndex === bomFileIndex
                  ? { ...bomFile, findings: bomFile.findings.filter((_, currentFindingIndex) => currentFindingIndex !== findingIndex) }
                  : bomFile,
              ),
            }))
          }
          onFindingChange={updateBomFinding}
        />
        )}

        {activeTab === "layout" && (
        <LayoutEditor
          files={review.layoutFiles}
          errors={validation.layoutFiles}
          findingErrors={validation.layoutFindings}
          onAddFile={() => setReview((current) => ({ ...current, layoutFiles: [...current.layoutFiles, createLayoutFile()] }))}
          onRemoveFile={(index) => setReview((current) => ({ ...current, layoutFiles: current.layoutFiles.filter((_, currentIndex) => currentIndex !== index) }))}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((layoutFile, currentIndex) => currentIndex === index ? { ...layoutFile, name } : layoutFile),
            }))
          }
          onAddFinding={(layoutFileIndex) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((layoutFile, currentIndex) =>
                currentIndex === layoutFileIndex ? { ...layoutFile, findings: [...layoutFile.findings, createFinding()] } : layoutFile,
              ),
            }))
          }
          onRemoveFinding={(layoutFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((layoutFile, currentIndex) =>
                currentIndex === layoutFileIndex
                  ? { ...layoutFile, findings: layoutFile.findings.filter((_, currentFindingIndex) => currentFindingIndex !== findingIndex) }
                  : layoutFile,
              ),
            }))
          }
          onFindingChange={updateLayoutFinding}
        />
        )}

        {activeTab === "extraDocuments" && (
        <ExtraDocumentsEditor
          files={review.extraDocumentFiles}
          errors={validation.extraDocumentFiles}
          findingErrors={validation.extraDocumentFindings}
          onAddFile={() => setReview((current) => ({ ...current, extraDocumentFiles: [...current.extraDocumentFiles, createExtraDocumentFile()] }))}
          onRemoveFile={(index) => setReview((current) => ({ ...current, extraDocumentFiles: current.extraDocumentFiles.filter((_, currentIndex) => currentIndex !== index) }))}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((documentFile, currentIndex) => currentIndex === index ? { ...documentFile, name } : documentFile),
            }))
          }
          onAddFinding={(documentFileIndex) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((documentFile, currentIndex) =>
                currentIndex === documentFileIndex ? { ...documentFile, findings: [...documentFile.findings, createFinding()] } : documentFile,
              ),
            }))
          }
          onRemoveFinding={(documentFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((documentFile, currentIndex) =>
                currentIndex === documentFileIndex
                  ? { ...documentFile, findings: documentFile.findings.filter((_, currentFindingIndex) => currentFindingIndex !== findingIndex) }
                  : documentFile,
              ),
            }))
          }
          onFindingChange={updateExtraDocumentFinding}
        />
        )}

        {activeTab === "output" && <OutputPreview review={review} validation={validation} />}
      </div>
    </main>
  );
}

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const langs = Object.keys(i18n.options.resources ?? {});

  function getNativeName(code: string): string {
    const bundle = i18n.getResourceBundle(code, "translation") as
      | { lang?: { nativeName?: string } }
      | undefined;
    return bundle?.lang?.nativeName ?? code.toUpperCase();
  }

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  function selectLang(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="lang-switcher">
      <button
        className="lang-switcher-btn"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
      >
        <GlobeIcon />
        <span>{getNativeName(i18n.language)}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <ul className="lang-dropdown" role="listbox" aria-label="Select language">
          {langs.map((code) => (
            <li
              key={code}
              role="option"
              aria-selected={code === i18n.language ? "true" : "false"}
              className={`lang-dropdown-item${code === i18n.language ? " active" : ""}`}
              onClick={() => selectLang(code)}
            >
              {getNativeName(code)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="8" cy="8" rx="2.6" ry="6.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="2.2" y1="5" x2="13.8" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="2.2" y1="11" x2="13.8" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="lang-chevron"
      data-open={open ? "true" : "false"}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function sanitizeInlineSummaryHtml(input: string) {
  const allowedTags = new Set(["strong", "b", "em", "i", "u", "br", "a"]);
  const template = document.createElement("template");

  template.innerHTML = input.trim();

  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (!allowedTags.has(tagName)) {
        const text = document.createTextNode(element.textContent ?? "");
        element.replaceWith(text);
        return;
      }

      if (tagName === "a") {
        const href = element.getAttribute("href")?.trim() ?? "";
        const isSafeHref = /^(https?:|mailto:)/i.test(href);

        for (const attribute of Array.from(element.attributes)) {
          element.removeAttribute(attribute.name);
        }

        if (!isSafeHref) {
          const text = document.createTextNode(element.textContent ?? "");
          element.replaceWith(text);
          return;
        }

        element.setAttribute("href", href);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noreferrer noopener");
      } else {
        for (const attribute of Array.from(element.attributes)) {
          element.removeAttribute(attribute.name);
        }
      }
    }

    for (const child of Array.from(node.childNodes)) {
      sanitizeNode(child);
    }
  };

  for (const child of Array.from(template.content.childNodes)) {
    sanitizeNode(child);
  }

  return template.innerHTML;
}
