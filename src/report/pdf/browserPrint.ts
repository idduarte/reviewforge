import type { Review } from "../../domain/reviewTypes";
import i18n from "../../i18n";
import { renderReportHtml } from "./reportHtmlRenderer.mjs";
import reviewforgeMarkSvg from "../../assets/reviewforge-mark.svg?raw";

const fontUrls = {
  interRegular: new URL("../../../assets/fonts/inter/inter-v20-latin_latin-ext-regular.woff2", import.meta.url).href,
  interMedium: new URL("../../../assets/fonts/inter/inter-v20-latin_latin-ext-500.woff2", import.meta.url).href,
  interSemibold: new URL("../../../assets/fonts/inter/inter-v20-latin_latin-ext-600.woff2", import.meta.url).href,
  plexRegular: new URL("../../../assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-regular.woff2", import.meta.url).href,
  plexMedium: new URL("../../../assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-500.woff2", import.meta.url).href,
  plexSemibold: new URL("../../../assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-600.woff2", import.meta.url).href,
  monoRegular: new URL("../../../assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-regular.woff2", import.meta.url).href,
  monoMedium: new URL("../../../assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-500.woff2", import.meta.url).href,
  monoSemibold: new URL("../../../assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-600.woff2", import.meta.url).href,
};

const autoPrintScript = `
<script>
window.addEventListener("load", function () {
  window.setTimeout(function () {
    window.focus();
    window.print();
  }, 180);
});

window.addEventListener("afterprint", function () {
  window.setTimeout(function () {
    window.close();
  }, 120);
});
</script>
`;

export function exportReportPdfInBrowser(review: Review): void {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("popup-blocked");
  }

  try {
    const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts);

    const html = renderReportHtml({ review }, {
      generatedAt: new Date().toISOString(),
      fonts: fontUrls,
      pdfCoverKicker: t("pdf.coverKicker"),
      pdfFooterNote: t("pdf.footerNote"),
      reviewforgeMarkSvg,
      lang: i18n.language,
      t,
    });

    const printableHtml = html.includes("</body>")
      ? html.replace("</body>", `${autoPrintScript}</body>`)
      : `${html}${autoPrintScript}`;

    printWindow.document.open();
    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.opener = null;
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
