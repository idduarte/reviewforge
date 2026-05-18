/**
 * Minimal markdown → HTML converter.
 * Supported: ## H2, ### H3, **bold**, *italic*, - unordered lists, 1. ordered lists.
 * Blank lines separate paragraphs.
 */
export function markdownToHtml(text: string): string {
  if (!String(text || "").trim()) return "";

  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") { i++; continue; }

    const hMatch = line.match(/^(#{1,})\s+(.*)/);
    if (hMatch) {
      const raw = hMatch[1].length;
      const lvl = 2;
      const upper = raw === 1 ? ` style="text-transform:uppercase"` : "";
      out.push(`<h${lvl}${upper}>${inline(hMatch[2])}</h${lvl}>`);
      i++; continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s*/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s*/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#+\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      para.push(inline(lines[i]));
      i++;
    }
    if (para.length) out.push(`<p>${para.join("<br>")}</p>`);
  }

  return out.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}
