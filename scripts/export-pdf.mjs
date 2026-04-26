import { exportReportPdf } from "../src/report/pdf/exportPdf.mjs";

async function main() {
  const [inputJsonPath, outputPdfPath] = process.argv.slice(2);

  if (!inputJsonPath || !outputPdfPath) {
    console.error("Uso: npm run export:pdf -- <input-json> <output-pdf>");
    process.exitCode = 1;
    return;
  }

  try {
    await exportReportPdf(inputJsonPath, outputPdfPath);
    console.log(`PDF generado en ${outputPdfPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
