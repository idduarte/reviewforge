import type { ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPrint, faUpload } from "@fortawesome/free-solid-svg-icons";
import type { Review } from "../domain/reviewTypes";
import { exportReportPdfInBrowser } from "../report/pdf/browserPrint";

interface ProjectActionsProps {
  status: string;
  review: Review;
  canPrint: boolean;
  onSave: () => void;
  onRestore: (file: File) => void;
}

export function ProjectActions({ status, review, canPrint, onSave, onRestore }: ProjectActionsProps) {
  function handleRestore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onRestore(file);
      event.target.value = "";
    }
  }

  function handlePrint() {
    if (!canPrint) {
      return;
    }

    exportReportPdfInBrowser(review);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status ? <span className="muted hidden text-xs sm:inline" role="status">{status}</span> : null}
      <button
        className="icon-btn"
        type="button"
        title="Guardar avance"
        aria-label="Guardar avance"
        onClick={onSave}
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faDownload} />
      </button>
      <label
        className="icon-btn cursor-pointer"
        title="Restaurar avance"
        aria-label="Restaurar avance"
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faUpload} />
        <input className="sr-only" type="file" accept="application/json,.json" onChange={handleRestore} />
      </label>
      <button
        className="icon-btn"
        type="button"
        title="Imprimir / Guardar PDF"
        aria-label="Imprimir / Guardar PDF"
        disabled={!canPrint}
        onClick={handlePrint}
      >
        <FontAwesomeIcon className="h-4 w-4" icon={faPrint} />
      </button>
    </div>
  );
}
