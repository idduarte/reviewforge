import { renderReportPrintStyles } from "./reportPrintStyles.mjs";

const SECTION_DEFINITIONS = [
  { key: "schematics",          titleKey: "pdf.sectionSchematics",      fallbackKey: "pdf.fallbackSchematics" },
  { key: "bomFiles",            titleKey: "pdf.sectionBom",             fallbackKey: "pdf.fallbackBom" },
  { key: "layoutFiles",         titleKey: "pdf.sectionLayout",          fallbackKey: "pdf.fallbackLayout" },
  { key: "extraDocumentFiles",  titleKey: "pdf.sectionExtraDocuments",  fallbackKey: "pdf.fallbackExtraDocuments" },
];

const SUMMARY_FIRST_PAGE_CAPACITY = 16;
const SUMMARY_FOLLOWING_PAGE_CAPACITY = 20;
const SECTION_PAGE_CAPACITY = 15;
const FILE_CHUNK_CAPACITY = 9;

const SEVERITY_COLORS = {
  "!": { color: "#8F2F2A", textColor: "#FFFFFF" },
  "+": { color: "#9A6528", textColor: "#FFFFFF" },
  "A": { color: "#D4A72C", textColor: "#16202B" },
  "?": { color: "#4F5FA3", textColor: "#FFFFFF" },
  "*": { color: "#6B7785", textColor: "#FFFFFF" },
  "-": { color: "#3F6E8C", textColor: "#FFFFFF" },
};

const SEVERITY_LABEL_KEYS = {
  "!": "findings.fatal",
  "+": "findings.important",
  "-": "findings.minor",
  "?": "findings.question",
  "*": "findings.note",
  "A": "findings.recurring",
};

export function mapSeverity(severity, t) {
  const colors = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS["-"];
  const label = t ? t(SEVERITY_LABEL_KEYS[severity] ?? SEVERITY_LABEL_KEYS["-"]) : severity;
  return { label, ...colors };
}

export function collectAppendices(reportJson, t) {
  const review = normalizeReport(reportJson);
  const appendices = [];
  const tFn = t ?? ((key) => key);

  for (const section of SECTION_DEFINITIONS) {
    const sectionTitle = tFn(section.titleKey);
    const fallbackName = tFn(section.fallbackKey);
    const files = review[section.key] ?? [];

    files.forEach((file, fileIndex) => {
      file.findings.forEach((finding, findingIndex) => {
        finding.images.forEach((image) => {
          appendices.push({
            number: appendices.length + 1,
            id: `appendix-${appendices.length + 1}`,
            sectionTitle,
            fileName: file.name || fallbackName,
            severity: finding.severity,
            findingText: finding.text || tFn("pdf.findingFallback"),
            image,
            findingKey: buildFindingKey(section.key, fileIndex, findingIndex),
          });
        });
      });
    });
  }

  return appendices;
}

export function renderReportHtml(reportJson, options = {}) {
  const review = normalizeReport(reportJson);
  const t = options.t ?? ((key) => key);
  const lang = options.lang ?? "es";
  const appendices = collectAppendices(review, t);
  const generatedAt = options.generatedAt ? new Date(options.generatedAt) : new Date();
  const styles = options.styles ?? renderReportPrintStyles(options.fonts);
  const pages = buildReportPages(review, appendices, generatedAt, t);
  const pdfCoverKicker = options.pdfCoverKicker ?? t("pdf.coverKicker");
  const pdfFooterNote = options.pdfFooterNote ?? t("pdf.footerNote");
  const reviewforgeMarkSvg = options.reviewforgeMarkSvg ?? "";

  const htmlPages = pages
    .map((page, index) => renderPage(page, index < 2 ? null : index - 1, reviewforgeMarkSvg, pdfCoverKicker, pdfFooterNote, t))
    .join("\n");

  return [
    "<!doctype html>",
    `<html lang="${lang}">`,
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

function buildReportPages(review, appendices, generatedAt, t) {
  return [
    buildCoverPage(review, generatedAt, t),
    buildParticipantsPage(review, t),
    ...buildMeetingSummaryPages(review.metadata, t),
    ...SECTION_DEFINITIONS.flatMap((section) =>
      buildSectionPages(review.metadata, section, review[section.key] ?? [], appendices, t),
    ),
    ...buildAppendixPages(review.metadata, appendices, t),
  ];
}

function buildCoverPage(review, generatedAt, t) {
  const repository = review.metadata.svnGit.trim();
  const rows = [
    review.metadata.companyName.trim() ? renderMetaRow(t("pdf.metaCompany"), review.metadata.companyName) : "",
    renderMetaRow(t("pdf.metaSubject"), review.metadata.meetingSubject),
    renderMetaRow(t("pdf.metaReviewDate"), formatDate(review.metadata.reviewDate)),
    renderMetaRow(t("pdf.metaMeetingDate"), formatDate(review.metadata.meetingDate)),
    renderMetaRow(t("pdf.metaStartTime"), review.metadata.meetingStart),
    renderMetaRow(t("pdf.metaEndTime"), review.metadata.meetingEnd),
    renderMetaRow(t("pdf.metaPlace"), review.metadata.meetingPlace),
    renderMetaRow(t("pdf.metaRevision"), review.metadata.revision || "0"),
    repository ? renderMetaRow(t("pdf.metaSvnGit"), review.metadata.svnGit, true) : "",
    renderMetaRow(t("pdf.metaGeneratedAt"), formatDateTime(generatedAt)),
  ]
    .filter(Boolean)
    .join("");

  return {
    kind: "cover",
    debugClass: "debug-page-cover",
    content: `
      <div class="cover-brand-block">
        <h2 class="cover-kicker">__PDF_COVER_KICKER__</h2>
        ${hasCustomCoverBrand(review.metadata) ? renderCoverBrand(review.metadata, t) : renderWordmark("cover-wordmark", "h1")}
        <h1 class="cover-title">${escapeHtml(review.metadata.reviewTitle || t("pdf.coverTitleFallback"))}</h1>
      </div>
      <div class="meta-grid">
        ${rows}
      </div>
    `,
  };
}

function buildParticipantsPage(review, t) {
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
    title: t("pdf.participants"),
    description: t("pdf.participantsDescription"),
    footerLabel: t("pdf.participants"),
    content: `
      <table class="participant-table">
        <thead>
          <tr>
            <th>${t("pdf.nameColumn")}</th>
            <th>${t("pdf.initialsColumn")}</th>
            <th>${t("pdf.roleColumn")}</th>
            <th>${t("pdf.emailColumn")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr class="participant-row"><td colspan="4">${t("pdf.noParticipants")}</td></tr>`}
        </tbody>
      </table>
    `,
  };
}

function buildMeetingSummaryPages(metadata, t) {
  const paragraphs = splitParagraphs(metadata.meetingSummary);
  const title = t("pdf.meetingSummaryTitle");

  if (!paragraphs.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-summary",
        metadata,
        title,
        description: t("pdf.meetingSummaryDescription"),
        footerLabel: title,
        content: `<div class="summary-card meeting-summary-body"><p>${t("pdf.noSummary")}</p></div>`,
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
    title: index === 0 ? title : `${title} ${t("pdf.continuation")}`,
    description: index === 0 ? t("pdf.meetingSummaryDescription") : t("pdf.meetingSummaryContinuation"),
    footerLabel: title,
    content: `<div class="summary-card meeting-summary-body">${chunk.map((item) => item.html).join("")}</div>`,
  }));
}

function buildSectionPages(metadata, section, files, appendices, t) {
  const sectionTitle = t(section.titleKey);
  const fileChunks = buildFileChunks(section, files, appendices, t);

  if (!fileChunks.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-section",
        metadata,
        title: sectionTitle,
        description: t("pdf.sectionDescription", { title: sectionTitle.toLowerCase() }),
        footerLabel: sectionTitle,
        content: `<div class="empty-state">${t("pdf.noFilesInSection")}</div>`,
      },
    ];
  }

  const pages = paginateItems(fileChunks, SECTION_PAGE_CAPACITY, SECTION_PAGE_CAPACITY);

  return pages.map((pageItems, index) => ({
    kind: "standard",
    debugClass: "debug-page-section",
    metadata,
    title: index === 0 ? sectionTitle : `${sectionTitle} ${t("pdf.continuation")}`,
    description: index === 0
      ? t("pdf.sectionDescription", { title: sectionTitle.toLowerCase() })
      : t("pdf.sectionContinuationDescription", { title: sectionTitle.toLowerCase() }),
    footerLabel: sectionTitle,
    content: pageItems.map((item) => item.html).join(""),
  }));
}

function buildAppendixPages(metadata, appendices, t) {
  const title = t("pdf.annexes");

  if (!appendices.length) {
    return [
      {
        kind: "standard",
        debugClass: "debug-page-appendix",
        metadata,
        title,
        description: t("pdf.annexesDescription"),
        footerLabel: title,
        content: `<div class="empty-state">${t("pdf.noAnnexes")}</div>`,
      },
    ];
  }

  return appendices.map((appendix, index) => ({
    kind: "standard",
    debugClass: "debug-page-appendix",
    metadata,
    title: index === 0 ? title : `${title} ${t("pdf.continuation")}`,
    description: index === 0 ? t("pdf.annexesDescription") : t("pdf.annexesContinuation"),
    footerLabel: title,
    content: renderAppendixCard(appendix, t),
  }));
}

function buildFileChunks(section, files, appendices, t) {
  const fallbackName = t(section.fallbackKey);
  const chunks = [];

  files.forEach((file, fileIndex) => {
    const validFindings = file.findings
      .map((finding, findingIndex) => ({ finding, findingIndex }))
      .filter(({ finding }) => finding.text.trim() || finding.images.length);

    if (!validFindings.length) {
      chunks.push({
        units: 4,
        html: renderFileReviewBlock(file.name || fallbackName, [], false, t),
      });
      return;
    }

    const renderedRows = validFindings.map(({ finding, findingIndex }) => {
      const references = appendices
        .filter((appendix) => appendix.findingKey === buildFindingKey(section.key, fileIndex, findingIndex))
        .map((appendix) => t("pdf.appendixLabel", { number: appendix.number }));

      return {
        units: estimateFindingUnits(finding.text, references),
        html: renderFindingRow(finding, references, t),
      };
    });

    let currentRows = [];
    let currentUnits = 0;
    let continuation = false;

    renderedRows.forEach((row) => {
      if (currentRows.length > 0 && currentUnits + row.units > FILE_CHUNK_CAPACITY) {
        chunks.push({
          units: 4 + currentUnits,
          html: renderFileReviewBlock(file.name || fallbackName, currentRows.map((item) => item.html), continuation, t),
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
        html: renderFileReviewBlock(file.name || fallbackName, currentRows.map((item) => item.html), continuation, t),
      });
    }
  });

  return chunks;
}

function renderPage(page, pageNumber, reviewforgeMarkSvg, pdfCoverKicker, pdfFooterNote, t) {
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
    ${renderPageHeader(page.metadata, reviewforgeMarkSvg, t)}
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

function renderPageHeader(metadata, reviewforgeMarkSvg, t) {
  return `
<div class="page-header-inner">
  ${renderPageHeaderLeft(metadata, t)}
  <div class="page-header-right">
    ${renderReviewforgeBrand(reviewforgeMarkSvg)}
  </div>
</div>`.trim();
}

function renderPageHeaderLeft(metadata, t) {
  const logo = metadata?.companyLogoDataUrl?.trim();
  const companyName = metadata?.companyName?.trim();

  if (!logo && !companyName) {
    return '<div class="page-header-left page-header-left-empty" aria-hidden="true"></div>';
  }

  return `
<div class="page-header-left">
  <div class="page-brand-group">
    ${logo ? `<img class="page-company-logo" src="${logo}" alt="${escapeHtml(companyName || t("pdf.logoAlt"))}">` : ""}
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

function renderFileReviewBlock(fileName, rowHtml, continuation, t) {
  const title = continuation ? `${fileName} ${t("pdf.continuation")}` : fileName;
  const hasFindings = rowHtml.length > 0;

  return `
<article class="file-review-block">
  <div class="file-review-header">
    <h3 class="file-review-title">${escapeHtml(title)}</h3>
    <p class="file-description">${hasFindings ? t("pdf.findingsAssociated") : t("pdf.noFindingsForFile")}</p>
  </div>
  ${
    hasFindings
      ? `
  <table class="finding-table">
    <thead>
      <tr>
        <th style="width: 28mm;">${t("pdf.severityColumn")}</th>
        <th>${t("pdf.descriptionColumn")}</th>
        <th style="width: 30mm;">${t("pdf.annexesColumn")}</th>
      </tr>
    </thead>
    <tbody>
      ${rowHtml.join("")}
    </tbody>
  </table>`
      : `<div class="empty-state">${t("pdf.noFindings")}</div>`
  }
</article>`.trim();
}

function renderFindingRow(finding, references, t) {
  const severity = mapSeverity(finding.severity, t);

  return `
<tr class="finding-row">
  <td>
    <span class="severity-badge" style="background:${severity.color}; color:${severity.textColor};">${escapeHtml(severity.label)}</span>
  </td>
  <td class="finding-description-cell">${escapeHtml(finding.text || t("pdf.noDescription"))}</td>
  <td class="finding-annexes-cell">${references.length ? `<span class="annex-ref">${escapeHtml(references.join(", "))}</span>` : "-"}</td>
</tr>`.trim();
}

function renderAppendixCard(appendix, t) {
  const severity = mapSeverity(appendix.severity, t);

  return `
<article class="appendix-card" id="${appendix.id}">
  <div class="appendix-card-header">
    <h3 class="appendix-title">${t("pdf.appendixLabel", { number: appendix.number })}</h3>
    <p class="appendix-meta">${escapeHtml(appendix.sectionTitle)} · ${escapeHtml(appendix.fileName)}</p>
  </div>
  <div class="appendix-card-body">
    <div class="appendix-grid">
      ${renderAppendixRow(t("pdf.sectionOrigin"), appendix.sectionTitle)}
      ${renderAppendixRow(t("pdf.fileOrigin"), appendix.fileName)}
      ${renderAppendixRow(t("pdf.severityLabel"), `<span class="severity-badge" style="background:${severity.color}; color:${severity.textColor};">${escapeHtml(severity.label)}</span>`)}
      ${renderAppendixRow(t("pdf.imageLabel"), appendix.image.name || t("pdf.noImageName"), true)}
      ${renderAppendixRow(t("pdf.findingLabel"), appendix.findingText)}
    </div>
    <div class="appendix-image-wrap">
      <img class="appendix-image" src="${appendix.image.dataUrl}" alt="${escapeHtml(appendix.image.altText || appendix.image.name || t("pdf.appendixLabel", { number: appendix.number }))}">
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

function renderCoverBrand(metadata, t) {
  const logo = metadata.companyLogoDataUrl?.trim();
  const companyName = metadata.companyName?.trim();

  return `
<div class="cover-custom-brand">
  ${logo ? `<img class="cover-company-logo" src="${logo}" alt="${escapeHtml(companyName || t("pdf.logoAlt"))}">` : ""}
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
  if (!items.length) return [[]];

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

  if (current.length > 0) pages.push(current);

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

function buildFindingKey(sectionKey, fileIndex, findingIndex) {
  return `${sectionKey}-${fileIndex}-${findingIndex}`;
}

function normalizeReport(reportJson) {
  if (reportJson && typeof reportJson === "object" && "review" in reportJson && reportJson.review) {
    return reportJson.review;
  }

  return reportJson;
}

function formatDate(value) {
  if (!value) return "-";

  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return String(value);

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
