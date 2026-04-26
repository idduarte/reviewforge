import { useEffect, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faDownload, faPrint, faUpload } from "@fortawesome/free-solid-svg-icons";
import type { Review } from "../domain/reviewTypes";
import { exportReportPdfInBrowser } from "../report/pdf/browserPrint";

const DOCS_HINT_KEY = "reviewforge-docs-hint-seen";

interface ProjectActionsProps {
  review: Review;
  canPrint: boolean;
  onSave: () => void;
  onRestore: (file: File) => void;
}

export function ProjectActions({ review, canPrint, onSave, onRestore }: ProjectActionsProps) {
  const { t } = useTranslation();

  function handleRestore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onRestore(file);
      event.target.value = "";
    }
  }

  function handlePrint() {
    if (!canPrint) return;
    exportReportPdfInBrowser(review);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className="icon-btn"
        type="button"
        title={t("actions.save")}
        aria-label={t("actions.save")}
        onClick={onSave}
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faDownload} />
      </button>
      <label
        className="icon-btn cursor-pointer"
        title={t("actions.restore")}
        aria-label={t("actions.restore")}
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faUpload} />
        <input className="sr-only" type="file" accept="application/json,.json" onChange={handleRestore} />
      </label>
      <button
        className="icon-btn"
        type="button"
        title={t("actions.print")}
        aria-label={t("actions.print")}
        disabled={!canPrint}
        onClick={handlePrint}
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faPrint} />
      </button>
      <div className="docs-btn-wrapper">
        <a
          className="icon-btn"
          href="https://github.com/idduarte/reviewforge/blob/main/docs/GUIA_USO.md"
          target="_blank"
          rel="noreferrer noopener"
          title={t("actions.docs")}
          aria-label={t("actions.docs")}
        >
          <FontAwesomeIcon className="h-4 w-4" icon={faBook} />
        </a>
        <DocsHint />
      </div>
    </div>
  );
}

function DocsHint() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !localStorage.getItem(DOCS_HINT_KEY));

  useEffect(() => {
    if (!visible) return;
    localStorage.setItem(DOCS_HINT_KEY, "1");
    const timer = window.setTimeout(() => setVisible(false), 10100);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="docs-hint" role="status" onClick={() => setVisible(false)}>
      <p className="docs-hint-title">{t("hint.docsTitle")}</p>
      <p className="docs-hint-body">{t("hint.docsBody")}</p>
    </div>
  );
}
