export type TabId = "meta" | "schematics" | "bom" | "layout" | "extraDocuments" | "output";

export type FindingSeverity = "!" | "+" | "-" | "?" | "*" | "A";

export interface Participant {
  name: string;
  initials: string;
  role: string;
  email: string;
}

export interface Finding {
  severity: FindingSeverity;
  text: string;
  images: FindingImage[];
}

export interface FindingImage {
  id: string;
  name: string;
  dataUrl: string;
  altText: string;
}

export interface SchematicFile {
  name: string;
  findings: Finding[];
}

export interface BomFile {
  name: string;
  findings: Finding[];
}

export interface LayoutFile {
  name: string;
  findings: Finding[];
}

export interface ExtraDocumentFile {
  name: string;
  findings: Finding[];
}

export interface ReviewMetadata {
  reviewTitle: string;
  reviewDate: string;
  meetingDate: string;
  meetingStart: string;
  meetingEnd: string;
  meetingPlace: string;
  meetingSubject: string;
  svnGit: string;
  revision: string;
  meetingSummary: string;
  companyName: string;
  companyLogoDataUrl: string;
}

export interface Review {
  metadata: ReviewMetadata;
  participants: Participant[];
  schematics: SchematicFile[];
  bomFiles: BomFile[];
  layoutFiles: LayoutFile[];
  extraDocumentFiles: ExtraDocumentFile[];
}
