import type { BomFile, ExtraDocumentFile, Finding, LayoutFile, Participant, Review, ReviewMetadata, SchematicFile } from "./reviewTypes";

export function createMetadata(): ReviewMetadata {
  return {
    reviewTitle: "",
    reviewDate: "",
    meetingDate: "",
    meetingStart: "",
    meetingEnd: "",
    meetingPlace: "",
    meetingSubject: "",
    svnGit: "",
    revision: "",
    meetingSummary: "",
    companyName: "",
    companyLogoDataUrl: "",
  };
}

export function createParticipant(): Participant {
  return { name: "", initials: "", role: "", email: "" };
}

export function createFinding(): Finding {
  return { severity: "-", text: "", images: [] };
}

export function createSchematic(): SchematicFile {
  return { name: "", findings: [] };
}

export function createBomFile(): BomFile {
  return { name: "", findings: [] };
}

export function createLayoutFile(): LayoutFile {
  return { name: "", findings: [] };
}

export function createExtraDocumentFile(): ExtraDocumentFile {
  return { name: "", findings: [] };
}

export function createReview(): Review {
  return {
    metadata: createMetadata(),
    participants: [createParticipant()],
    schematics: [],
    bomFiles: [],
    layoutFiles: [],
    extraDocumentFiles: [],
  };
}
