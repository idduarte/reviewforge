import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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

const SEVERITY_COLORS: Record<string, { color: string; textColor: string }> = {
  "!": { color: "#8F2F2A", textColor: "#FFFFFF" },
  "+": { color: "#9A6528", textColor: "#FFFFFF" },
  "-": { color: "#3F6E8C", textColor: "#FFFFFF" },
  "?": { color: "#4F5FA3", textColor: "#FFFFFF" },
  "*": { color: "#6B7785", textColor: "#FFFFFF" },
  A:  { color: "#D4A72C", textColor: "#16202B" },
};

const SEVERITY_LABEL_KEYS: Record<string, string> = {
  "!": "findings.fatal",
  "+": "findings.important",
  "-": "findings.minor",
  "?": "findings.question",
  "*": "findings.note",
  A:  "findings.recurring",
};

function getSeverityLabel(severity: string, t: TFunction): string {
  return t(SEVERITY_LABEL_KEYS[severity] ?? SEVERITY_LABEL_KEYS["-"]);
}

export function OutputPreview({ review, validation }: OutputPreviewProps) {
  const { t } = useTranslation();
  const errors = getValidationMessages(validation, t);

  return (
    <section className="card-section">
      {errors.length ? (
        <div className="alert-error">
          <p className="font-medium">{t("output.validationTitle")}</p>
          <ul className="mt-2 list-disc pl-5 text-xs leading-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <MarkdownSummary review={review} t={t} />
    </section>
  );
}

function MarkdownSummary({ review, t }: { review: Review; t: TFunction }) {
  const annexes = collectRenderedAnnexes(review);

  return (
    <article className="preview-panel">
      <h1 className="mb-2 text-2xl font-semibold">{review.metadata.reviewTitle || t("output.reviewFallback")}</h1>
      <p className="muted mb-4 text-sm">
        <strong>{t("output.reviewDateLabel")}</strong> {formatDate(review.metadata.reviewDate)}
      </p>

      <h2 className="mt-5 mb-2 text-lg font-semibold">{t("output.meetingSummaryTitle")}</h2>
      <div className="table-wrap">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="table-heading">
              <th className="table-label w-48 px-3 py-2 font-medium">{t("output.fieldColumn")}</th>
              <th className="table-label px-3 py-2 font-medium">{t("output.valueColumn")}</th>
            </tr>
          </thead>
          <tbody>
            <SummaryRow label={t("output.dateRow")} value={formatDate(review.metadata.meetingDate)} />
            <SummaryRow label={t("output.timeRow")} value={`${review.metadata.meetingStart} - ${review.metadata.meetingEnd}`} />
            <SummaryRow label={t("output.placeRow")} value={review.metadata.meetingPlace} />
            <SummaryRow label={t("output.subjectRow")} value={review.metadata.meetingSubject} />
            <SummaryRow label={t("output.companyRow")} value={review.metadata.companyName || t("output.notSpecified")} />
            <SummaryRow label={t("output.svnGitRow")} value={review.metadata.svnGit || t("output.notSpecified")} />
            <SummaryRow label={t("output.revisionRow")} value={review.metadata.revision || "0"} />
          </tbody>
        </table>
      </div>

      <h3 className="mt-4 mb-1 font-semibold">{t("output.summaryLabel")}</h3>
      <p className="whitespace-pre-wrap">{review.metadata.meetingSummary || t("output.noSummary")}</p>

      <h2 className="mt-5 mb-2 text-lg font-semibold">{t("output.participantsTitle")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="row-border">
              <th className="py-2 pr-3">{t("output.nameColumn")}</th>
              <th className="py-2 pr-3">{t("output.initialsColumn")}</th>
              <th className="py-2 pr-3">{t("output.roleColumn")}</th>
              <th className="py-2 pr-3">{t("output.emailColumn")}</th>
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

      <RenderedFileSection sectionKey="schematics" title={t("output.schematicsTitle")} files={review.schematics} fallbackName={t("output.schematicFallback")} annexes={annexes} t={t} />
      <RenderedFileSection sectionKey="bom" title={t("output.bomTitle")} files={review.bomFiles} fallbackName={t("output.bomFallback")} annexes={annexes} t={t} />
      <RenderedFileSection sectionKey="layout" title={t("output.layoutTitle")} files={review.layoutFiles} fallbackName={t("output.layoutFallback")} annexes={annexes} t={t} />
      <RenderedFileSection sectionKey="extraDocuments" title={t("output.extraDocumentsTitle")} files={review.extraDocumentFiles} fallbackName={t("output.extraDocumentFallback")} annexes={annexes} t={t} />
      <RenderedAnnexes annexes={annexes} t={t} />
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
  sectionKey,
  title,
  files,
  fallbackName,
  annexes,
  t,
}: {
  sectionKey: string;
  title: string;
  files: Array<{ name: string; findings: Finding[] }>;
  fallbackName: string;
  annexes: RenderedAnnex[];
  t: TFunction;
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
                      <th className="table-label w-40 px-3 py-2 font-medium">{t("output.severityColumn")}</th>
                      <th className="table-label px-3 py-2 font-medium">{t("output.descriptionColumn")}</th>
                      <th className="table-label w-48 px-3 py-2 font-medium">{t("output.annexesColumn")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.findings.map((finding, findingIndex) => {
                      if (!finding.text.trim()) return null;

                      const findingAnnexes = getFindingAnnexes(`${sectionKey}-${fileIndex}-${findingIndex}`, annexes);

                      return (
                        <tr className="row-border last:border-b-0" key={findingIndex}>
                          <td className="px-3 py-2">
                            <span className="preview-severity-badge" style={getSeverityBadgeStyle(finding.severity)}>
                              {getSeverityLabel(finding.severity, t)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="preview-finding-chip" style={getFindingChipStyle(finding.severity)}>
                              {finding.text}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {findingAnnexes.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {findingAnnexes.map((annex) => (
                                  <a className="text-link" href={`#${annex.id}`} key={annex.id}>
                                    {t("output.annex", { number: annex.number })}
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
              <p className="muted italic">{t("output.noFindings")}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RenderedAnnexes({ annexes, t }: { annexes: RenderedAnnex[]; t: TFunction }) {
  if (!annexes.length) return null;

  return (
    <section>
      <h2 className="mt-5 mb-2 text-lg font-semibold">{t("output.annexesTitle")}</h2>
      <div className="grid gap-3">
        {annexes.map((annex) => (
          <article className="sub-card scroll-mt-4" id={annex.id} key={annex.number}>
            <h3 className="mb-1 font-semibold">
              {t("output.annexTitle", { number: annex.number, fileName: annex.fileName })}
            </h3>
            <div className="mb-3 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="muted">
                  <strong>{t("output.findingLabel")}</strong>
                </p>
                <span className="preview-severity-badge" style={getSeverityBadgeStyle(annex.severity)}>
                  {getSeverityLabel(annex.severity, t)}
                </span>
              </div>
              <span className="preview-finding-chip" style={getFindingChipStyle(annex.severity)}>
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

  collectSectionAnnexes("schematics", review.schematics, annexes);
  collectSectionAnnexes("bom", review.bomFiles, annexes);
  collectSectionAnnexes("layout", review.layoutFiles, annexes);
  collectSectionAnnexes("extraDocuments", review.extraDocumentFiles, annexes);

  return annexes;
}

function collectSectionAnnexes(
  sectionKey: string,
  files: Array<{ name: string; findings: Finding[] }>,
  annexes: RenderedAnnex[],
) {
  files.forEach((file, fileIndex) => {
    file.findings.forEach((finding, findingIndex) => {
      finding.images.forEach((image) => {
        const number = annexes.length + 1;

        annexes.push({
          number,
          id: `annex-${number}`,
          findingKey: `${sectionKey}-${fileIndex}-${findingIndex}`,
          fileName: file.name,
          findingText: finding.text,
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

function getValidationMessages(validation: ReviewValidationResult, t: TFunction): string[] {
  const metadataErrors = Object.values(validation.metadata);
  const participantListErrors = validation.participantList ? [validation.participantList] : [];
  const participantErrors = validation.participants.flatMap((participant, index) =>
    Object.values(participant).map((message) => t("validation.participant", { index: index + 1, message })),
  );
  const schematicErrors = validation.schematics.flatMap((file, index) =>
    Object.values(file).map((message) => t("validation.schematic", { index: index + 1, message })),
  );
  const bomErrors = validation.bomFiles.flatMap((file, index) =>
    Object.values(file).map((message) => t("validation.bom", { index: index + 1, message })),
  );
  const layoutErrors = validation.layoutFiles.flatMap((file, index) =>
    Object.values(file).map((message) => t("validation.layoutItem", { index: index + 1, message })),
  );
  const extraDocumentErrors = validation.extraDocumentFiles.flatMap((file, index) =>
    Object.values(file).map((message) => t("validation.extraDocument", { index: index + 1, message })),
  );
  const schematicFindingErrors = validation.schematicFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => t("validation.schematicFinding", { fileIndex: fileIndex + 1, findingIndex: findingIndex + 1, message })),
    ),
  );
  const bomFindingErrors = validation.bomFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => t("validation.bomFinding", { fileIndex: fileIndex + 1, findingIndex: findingIndex + 1, message })),
    ),
  );
  const layoutFindingErrors = validation.layoutFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => t("validation.layoutFinding", { fileIndex: fileIndex + 1, findingIndex: findingIndex + 1, message })),
    ),
  );
  const extraDocumentFindingErrors = validation.extraDocumentFindings.flatMap((findings, fileIndex) =>
    findings.flatMap((finding, findingIndex) =>
      Object.values(finding).map((message) => t("validation.extraDocumentFinding", { fileIndex: fileIndex + 1, findingIndex: findingIndex + 1, message })),
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
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function getSeverityBadgeStyle(severity: string) {
  const meta = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["-"];
  return { backgroundColor: meta.color, color: meta.textColor };
}

function getFindingChipStyle(severity: string) {
  const meta = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["-"];
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
