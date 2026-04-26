import { renderReportPrintStyles } from "./reportPrintStyles.mjs";

const SECTION_DEFINITIONS = [
  { key: "schematics", title: "Esquemáticos", fallbackName: "Esquemático sin nombre" },
  { key: "bomFiles", title: "BOM", fallbackName: "BOM sin nombre" },
  { key: "layoutFiles", title: "Layout", fallbackName: "Layout sin nombre" },
  { key: "extraDocumentFiles", title: "Documentos extra", fallbackName: "Documento extra sin nombre" },
];

const SUMMARY_FIRST_PAGE_CAPACITY = 16;
const SUMMARY_FOLLOWING_PAGE_CAPACITY = 20;
const SECTION_PAGE_CAPACITY = 15;
const FILE_CHUNK_CAPACITY = 9;

export function mapSeverity(severity) {
  switch (severity) {
    case "!":
      return { label: "Fatal", color: "#8F2F2A", textColor: "#FFFFFF" };
    case "+":
      return { label: "Importante", color: "#9A6528", textColor: "#FFFFFF" };
    case "A":
      return { label: "Recurrente", color: "#D4A72C", textColor: "#16202B" };
    case "?":
      return { label: "Pregunta", color: "#4F5FA3", textColor: "#FFFFFF" };
    case "*":
      return { label: "Nota", color: "#6B7785", textColor: "#FFFFFF" };
    case "-":
    default:
      return { label: "Menor", color: "#3F6E8C", textColor: "#FFFFFF" };
  }
}

export function collectAppendices(reportJson) {
  const review = normalizeReport(reportJson);
  const appendices = [];

  for (const section of SECTION_DEFINITIONS) {
    const files = review[section.key] ?? [];

    files.forEach((file, fileIndex) => {
      file.findings.forEach((finding, findingIndex) => {
        finding.images.forEach((image) => {
          appendices.push({
            number: appendices.length + 1,
            id: `appendix-${appendices.length + 1}`,
            sectionTitle: section.title,
            fileName: file.name || section.fallbackName,
            severity: finding.severity,
            findingText: finding.text || "Hallazgo sin descripción.",
            image,
            findingKey: buildFindingKey(section.title, fileIndex, findingIndex),
          });
        });
      });
    });
  }

  return appendices;
}

export function renderReportHtml(reportJson, options = {}) {
  const review = normalizeReport(reportJson);
  const appendices = collectAppendices(review);
  const generatedAt = options.generatedAt ? new Date(options.generatedAt) : new Date();
  const styles = options.styles ?? renderReportPrintStyles(options.fonts);
  const pages = buildReportPages(review, appendices, generatedAt);
  const pdfCoverKicker = options.pdfCoverKicker ?? "Informe de Revisión Técnica de Diseño Electrónico";
  const pdfFooterNote = options.pdfFooterNote ?? "Elaborado con ReviewForge, con dedicación y atención en cada detalle.";
  const reviewforgeMarkSvg = options.reviewforgeMarkSvg ?? "";

  const htmlPages = pages
    .map((page, index) => renderPage(page, index < 2 ? null : index - 1, reviewforgeMarkSvg, pdfCoverKicker, pdfFooterNote))
    .join("\n");

  return [
    "<!doctype html>",
    '<html lang="es">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${escapeHtml(review.metadata.reviewTitle || "ReviewForge Report")}</title>`,
    "  <style>",
    styles,
    "  </style>",
    "</head>",
    "<body>",
    '  <main class="report-root">',
    htmlPages,
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function buildReportPages(review, appendices, generatedAt) {
  return [
    buildCoverPage(review, generatedAt),
    buildParticipantsPage(review),
    ...buildMeetingSummaryPages(review.metadata),
    ...SECTION_DEFINITIONS.flatMap((section) =>
      buildSectionPages(review.metadata, section, review[section.key] ?? [], appendices),
    ),
    ...buildAppendixPages(review.metadata, appendices),
  ];
}

function buildCoverPage(review, generatedAt) {
  const repository = review.metadata.svnGit.trim();
  const rows = [
    review.metadata.companyName.trim() ? renderMetaRow("Empresa", review.metadata.companyName) : "",
    renderMetaRow("Asunto", review.metadata.meetingSubject),
    renderMetaRow("Fecha de revisión", formatDate(review.metadata.reviewDate)),
    renderMetaRow("Fecha de reunión", formatDate(review.metadata.meetingDate)),
    renderMetaRow("Hora de inicio", review.metadata.meetingStart),
    renderMetaRow("Hora de fin", review.metadata.meetingEnd),
    renderMetaRow("Lugar", review.metadata.meetingPlace),
    renderMetaRow("Revisión #", review.metadata.revision || "0"),
    repository ? renderMetaRow("SVN/GIT", review.metadata.svnGit, true) : "",
    renderMetaRow("Fecha de generación", formatDateTime(generatedAt)),
  ]
    .filter(Boolean)
    .join("");

  return {
    kind: "cover",
    debugClass: "debug-page-cover",
    content: `
      <div class="cover-brand-block">
        <h2 class="cover-kicker">__PDF_COVER_KICKER__</h2>
        ${hasCustomCoverBrand(review.metadata) ? renderCoverBrand(review.metadata) : renderWordmark("cover-wordmark", "h1")}
        <h1 class="cover-title">${escapeHtml(review.metadata.reviewTitle || "Informe de revisión técnica")}</h1>
      </div>
      <div class="meta-grid">
        ${rows}
      </div>
    `,
  };
}

function buildParticipantsPage(review) {
  const rows = review.participants
    .map(
      (participant) => `
      <tr class="participant-row">
        <td>${escapeHtml(participant.name)}</td>
        <td>${escapeHtml(participant.initials)}</td>
        <td>${escapeHtml(participant.role)}</td>
        <td>${escapeHtml(participant.email)}</td>
      </tr>`,
    )
    .join("");

  return {
    kind: "standard",
    debugClass: "debug-page-attendees",
    metadata: review.metadata,
    title: "Asistentes",
    description: "Participantes registrados para la revisión",
    footerLabel: "Asistentes",
    content: `
      <table class="participant-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Iniciales</th>
            <th>Rol / cargo</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr class="participant-row"><td colspan="4">Sin participantes registrados.</td></tr>'}
        </tbody>
      </table>
    `,
  };
}

function buildMeetingSummaryPages(metadata) {
  const paragraphs = splitParagraphs(metadata.meetingSummary);

  if (!paragraphs.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-summary",
        metadata,
        title: "Resumen de la reunión",
        description: "Síntesis narrativa de la sesión de revisión",
        footerLabel: "Resumen de la reunión",
        content: '<div class="summary-card meeting-summary-body"><p>Sin resumen registrado.</p></div>',
      },
    ];
  }

  const chunks = paginateItems(
    paragraphs.map((paragraph) => ({
      html: `<p>${escapeHtml(paragraph)}</p>`,
      units: estimateParagraphUnits(paragraph),
    })),
    SUMMARY_FIRST_PAGE_CAPACITY,
    SUMMARY_FOLLOWING_PAGE_CAPACITY,
  );

  return chunks.map((chunk, index) => ({
    kind: "standard",
    debugClass: "debug-page-summary",
    metadata,
    title: index === 0 ? "Resumen de la reunión" : "Resumen de la reunión (continuación)",
    description:
      index === 0
        ? "Síntesis narrativa de la sesión de revisión"
        : "Continuación del resumen de la reunión",
    footerLabel: "Resumen de la reunión",
    content: `<div class="summary-card meeting-summary-body">${chunk.map((item) => item.html).join("")}</div>`,
  }));
}

function buildSectionPages(metadata, section, files, appendices) {
  const fileChunks = buildFileChunks(section, files, appendices);

  if (!fileChunks.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-section",
        metadata,
        title: section.title,
        description: `Resultados de revisión para ${section.title.toLowerCase()}`,
        footerLabel: section.title,
        content: '<div class="empty-state">No hay archivos registrados en esta sección.</div>',
      },
    ];
  }

  const pages = paginateItems(fileChunks, SECTION_PAGE_CAPACITY, SECTION_PAGE_CAPACITY);

  return pages.map((pageItems, index) => ({
    kind: "standard",
    debugClass: "debug-page-section",
    metadata,
    title: index === 0 ? section.title : `${section.title} (continuación)`,
    description:
      index === 0
        ? `Resultados de revisión para ${section.title.toLowerCase()}`
        : `Continuación de resultados de revisión para ${section.title.toLowerCase()}`,
    footerLabel: section.title,
    content: pageItems.map((item) => item.html).join(""),
  }));
}

function buildAppendixPages(metadata, appendices) {
  if (!appendices.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-appendix",
        metadata,
        title: "Anexos",
        description: "Imágenes y evidencias asociadas a los hallazgos",
        footerLabel: "Anexos",
        content: '<div class="empty-state">No hay anexos embebidos en el informe.</div>',
      },
    ];
  }

  return appendices.map((appendix, index) => ({
    kind: "standard",
    debugClass: "debug-page-appendix",
    metadata,
    title: index === 0 ? "Anexos" : "Anexos (continuación)",
    description: index === 0 ? "Imágenes y evidencias asociadas a los hallazgos" : "Continuación de anexos",
    footerLabel: "Anexos",
    content: renderAppendixCard(appendix),
  }));
}

function buildFileChunks(section, files, appendices) {
  const chunks = [];

  files.forEach((file, fileIndex) => {
    const validFindings = file.findings
      .map((finding, findingIndex) => ({ finding, findingIndex }))
      .filter(({ finding }) => finding.text.trim() || finding.images.length);

    if (!validFindings.length) {
      chunks.push({
        units: 4,
        html: renderFileReviewBlock(file.name || section.fallbackName, [], false),
      });
      return;
    }

    const renderedRows = validFindings.map(({ finding, findingIndex }) => {
      const references = appendices
        .filter((appendix) => appendix.findingKey === buildFindingKey(section.title, fileIndex, findingIndex))
        .map((appendix) => `Anexo ${appendix.number}`);

      return {
        units: estimateFindingUnits(finding.text, references),
        html: renderFindingRow(finding, references),
      };
    });

    let currentRows = [];
    let currentUnits = 0;
    let continuation = false;

    renderedRows.forEach((row) => {
      if (currentRows.length > 0 && currentUnits + row.units > FILE_CHUNK_CAPACITY) {
        chunks.push({
          units: 4 + currentUnits,
          html: renderFileReviewBlock(file.name || section.fallbackName, currentRows.map((item) => item.html), continuation),
        });
        currentRows = [];
        currentUnits = 0;
        continuation = true;
      }

      currentRows.push(row);
      currentUnits += row.units;
    });

    if (currentRows.length > 0) {
      chunks.push({
        units: 4 + currentUnits,
        html: renderFileReviewBlock(file.name || section.fallbackName, currentRows.map((item) => item.html), continuation),
      });
    }
  });

  return chunks;
}

function renderPage(page, pageNumber, reviewforgeMarkSvg, pdfCoverKicker, pdfFooterNote) {
  if (page.kind === "cover") {
    return `
<section class="pdf-page pdf-page-cover ${page.debugClass}">
  <div class="pdf-page-cover-content">
    ${page.content.replace("__PDF_COVER_KICKER__", escapeHtml(pdfCoverKicker))}
  </div>
</section>`.trim();
  }

  return `
<section class="pdf-page pdf-page-standard ${page.debugClass}">
  <header class="page-header">
    ${renderPageHeader(page.metadata, reviewforgeMarkSvg)}
  </header>
  <main class="page-content">
    ${renderSectionHeading(page.title, page.description)}
    ${page.content}
  </main>
  <footer class="page-footer">
    <div class="page-footer-label">${escapeHtml(page.footerLabel || "")}</div>
    <div class="page-footer-note">${escapeHtml(pdfFooterNote)}</div>
    <div class="page-footer-line"></div>
    ${pageNumber ? `<div class="page-number">${pageNumber}</div>` : '<div class="page-number page-number-empty"></div>'}
  </footer>
</section>`.trim();
}

function renderPageHeader(metadata, reviewforgeMarkSvg) {
  return `
<div class="page-header-inner">
  ${renderPageHeaderLeft(metadata)}
  <div class="page-header-right">
    ${renderReviewforgeBrand(reviewforgeMarkSvg)}
  </div>
</div>`.trim();
}

function renderPageHeaderLeft(metadata) {
  const logo = metadata?.companyLogoDataUrl?.trim();
  const companyName = metadata?.companyName?.trim();

  if (!logo && !companyName) {
    return '<div class="page-header-left page-header-left-empty" aria-hidden="true"></div>';
  }

  return `
<div class="page-header-left">
  <div class="page-brand-group">
    ${logo ? `<img class="page-company-logo" src="${logo}" alt="${escapeHtml(companyName || "Logo de empresa")}">` : ""}
    ${companyName ? `<div class="page-company-name">${escapeHtml(companyName)}</div>` : ""}
  </div>
</div>`.trim();
}

function renderSectionHeading(title, description) {
  return `
<div class="section-heading">
  <h2 class="section-title">${escapeHtml(title)}</h2>
  <p class="section-description">${escapeHtml(description)}</p>
</div>`.trim();
}

function renderFileReviewBlock(fileName, rowHtml, continuation) {
  const title = continuation ? `${fileName} (continuación)` : fileName;

  return `
<article class="file-review-block">
  <div class="file-review-header">
    <h3 class="file-review-title">${escapeHtml(title)}</h3>
    <p class="file-description">${rowHtml.length ? "Hallazgos asociados al archivo revisado." : "Sin hallazgos registrados para este archivo."}</p>
  </div>
  ${
    rowHtml.length
      ? `
  <table class="finding-table">
    <thead>
      <tr>
        <th style="width: 28mm;">Severidad</th>
        <th>Descripción</th>
        <th style="width: 30mm;">Anexos</th>
      </tr>
    </thead>
    <tbody>
      ${rowHtml.join("")}
    </tbody>
  </table>`
      : '<div class="empty-state">Sin hallazgos.</div>'
  }
</article>`.trim();
}

function renderFindingRow(finding, references) {
  const severity = mapSeverity(finding.severity);

  return `
<tr class="finding-row">
  <td>
    <span class="severity-badge" style="background:${severity.color}; color:${severity.textColor};">${escapeHtml(severity.label)}</span>
  </td>
  <td class="finding-description-cell">${escapeHtml(finding.text || "Sin descripción.")}</td>
  <td class="finding-annexes-cell">${references.length ? `<span class="annex-ref">${escapeHtml(references.join(", "))}</span>` : "-"}</td>
</tr>`.trim();
}

function renderAppendixCard(appendix) {
  const severity = mapSeverity(appendix.severity);

  return `
<article class="appendix-card" id="${appendix.id}">
  <div class="appendix-card-header">
    <h3 class="appendix-title">Anexo ${appendix.number}</h3>
    <p class="appendix-meta">${escapeHtml(appendix.sectionTitle)} · ${escapeHtml(appendix.fileName)}</p>
  </div>
  <div class="appendix-card-body">
    <div class="appendix-grid">
      ${renderAppendixRow("Sección origen", appendix.sectionTitle)}
      ${renderAppendixRow("Archivo origen", appendix.fileName)}
      ${renderAppendixRow("Severidad", `<span class="severity-badge" style="background:${severity.color}; color:${severity.textColor};">${escapeHtml(severity.label)}</span>`)}
      ${renderAppendixRow("Imagen", appendix.image.name || "Sin nombre", true)}
      ${renderAppendixRow("Hallazgo", appendix.findingText)}
    </div>
    <div class="appendix-image-wrap">
      <img class="appendix-image" src="${appendix.image.dataUrl}" alt="${escapeHtml(appendix.image.altText || appendix.image.name || `Anexo ${appendix.number}`)}">
    </div>
  </div>
</article>`.trim();
}

function renderAppendixRow(label, value, mono = false) {
  const htmlValue = mono ? escapeHtml(value) : value.includes("<span") ? value : escapeHtml(value);
  return `
<div class="appendix-label">${escapeHtml(label)}</div>
<div class="appendix-value${mono ? " mono" : ""}">${htmlValue}</div>`.trim();
}

function renderCoverBrand(metadata) {
  const logo = metadata.companyLogoDataUrl?.trim();
  const companyName = metadata.companyName?.trim();

  return `
<div class="cover-custom-brand">
  ${logo ? `<img class="cover-company-logo" src="${logo}" alt="${escapeHtml(companyName || "Logo de empresa")}">` : ""}
  ${companyName ? `<div class="cover-company-name">${escapeHtml(companyName)}</div>` : ""}
</div>`.trim();
}

function renderReviewforgeBrand(reviewforgeMarkSvg) {
  if (!reviewforgeMarkSvg) {
    return renderWordmark("page-wordmark", "p");
  }

  return `
<div class="page-brand-lockup" aria-label="ReviewForge">
  <span class="page-brand-icon" aria-hidden="true">${reviewforgeMarkSvg}</span>
  ${renderWordmark("page-wordmark", "p")}
</div>`.trim();
}

function renderWordmark(className, tagName = "div") {
  return `<${tagName} class="${className}">Review<span>Forge</span></${tagName}>`;
}

function renderMetaRow(label, value, mono = false) {
  return `
<div class="meta-label">${escapeHtml(label)}</div>
<div class="meta-value${mono ? " mono" : ""}">${escapeHtml(value || "-")}</div>`.trim();
}

function paginateItems(items, firstCapacity, followingCapacity) {
  if (!items.length) {
    return [[]];
  }

  const pages = [];
  let current = [];
  let capacity = firstCapacity;
  let used = 0;

  items.forEach((item) => {
    const itemUnits = Math.min(item.units, capacity);

    if (current.length > 0 && used + itemUnits > capacity) {
      pages.push(current);
      current = [];
      used = 0;
      capacity = followingCapacity;
    }

    current.push(item);
    used += itemUnits;
  });

  if (current.length > 0) {
    pages.push(current);
  }

  return pages;
}

function estimateParagraphUnits(text) {
  return Math.max(2, Math.ceil(String(text || "").length / 320));
}

function estimateFindingUnits(text, references) {
  const descriptionUnits = Math.max(1, Math.ceil(String(text || "").length / 220));
  const annexUnits = references.length > 2 ? 2 : 1;
  return 1 + descriptionUnits + annexUnits;
}

function splitParagraphs(value) {
  return String(value || "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function hasCustomCoverBrand(metadata) {
  return Boolean(metadata.companyName?.trim() || metadata.companyLogoDataUrl?.trim());
}

function buildFindingKey(sectionTitle, fileIndex, findingIndex) {
  return `${sectionTitle}-${fileIndex}-${findingIndex}`;
}

function normalizeReport(reportJson) {
  if (reportJson && typeof reportJson === "object" && "review" in reportJson && reportJson.review) {
    return reportJson.review;
  }

  return reportJson;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return String(value);
  }

  return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
