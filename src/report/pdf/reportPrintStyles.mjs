export function renderReportPrintStyles(fonts = {}) {
  const interRegular = fonts.interRegular ?? "";
  const interMedium = fonts.interMedium ?? interRegular;
  const interSemibold = fonts.interSemibold ?? interMedium;
  const plexRegular = fonts.plexRegular ?? interRegular;
  const plexMedium = fonts.plexMedium ?? plexRegular;
  const plexSemibold = fonts.plexSemibold ?? plexMedium;
  const monoRegular = fonts.monoRegular ?? interRegular;
  const monoMedium = fonts.monoMedium ?? monoRegular;
  const monoSemibold = fonts.monoSemibold ?? monoMedium;

  return `
@page {
  size: A4;
  margin: 0;
}

@font-face {
  font-family: "Inter";
  src: url("${interRegular}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("${interMedium}") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("${interSemibold}") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Sans";
  src: url("${plexRegular}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Sans";
  src: url("${plexMedium}") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "IBM Plex Sans";
  src: url("${plexSemibold}") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("${monoRegular}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("${monoMedium}") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("${monoSemibold}") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-ui: "Inter", system-ui, sans-serif;
  --font-content: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --color-text: #16202B;
  --color-muted: #617182;
  --color-border: #D4DDE7;
  --color-soft: #F5F7FA;
  --color-primary: #48667F;
  --color-primary-dark: #364D60;
  --color-minor: #3F6E8C;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: var(--color-text);
  font-family: var(--font-ui);
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

body {
  font-size: 10.5pt;
  line-height: 1.45;
}

.report-root {
  width: 210mm;
  margin: 0 auto;
  padding: 0;
}

.pdf-page {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 12mm 16mm 12mm;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #ffffff;
  page-break-after: always;
  break-after: page;
  overflow: hidden;
}

.pdf-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.pdf-page-cover {
  padding: 16mm 16mm 18mm;
}

.pdf-page-cover-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10mm;
}

.pdf-page-standard {
  padding-top: 10mm;
  padding-bottom: 10mm;
}

.page-header {
  flex: 0 0 12mm;
  margin-bottom: 7mm;
}

.page-header-inner {
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8mm;
  padding-top: 0.5mm;
  border-bottom: 1.6px solid var(--color-minor);
}

.page-header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
}

.page-header-left-empty {
  min-height: 1px;
}

.page-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
}

.page-brand-lockup {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3mm;
}

.page-brand-icon {
  display: inline-flex;
  width: 8.4mm;
  height: 8.4mm;
  flex: 0 0 auto;
}

.page-brand-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.page-brand-group {
  display: inline-flex;
  align-items: center;
  gap: 4mm;
  min-width: 0;
  max-width: 112mm;
}

.page-company-logo {
  width: auto;
  height: auto;
  max-height: 8mm;
  max-width: 28mm;
  object-fit: contain;
  flex: 0 0 auto;
}

.page-company-name {
  font-size: 11pt;
  line-height: 1.1;
  font-weight: 600;
  color: var(--color-primary-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-wordmark {
  margin: 0;
  font-size: 16pt;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #6B7785;
}

.page-wordmark span {
  color: #3F6E8C;
}

.page-content {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-footer {
  flex: 0 0 8mm;
  margin-top: 7mm;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "line line line"
    "label note number";
  align-items: end;
  row-gap: 2mm;
  column-gap: 4mm;
}

.page-footer-line {
  grid-area: line;
  border-top: 1.6px solid var(--color-minor);
  align-self: stretch;
}

.page-footer-label {
  grid-area: label;
  color: var(--color-muted);
  font-size: 9pt;
  font-weight: 500;
  justify-self: start;
  white-space: nowrap;
}

.page-footer-note {
  grid-area: note;
  color: var(--color-muted);
  font-size: 8.5pt;
  font-weight: 400;
  text-align: center;
  justify-self: center;
}

.page-number {
  grid-area: number;
}

.page-number {
  min-width: 8mm;
  text-align: right;
  color: var(--color-muted);
  font-size: 9pt;
  font-weight: 500;
}

.page-number-empty {
  visibility: hidden;
}

.cover-brand-block {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.cover-kicker {
  margin: 0;
  color: var(--color-primary);
  font-size: 20pt;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.cover-wordmark {
  width: 100%;
  margin: 30mm auto 50mm;
  font-size: 58pt;
  line-height: 0.94;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: #6B7785;
}

.cover-wordmark span {
  color: #3F6E8C;
}

.cover-custom-brand {
  width: 100%;
  margin: 30mm auto 50mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8mm;
}

.cover-company-logo {
  max-width: 70%;
  width: auto;
  height: auto;
  max-height: 15mm;
  object-fit: contain;
}

.cover-company-name {
  margin: 0;
  font-size: 20pt;
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--color-primary-dark);
}

.cover-title {
  margin: 0;
  font-size: 24pt;
  line-height: 1.1;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.meta-grid {
  display: grid;
  grid-template-columns: 52mm 1fr;
  gap: 3mm 8mm;
  padding: 8mm;
  border: 1px solid var(--color-border);
  background: var(--color-soft);
  border-radius: 6px;
}

.meta-label {
  font-weight: 600;
  color: var(--color-primary-dark);
}

.meta-value {
  color: var(--color-text);
}

.section-heading {
  flex: 0 0 auto;
  margin: 0 0 8mm;
  padding-bottom: 3mm;
  border-bottom: 2px solid var(--color-border);
}

.section-title {
  margin: 0;
  font-size: 18pt;
  line-height: 1.15;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.section-description {
  margin: 2mm 0 0;
  color: var(--color-muted);
  font-size: 10pt;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 3.2mm 3.4mm;
  border: 1px solid var(--color-border);
  vertical-align: top;
}

th {
  background: var(--color-soft);
  color: var(--color-primary-dark);
  font-size: 9pt;
  font-weight: 600;
  text-align: left;
}

td {
  font-family: var(--font-content);
}

.summary-card {
  padding: 4.2mm 4.4mm;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: #ffffff;
}

.meeting-summary-body p {
  margin: 0 0 4mm;
  text-align: justify;
  text-justify: inter-word;
}

.meeting-summary-body p:last-child {
  margin-bottom: 0;
}

.participant-table td:last-child,
.finding-table td:nth-child(2),
.appendix-card-body,
.file-description {
  font-family: var(--font-content);
}

.file-review-block {
  margin: 0 0 8mm;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.file-review-block:last-child {
  margin-bottom: 0;
}

.file-review-header {
  padding: 4.2mm 4.4mm;
  background: var(--color-soft);
  border-bottom: 1px solid var(--color-border);
}

.file-review-title {
  margin: 0;
  font-size: 12pt;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.file-description {
  margin: 1.5mm 0 0;
  color: var(--color-muted);
  font-size: 9.5pt;
}

.finding-table td {
  font-size: 9.5pt;
}

.finding-description-cell {
  text-align: justify;
  text-justify: inter-word;
}

.finding-annexes-cell {
  text-align: left;
}

.severity-badge {
  display: inline-block;
  min-width: 22mm;
  padding: 1.6mm 2.4mm;
  border-radius: 999px;
  font-size: 8.5pt;
  font-weight: 600;
  text-align: center;
}

.annex-ref {
  color: var(--color-primary-dark);
  font-weight: 500;
}

.empty-state {
  padding: 4.2mm 4.4mm;
  color: var(--color-muted);
  font-style: italic;
  font-family: var(--font-content);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.appendix-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.appendix-card-header {
  padding: 4mm 4.4mm;
  background: var(--color-soft);
  border-bottom: 1px solid var(--color-border);
}

.appendix-title {
  margin: 0;
  font-size: 12pt;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.appendix-meta {
  margin: 1.5mm 0 0;
  color: var(--color-muted);
  font-size: 9pt;
}

.appendix-card-body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 5mm;
  padding: 4.4mm;
  overflow: hidden;
}

.appendix-grid {
  display: grid;
  grid-template-columns: 40mm 1fr;
  gap: 3mm 8mm;
  align-content: start;
}

.appendix-label {
  font-weight: 600;
  color: var(--color-primary-dark);
}

.appendix-value {
  color: var(--color-text);
}

.appendix-image-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  padding: 4mm;
  border: 1px solid var(--color-border);
  background: #ffffff;
  overflow: hidden;
}

.appendix-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.mono {
  font-family: var(--font-mono);
}

`.trim();
}
