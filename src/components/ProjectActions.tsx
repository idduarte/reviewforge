import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPrint, faUpload } from "@fortawesome/free-solid-svg-icons";
import type { Review } from "../domain/reviewTypes";
import { exportReportPdfInBrowser } from "../report/pdf/browserPrint";

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
    </div>
  );
}
