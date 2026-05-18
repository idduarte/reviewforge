import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BomEditor } from "./components/BomEditor";
import { ExtraDocumentsEditor } from "./components/ExtraDocumentsEditor";
import { LayoutEditor } from "./components/LayoutEditor";
import { OutputPreview } from "./components/OutputPreview";
import { ParticipantsEditor } from "./components/ParticipantsEditor";
import { ReviewMetadataForm } from "./components/ReviewMetadataForm";
import { SchematicsEditor } from "./components/SchematicsEditor";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { createBomFile, createExtraDocumentFile, createFinding, createLayoutFile, createParticipant, createReview, createSchematic } from "./domain/reviewDefaults";
import { buildSaveFileName, createSavedReview, parseSavedReview } from "./domain/reviewPersistence";
import type { FileSectionTab, Finding, MetaSubTab, Participant, ReviewMetadata, TabId } from "./domain/reviewTypes";
import { validateReview } from "./domain/reviewValidation";
import { exportReportPdfInBrowser } from "./report/pdf/browserPrint";

export default function App() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("meta");
  const [metaSubTab, setMetaSubTab] = useState<MetaSubTab>("encabezado");
  const [selectedFile, setSelectedFile] = useState<Record<FileSectionTab, number>>({
    schematics: -1, bom: -1, layout: -1, extraDocuments: -1,
  });
  const [review, setReview] = useState(createReview);
  const [projectStatus, setProjectStatus] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const validation = useMemo(() => validateReview(review), [review, i18nInstance.language]);

  function showProjectStatus(message: string) {
    setProjectStatus(message);
    setToastKey((k) => k + 1);
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

  function handleSelectFile(tab: FileSectionTab, index: number) {
    setActiveTab(tab);
    setSelectedFile((prev) => ({ ...prev, [tab]: index }));
  }

  function handlePrint() {
    try {
      exportReportPdfInBrowser(review);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message === "popup-blocked") {
        showProjectStatus(t("status.popupBlocked"));
      } else {
        showProjectStatus(t("status.exportError"));
      }
    }
  }

  return (
    <div className="dash-shell">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metaSubTab={metaSubTab}
        onMetaSubTabChange={setMetaSubTab}
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        review={review}
        canPrint={validation.isValid}
        onSave={saveProgress}
        onRestore={restoreProgress}
        onPrint={handlePrint}
      />

      <div className="dash-main">
        <TopBar activeTab={activeTab} metaSubTab={metaSubTab} review={review} />

        <div className="dash-content">
          {activeTab === "meta" && (
          <MetaView
            subTab={metaSubTab}
            metadata={review.metadata}
            metadataErrors={validation.metadata}
            participants={review.participants}
            participantErrors={validation.participants}
            participantListError={validation.participantList}
            onChange={updateMetadata}
            onLogoChange={updateCompanyLogo}
            onAddParticipant={() => setReview((current) => ({ ...current, participants: [...current.participants, createParticipant()] }))}
            onRemoveParticipant={(index) => setReview((current) => ({ ...current, participants: current.participants.filter((_, i) => i !== index) }))}
            onChangeParticipant={updateParticipant}
          />
        )}

        {activeTab === "schematics" && (
        <SchematicsEditor
          schematics={review.schematics}
          selectedIndex={selectedFile.schematics}
          errors={validation.schematics}
          findingErrors={validation.schematicFindings}
          onAddSchematic={() => {
            setReview((current) => ({ ...current, schematics: [...current.schematics, createSchematic()] }));
            setSelectedFile((prev) => ({ ...prev, schematics: review.schematics.length }));
          }}
          onRemoveSchematic={(index) => {
            setReview((current) => ({ ...current, schematics: current.schematics.filter((_, i) => i !== index) }));
            setSelectedFile((prev) => {
              const next = prev.schematics <= 0 || prev.schematics === index ? -1 : prev.schematics > index ? prev.schematics - 1 : prev.schematics;
              return { ...prev, schematics: next };
            });
          }}
          onSchematicNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((s, i) => i === index ? { ...s, name } : s),
            }))
          }
          onAddSchematicFinding={(schematicIndex) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((s, i) =>
                i === schematicIndex ? { ...s, findings: [...s.findings, createFinding()] } : s,
              ),
            }))
          }
          onRemoveSchematicFinding={(schematicIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              schematics: current.schematics.map((s, i) =>
                i === schematicIndex
                  ? { ...s, findings: s.findings.filter((_, fi) => fi !== findingIndex) }
                  : s,
              ),
            }))
          }
          onSchematicFindingChange={updateSchematicFinding}
          onSelectFile={(i) => setSelectedFile((prev) => ({ ...prev, schematics: i }))}
        />
        )}

        {activeTab === "bom" && (
        <BomEditor
          files={review.bomFiles}
          selectedIndex={selectedFile.bom}
          errors={validation.bomFiles}
          findingErrors={validation.bomFindings}
          onAddFile={() => {
            setReview((current) => ({ ...current, bomFiles: [...current.bomFiles, createBomFile()] }));
            setSelectedFile((prev) => ({ ...prev, bom: review.bomFiles.length }));
          }}
          onRemoveFile={(index) => {
            setReview((current) => ({ ...current, bomFiles: current.bomFiles.filter((_, i) => i !== index) }));
            setSelectedFile((prev) => {
              const next = prev.bom <= 0 || prev.bom === index ? -1 : prev.bom > index ? prev.bom - 1 : prev.bom;
              return { ...prev, bom: next };
            });
          }}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((f, i) => i === index ? { ...f, name } : f),
            }))
          }
          onAddFinding={(bomFileIndex) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((f, i) =>
                i === bomFileIndex ? { ...f, findings: [...f.findings, createFinding()] } : f,
              ),
            }))
          }
          onRemoveFinding={(bomFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              bomFiles: current.bomFiles.map((f, i) =>
                i === bomFileIndex
                  ? { ...f, findings: f.findings.filter((_, fi) => fi !== findingIndex) }
                  : f,
              ),
            }))
          }
          onFindingChange={updateBomFinding}
          onSelectFile={(i) => setSelectedFile((prev) => ({ ...prev, bom: i }))}
        />
        )}

        {activeTab === "layout" && (
        <LayoutEditor
          files={review.layoutFiles}
          selectedIndex={selectedFile.layout}
          errors={validation.layoutFiles}
          findingErrors={validation.layoutFindings}
          onAddFile={() => {
            setReview((current) => ({ ...current, layoutFiles: [...current.layoutFiles, createLayoutFile()] }));
            setSelectedFile((prev) => ({ ...prev, layout: review.layoutFiles.length }));
          }}
          onRemoveFile={(index) => {
            setReview((current) => ({ ...current, layoutFiles: current.layoutFiles.filter((_, i) => i !== index) }));
            setSelectedFile((prev) => {
              const next = prev.layout <= 0 || prev.layout === index ? -1 : prev.layout > index ? prev.layout - 1 : prev.layout;
              return { ...prev, layout: next };
            });
          }}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((f, i) => i === index ? { ...f, name } : f),
            }))
          }
          onAddFinding={(layoutFileIndex) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((f, i) =>
                i === layoutFileIndex ? { ...f, findings: [...f.findings, createFinding()] } : f,
              ),
            }))
          }
          onRemoveFinding={(layoutFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              layoutFiles: current.layoutFiles.map((f, i) =>
                i === layoutFileIndex
                  ? { ...f, findings: f.findings.filter((_, fi) => fi !== findingIndex) }
                  : f,
              ),
            }))
          }
          onFindingChange={updateLayoutFinding}
          onSelectFile={(i) => setSelectedFile((prev) => ({ ...prev, layout: i }))}
        />
        )}

        {activeTab === "extraDocuments" && (
        <ExtraDocumentsEditor
          files={review.extraDocumentFiles}
          selectedIndex={selectedFile.extraDocuments}
          errors={validation.extraDocumentFiles}
          findingErrors={validation.extraDocumentFindings}
          onAddFile={() => {
            setReview((current) => ({ ...current, extraDocumentFiles: [...current.extraDocumentFiles, createExtraDocumentFile()] }));
            setSelectedFile((prev) => ({ ...prev, extraDocuments: review.extraDocumentFiles.length }));
          }}
          onRemoveFile={(index) => {
            setReview((current) => ({ ...current, extraDocumentFiles: current.extraDocumentFiles.filter((_, i) => i !== index) }));
            setSelectedFile((prev) => {
              const next = prev.extraDocuments <= 0 || prev.extraDocuments === index ? -1 : prev.extraDocuments > index ? prev.extraDocuments - 1 : prev.extraDocuments;
              return { ...prev, extraDocuments: next };
            });
          }}
          onFileNameChange={(index, name) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((f, i) => i === index ? { ...f, name } : f),
            }))
          }
          onAddFinding={(documentFileIndex) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((f, i) =>
                i === documentFileIndex ? { ...f, findings: [...f.findings, createFinding()] } : f,
              ),
            }))
          }
          onRemoveFinding={(documentFileIndex, findingIndex) =>
            setReview((current) => ({
              ...current,
              extraDocumentFiles: current.extraDocumentFiles.map((f, i) =>
                i === documentFileIndex
                  ? { ...f, findings: f.findings.filter((_, fi) => fi !== findingIndex) }
                  : f,
              ),
            }))
          }
          onFindingChange={updateExtraDocumentFinding}
          onSelectFile={(i) => setSelectedFile((prev) => ({ ...prev, extraDocuments: i }))}
        />
        )}

          {activeTab === "output" && <OutputPreview review={review} validation={validation} />}

          <ContentFooter review={review} />
        </div>
      </div>

      <Toast key={toastKey} message={projectStatus} />
    </div>
  );
}

function MetaView({
  subTab,
  metadata,
  metadataErrors,
  participants,
  participantErrors,
  participantListError,
  onChange,
  onLogoChange,
  onAddParticipant,
  onRemoveParticipant,
  onChangeParticipant,
}: {
  subTab: MetaSubTab;
  metadata: ReviewMetadata;
  metadataErrors: ReturnType<typeof validateReview>["metadata"];
  participants: ReturnType<typeof createReview>["participants"];
  participantErrors: ReturnType<typeof validateReview>["participants"];
  participantListError?: string;
  onChange: <K extends keyof ReviewMetadata>(key: K, value: ReviewMetadata[K]) => void;
  onLogoChange: (file: File | null) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (index: number) => void;
  onChangeParticipant: <K extends keyof import("./domain/reviewTypes").Participant>(index: number, key: K, value: import("./domain/reviewTypes").Participant[K]) => void;
}) {
  if (subTab === "participantes") {
    return (
      <ParticipantsEditor
        participants={participants}
        errors={participantErrors}
        listError={participantListError}
        onAdd={onAddParticipant}
        onRemove={onRemoveParticipant}
        onChange={onChangeParticipant}
      />
    );
  }
  return (
    <ReviewMetadataForm
      metadata={metadata}
      errors={metadataErrors}
      subTab={subTab}
      onChange={onChange}
      onLogoChange={onLogoChange}
    />
  );
}

function ContentFooter({ review }: { review: ReturnType<typeof createReview> }) {
  const { t, i18n } = useTranslation();
  const totalSections = 7;
  const completed = [
    Boolean(review.metadata.reviewTitle),
    Boolean(review.metadata.reviewDate),
    review.participants.length > 0,
    review.schematics.length > 0,
    review.bomFiles.length > 0,
    review.layoutFiles.length > 0,
    Boolean(review.metadata.meetingSummary),
  ].filter(Boolean).length;

  return (
    <div className="content-footer">
      <span>{t("ui.sectionsCompleted", { completed, total: totalSections })}</span>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="toast-icon">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

