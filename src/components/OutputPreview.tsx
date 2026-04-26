import type { Finding, FindingImage, Review } from "../domain/reviewTypes";
import type { ReviewValidationResult } from "../domain/reviewValidation";

interface OutputPreviewProps {
  review: Review;
  validation: ReviewValidationResult;
}

interface RenderedAnnex {
  number: number;
  id: string;
  findingKey: string;
  fileName: string;
  findingText: string;
  severity: string;
  image: FindingImage;
}

const severityLabels: Record<string, { label: string; color: string; textColor: string }> = {
  "!": { label: "Fatal", color: "#8F2F2A", textColor: "#FFFFFF" },
  "+": { label: "Importante", color: "#9A6528", textColor: "#FFFFFF" },
  "-": { label: "Menor", color: "#3F6E8C", textColor: "#FFFFFF" },
  "?": { label: "Pregunta", color: "#4F5FA3", textColor: "#FFFFFF" },
  "*": { label: "Nota", color: "#6B7785", textColor: "#FFFFFF" },
  A: { label: "Recurrente", color: "#D4A72C", textColor: "#16202B" },
};

export function OutputPreview({ review, validation }: OutputPreviewProps) {
  const errors = getValidationMessages(validation);

  return (
    <section className="card-section">
      {errors.length ? (
        <div className="alert-error">
          <p className="font-medium">Hay campos obligatorios o formatos inválidos.</p>
          <ul className="mt-2 list-disc pl-5 text-xs leading-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <MarkdownSummary review={review} />
    </section>
  );
}

function MarkdownSummary({ review }: { review: Review }) {
  const annexes = collectRenderedAnnexes(review);

  return (
    <article className="preview-panel">
      <h1 className="mb-2 text-2xl font-semibold">{review.metadata.reviewTitle || "Revisión"}</h1>
      <p className="muted mb-4 text-sm">
        <strong>Fecha de revisión:</strong> {formatDate(review.metadata.reviewDate)}
      </p>

      <h2 className="mt-5 mb-2 text-lg font-semibold">Resumen de la reunión</h2>
      <div className="table-wrap">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="table-heading">
              <th className="table-label w-48 px-3 py-2 font-medium">Campo</th>
              <th className="table-label px-3 py-2 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            <SummaryRow label="Fecha" value={formatDate(review.metadata.meetingDate)} />
            <SummaryRow label="Hora" value={`${review.metadata.meetingStart} - ${review.metadata.meetingEnd}`} />
            <SummaryRow label="Lugar" value={review.metadata.meetingPlace} />
            <SummaryRow label="Asunto" value={review.metadata.meetingSubject} />
            <SummaryRow label="Empresa" value={review.metadata.companyName || "No especificado"} />
            <SummaryRow label="SVN/GIT" value={review.metadata.svnGit || "No especificado"} />
            <SummaryRow label="Revisión #" value={review.metadata.revision || "0"} />
          </tbody>
        </table>
      </div>

      <h3 className="mt-4 mb-1 font-semibold">Resumen</h3>
      <p className="whitespace-pre-wrap">{review.metadata.meetingSummary || "Sin resumen."}</p>

      <h2 className="mt-5 mb-2 text-lg font-semibold">Participantes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="row-border">
              <th className="py-2 pr-3">Nombre</th>
              <th className="py-2 pr-3">Iniciales</th>
              <th className="py-2 pr-3">Rol/cargo</th>
              <th className="py-2 pr-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {review.participants.map((participant, index) => (
              <tr className="row-border" key={index}>
                <td className="py-2 pr-3">{participant.name}</td>
                <td className="py-2 pr-3">{participant.initials}</td>
                <td className="py-2 pr-3">{participant.role}</td>
                <td className="py-2 pr-3">{participant.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RenderedFileSection title="Esquemáticos" files={review.schematics} fallbackName="Esquemático sin nombre" annexes={annexes} />
      <RenderedFileSection title="BOM" files={review.bomFiles} fallbackName="BOM sin nombre" annexes={annexes} />
      <RenderedFileSection title="Layout" files={review.layoutFiles} fallbackName="Layout sin nombre" annexes={annexes} />
      <RenderedFileSection title="Documentos extra" files={review.extraDocumentFiles} fallbackName="Documento extra sin nombre" annexes={annexes} />
      <RenderedAnnexes annexes={annexes} />
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="row-border last:border-b-0">
      <th className="table-label px-3 py-2 font-medium">{label}</th>
      <td className="px-3 py-2">{value}</td>
    </tr>
  );
}

function RenderedFileSection({
  title,
  files,
  fallbackName,
  annexes,
}: {
  title: string;
  files: Array<{ name: string; findings: Finding[] }>;
  fallbackName: string;
  annexes: RenderedAnnex[];
}) {
  return (
    <section>
      <h2 className="mt-5 mb-2 text-lg font-semibold">{title}</h2>
      <div className="grid gap-3">
        {files.map((file, fileIndex) => (
          <div className="sub-card" key={fileIndex}>
            <h3 className="mb-2 font-semibold">{file.name || fallbackName}</h3>
            {file.findings.filter((finding) => finding.text.trim()).length ? (
              <div className="table-wrap">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="table-heading">
                      <th className="table-label w-40 px-3 py-2 font-medium">Severidad</th>
                      <th className="table-label px-3 py-2 font-medium">Descripción</th>
                      <th className="table-label w-48 px-3 py-2 font-medium">Anexos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.findings.map((finding, findingIndex) => {
                      if (!finding.text.trim()) {
                        return null;
                      }

                      const findingAnnexes = getFindingAnnexes(`${title}-${fileIndex}-${findingIndex}`, annexes);

                      return (
                        <tr className="row-border last:border-b-0" key={findingIndex}>
                          <td className="px-3 py-2">
                            <span
                              className="preview-severity-badge"
                              style={getSeverityBadgeStyle(finding.severity)}
                            >
                              {severityLabels[finding.severity]?.label ?? severityLabels["-"].label}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className="preview-finding-chip"
                              style={getFindingChipStyle(finding.severity)}
                            >
                              {finding.text}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {findingAnnexes.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {findingAnnexes.map((annex) => (
                                  <a className="text-link" href={`#${annex.id}`} key={annex.id}>
                                    Anexo {annex.number}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="muted">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted italic">Sin hallazgos.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RenderedAnnexes({ annexes }: { annexes: RenderedAnnex[] }) {
  if (!annexes.length) {
    return null;
  }

  return (
    <section>
      <h2 className="mt-5 mb-2 text-lg font-semibold">Anexos</h2>
      <div className="grid gap-3">
        {annexes.map((annex) => (
          <article className="sub-card scroll-mt-4" id={annex.id} key={annex.number}>
            <h3 className="mb-1 font-semibold">
              Anexo {annex.number} - {annex.fileName}
            </h3>
            <div className="mb-3 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="muted">
                  <strong>Hallazgo:</strong>
                </p>
                <span
                  className="preview-severity-badge"
                  style={getSeverityBadgeStyle(annex.severity)}
                >
                  {severityLabels[annex.severity]?.label ?? severityLabels["-"].label}
                </span>
              </div>
              <span
                className="preview-finding-chip"
                style={getFindingChipStyle(annex.severity)}
              >
                {annex.findingText}
              </span>
            </div>
            <img className="image-frame max-h-[520px] w-full rounded-md object-contain" src={annex.image.dataUrl} alt={annex.image.altText || annex.image.name} />
            {annex.image.altText || annex.image.name ? (
              <p className="muted mt-2 text-xs">{annex.image.altText || annex.image.name}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function collectRenderedAnnexes(review: Review): RenderedAnnex[] {
  const annexes: RenderedAnnex[] = [];

  collectSectionAnnexes("Esquemáticos", review.schematics, annexes);
  collectSectionAnnexes("BOM", review.bomFiles, annexes);
  collectSectionAnnexes("Layout", review.layoutFiles, annexes);
  collectSectionAnnexes("Documentos extra", review.extraDocumentFiles, annexes);

  return annexes;
}

function collectSectionAnnexes(
  title: string,
  files: Array<{ name: string; findings: Finding[] }>,
  annexes: RenderedAnnex[],
) {
  files.forEach((file, fileIndex) => {
    file.findings.forEach((finding, findingIndex) => {
      finding.images.forEach((image) => {
        const number = annexes.length + 1;

        annexes.push({
          number,
          id: `anexo-${number}`,
          findingKey: `${title}-${fileIndex}-${findingIndex}`,
          fileName: file.name || "Archivo sin nombre",
          findingText: finding.text || "Hallazgo sin descripción",
          severity: finding.severity,
          image,
        });
      });
    });
  });
}

function getFindingAnnexes(findingKey: string, annexes: RenderedAnnex[]): RenderedAnnex[] {
  return annexes.filter((annex) => annex.findingKey === findingKey);
}

function getValidationMessages(validation: ReviewValidationResult): string[] {
  const metadataErrors = Object.values(validation.metadata);
  const participantListErrors = validation.participantList ? [validation.participantList] : [];
  const participantErrors = validation.participants.flatMap((participant, index) =>
    Object.values(participant).map((message) => `Participante ${index + 1}: ${message}`),
  );
  const schematicErrors = validation.schematics.flatMap((file, index) =>
    Object.values(file).map((message) => `Esquemático ${index + 1}: ${message}`),
  );
  const bomErrors = validation.bomFiles.flatMap((file, index) =>
    Object.values(file).map((message) => `BOM ${index + 1}: ${message}`),
  );
  const layoutErrors = validation.layoutFiles.flatMap((file, index) =>
    Object.values(file).map((message) => `Layout ${index + 1}: ${message}`),
  );
  const extraDocumentErrors = validation.extraDocumentFiles.flatMap((file, index) =>
    Object.values(file).map((message) => `Documento extra ${index + 1}: ${message}`),
  );
  const schematicFindingErrors = validation.schematicFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => `Esquemático ${fileIndex + 1}, hallazgo ${findingIndex + 1}: ${message}`),
    ),
  );
  const bomFindingErrors = validation.bomFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => `BOM ${fileIndex + 1}, hallazgo ${findingIndex + 1}: ${message}`),
    ),
  );
  const layoutFindingErrors = validation.layoutFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => `Layout ${fileIndex + 1}, hallazgo ${findingIndex + 1}: ${message}`),
    ),
  );
  const extraDocumentFindingErrors = validation.extraDocumentFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => `Documento extra ${fileIndex + 1}, hallazgo ${findingIndex + 1}: ${message}`),
    ),
  );

  return [
    ...metadataErrors,
    ...participantListErrors,
    ...participantErrors,
    ...schematicErrors,
    ...bomErrors,
    ...layoutErrors,
    ...extraDocumentErrors,
    ...schematicFindingErrors,
    ...bomFindingErrors,
    ...layoutFindingErrors,
    ...extraDocumentFindingErrors,
  ].filter((message): message is string => Boolean(message));
}

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function getSeverityBadgeStyle(severity: string) {
  const meta = severityLabels[severity] ?? severityLabels["-"];
  return {
    backgroundColor: meta.color,
    color: meta.textColor,
  };
}

function getFindingChipStyle(severity: string) {
  const meta = severityLabels[severity] ?? severityLabels["-"];
  return {
    backgroundColor: hexToRgba(meta.color, 0.1),
    borderColor: hexToRgba(meta.color, 0.35),
    color: "#16202B",
  };
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
