import { createReview } from "./reviewDefaults";
import type { Review } from "./reviewTypes";

const saveVersion = 1;

export interface SavedReviewFile {
  version: number;
  savedAt: string;
  review: Review;
}

export function createSavedReview(review: Review): SavedReviewFile {
  return {
    version: saveVersion,
    savedAt: new Date().toISOString(),
    review,
  };
}

export function parseSavedReview(value: string): Review {
  const parsed = JSON.parse(value) as Partial<SavedReviewFile>;

  if (parsed.version !== saveVersion || !parsed.review) {
    throw new Error("Archivo de avance no compatible.");
  }

  const defaultReview = createReview();

  return {
    ...defaultReview,
    ...parsed.review,
    metadata: {
      ...defaultReview.metadata,
      ...parsed.review.metadata,
    },
    participants: parsed.review.participants ?? defaultReview.participants,
    schematics: parsed.review.schematics ?? defaultReview.schematics,
    bomFiles: parsed.review.bomFiles ?? defaultReview.bomFiles,
    layoutFiles: parsed.review.layoutFiles ?? defaultReview.layoutFiles,
    extraDocumentFiles: parsed.review.extraDocumentFiles ?? defaultReview.extraDocumentFiles,
  };
}

export function buildSaveFileName(title: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const slug = (title || "reviewforge-avance")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${slug}-${timestamp}.json`;
}
