import type { Finding, FindingImage, Review } from "./reviewTypes";

const severityLabels: Record<string, string> = {
  "!": "Fatal",
  "+": "Importante",
  "-": "Menor",
  "?": "Pregunta",
  "*": "Nota",
  A: "Recurrente",
};

interface Annex {
  number: number;
  id: string;
  findingKey: string;
  fileName: string;
  findingText: string;
  image: FindingImage;
}

export function formatReviewMarkdown(review: Review): string {
  const annexes = collectAnnexes(review);

  return [
    buildHeader(review),
    buildMeetingSummary(review),
    buildParticipants(review),
    buildFileSection("Esquemáticos", review.schematics, "Esquemático sin nombre", annexes),
    buildFileSection("BOM", review.bomFiles, "BOM sin nombre", annexes),
    buildFileSection("Layout", review.layoutFiles, "Layout sin nombre", annexes),
    buildFileSection("Documentos extra", review.extraDocumentFiles, "Documento extra sin nombre", annexes),
    buildAnnexesSection(annexes),
  ].filter(Boolean).join("\n\n");
}

function buildHeader(review: Review): string {
  const { metadata } = review;
  return [
    `# ${escapeMarkdown(metadata.reviewTitle || "Revisión")}`,
    "",
    `**Fecha de revisión:** ${formatDate(metadata.reviewDate)}`,
  ].join("\n");
}

function buildMeetingSummary(review: Review): string {
  const { metadata } = review;
  const repository = metadata.svnGit.trim() || "No especificado";
  const summary = metadata.meetingSummary.trim() || "Sin resumen.";

  return [
    "## Resumen de la reunión",
    "",
    "| Campo | Valor |",
    "| --- | --- |",
    `| Fecha | ${formatDate(metadata.meetingDate)} |`,
    `| Hora | ${metadata.meetingStart} - ${metadata.meetingEnd} |`,
    `| Lugar | ${escapeMarkdown(metadata.meetingPlace)} |`,
    `| Asunto | ${escapeMarkdown(metadata.meetingSubject)} |`,
    `| SVN/GIT | ${escapeMarkdown(repository)} |`,
    `| Revisión # | ${escapeMarkdown(metadata.revision || "0")} |`,
    "",
    "### Resumen",
    "",
    escapeMarkdown(summary),
  ].join("\n");
}

function buildParticipants(review: Review): string {
  const rows = review.participants
    .map((participant) => (
      `| ${escapeMarkdown(participant.name)} | ${escapeMarkdown(participant.initials)} | ${escapeMarkdown(participant.role)} | ${escapeMarkdown(participant.email)} |`
    ));

  return [
    "## Participantes",
    "",
    "| Nombre | Iniciales | Rol/cargo | Email |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function buildFileSection(
  title: string,
  files: Array<{ name: string; findings: Finding[] }>,
  fallbackName: string,
  annexes: Annex[],
): string {
  const blocks = files.map((file, fileIndex) => buildFileBlock(file.name || fallbackName, file.findings, annexes, `${title}-${fileIndex}`));

  return [`## ${title}`, "", ...blocks].join("\n");
}

function buildFileBlock(fileName: string, findings: Finding[], annexes: Annex[], fileKey: string): string {
  const findingRows = findings
    .map((finding, findingIndex) => {
      if (!finding.text.trim()) {
        return "";
      }

      const label = severityLabels[finding.severity] ?? "Menor";
      const references = getAnnexReferences(`${fileKey}-${findingIndex}`, annexes);

      return `| ${label} | ${escapeMarkdown(finding.text)} | ${references || "-"} |`;
    })
    .filter(Boolean);

  return [
    `### ${escapeMarkdown(fileName)}`,
    "",
    findingRows.length ? ["| Severidad | Descripción | Anexos |", "| --- | --- | --- |", ...findingRows].join("\n") : "_Sin hallazgos._",
    "",
  ].join("\n");
}

function buildAnnexesSection(annexes: Annex[]): string {
  if (!annexes.length) {
    return "";
  }

  return [
    "## Anexos",
    "",
    ...annexes.flatMap((annex) => [
      `<a id="${annex.id}"></a>`,
      "",
      `### Anexo ${annex.number} - ${escapeMarkdown(annex.fileName)}`,
      "",
      `**Hallazgo:** ${escapeMarkdown(annex.findingText)}`,
      "",
      `![${escapeMarkdown(annex.image.altText || annex.image.name)}](${annex.image.dataUrl})`,
      "",
    ]),
  ].join("\n");
}

function collectAnnexes(review: Review): Annex[] {
  const annexes: Annex[] = [];

  collectFileAnnexes("Esquemáticos", review.schematics, annexes);
  collectFileAnnexes("BOM", review.bomFiles, annexes);
  collectFileAnnexes("Layout", review.layoutFiles, annexes);
  collectFileAnnexes("Documentos extra", review.extraDocumentFiles, annexes);

  return annexes;
}

function collectFileAnnexes(
  sectionTitle: string,
  files: Array<{ name: string; findings: Finding[] }>,
  annexes: Annex[],
) {
  files.forEach((file, fileIndex) => {
    file.findings.forEach((finding, findingIndex) => {
      finding.images.forEach((image) => {
        annexes.push({
          number: annexes.length + 1,
          id: `anexo-${annexes.length + 1}`,
          findingKey: `${sectionTitle}-${fileIndex}-${findingIndex}`,
          fileName: file.name || "Archivo sin nombre",
          findingText: finding.text || "Hallazgo sin descripción",
          image,
        });
      });
    });
  });
}

function getAnnexReferences(findingKey: string, annexes: Annex[]): string {
  const references = annexes
    .filter((annex) => annex.findingKey === findingKey)
    .map((annex) => `[Anexo ${annex.number}](#${annex.id})`);

  return references.length ? references.join(", ") : "";
}

function formatDate(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function escapeMarkdown(value: string): string {
  return value.replace(/[\\`*_{}[\]()#+\-.!|]/g, "\\$&").replace(/\n/g, "\n\n");
}
