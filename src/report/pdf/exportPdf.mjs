import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { renderReportHtml } from "./reportHtmlRenderer.mjs";

const BROWSER_CANDIDATES = [
  process.env.REVIEWFORGE_PDF_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter(Boolean);

export async function exportReportPdf(inputJsonPath, outputPdfPath) {
  const resolvedInput = resolve(inputJsonPath);
  const resolvedOutput = resolve(outputPdfPath);
  const browserPath = await resolveBrowserPath();
  const reportJson = JSON.parse(await readFile(resolvedInput, "utf8"));
  const html = renderReportHtml(reportJson, {
    generatedAt: new Date().toISOString(),
    fonts: resolveFontUrls(),
    pdfCoverKicker: await readContentText("src/content/pdf-cover-kicker.txt"),
    pdfFooterNote: await readContentText("src/content/pdf-footer-note.txt"),
    reviewforgeMarkSvg: await readReviewforgeMarkSvg(),
  });

  await mkdir(dirname(resolvedOutput), { recursive: true });

  const tempDir = await mkdtemp(resolve(tmpdir(), "reviewforge-pdf-"));
  const htmlPath = resolve(tempDir, "report.html");

  try {
    await writeFile(htmlPath, html, "utf8");
    await runBrowserPrint(browserPath, htmlPath, resolvedOutput);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function resolveBrowserPath() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (!candidate) {
      continue;
    }

    try {
      await readFile(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("No se encontró Microsoft Edge o Google Chrome para exportar el PDF.");
}

function resolveFontUrls() {
  const repoRoot = resolve(process.cwd());
  const toFileUrl = (relativePath) => pathToFileURL(resolve(repoRoot, relativePath)).href;

  return {
    interRegular: toFileUrl("assets/fonts/inter/inter-v20-latin_latin-ext-regular.woff2"),
    interMedium: toFileUrl("assets/fonts/inter/inter-v20-latin_latin-ext-500.woff2"),
    interSemibold: toFileUrl("assets/fonts/inter/inter-v20-latin_latin-ext-600.woff2"),
    plexRegular: toFileUrl("assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-regular.woff2"),
    plexMedium: toFileUrl("assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-500.woff2"),
    plexSemibold: toFileUrl("assets/fonts/ibm-plex-sans/ibm-plex-sans-v23-latin_latin-ext-600.woff2"),
    monoRegular: toFileUrl("assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-regular.woff2"),
    monoMedium: toFileUrl("assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-500.woff2"),
    monoSemibold: toFileUrl("assets/fonts/jetbrains-mono/jetbrains-mono-v24-latin_latin-ext-600.woff2"),
  };
}

async function readReviewforgeMarkSvg() {
  const repoRoot = resolve(process.cwd());
  return readFile(resolve(repoRoot, "src/assets/reviewforge-mark.svg"), "utf8");
}

async function readContentText(relativePath) {
  const repoRoot = resolve(process.cwd());
  return (await readFile(resolve(repoRoot, relativePath), "utf8")).trim();
}

function runBrowserPrint(browserPath, htmlPath, outputPdfPath) {
  const htmlUrl = pathToFileURL(htmlPath).href;

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--allow-file-access-from-files",
    "--enable-local-file-accesses",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=2000",
    `--print-to-pdf=${outputPdfPath}`,
    "--print-to-pdf-no-header",
    htmlUrl,
  ];

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(browserPath, args, { stdio: "pipe" });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      rejectPromise(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(stderr.trim() || `La exportación PDF terminó con código ${code}.`));
    });
  });
}
