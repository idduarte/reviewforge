import type { BomFile, ExtraDocumentFile, Finding, LayoutFile, Participant, Review, ReviewMetadata, SchematicFile } from "./reviewTypes";
import i18n from "../i18n";

export type MetadataErrors = Partial<Record<keyof ReviewMetadata, string>>;
export type ParticipantErrors = Array<Partial<Record<keyof Participant, string>>>;
export type NamedFileErrors = Array<{ name?: string }>;
export type FindingErrors = Array<{ text?: string }>;
export type SectionFindingErrors = Array<FindingErrors>;

export interface ReviewValidationResult {
  metadata: MetadataErrors;
  participants: ParticipantErrors;
  schematics: NamedFileErrors;
  bomFiles: NamedFileErrors;
  layoutFiles: NamedFileErrors;
  extraDocumentFiles: NamedFileErrors;
  schematicFindings: SectionFindingErrors;
  bomFindings: SectionFindingErrors;
  layoutFindings: SectionFindingErrors;
  extraDocumentFindings: SectionFindingErrors;
  participantList?: string;
  isValid: boolean;
}

const requiredMetadataFields: Array<{ key: keyof ReviewMetadata; labelKey: string }> = [
  { key: "reviewTitle", labelKey: "meta.reviewTitle" },
  { key: "reviewDate", labelKey: "meta.reviewDate" },
  { key: "meetingDate", labelKey: "meta.meetingDate" },
  { key: "meetingStart", labelKey: "meta.meetingStart" },
  { key: "meetingEnd", labelKey: "meta.meetingEnd" },
  { key: "meetingPlace", labelKey: "meta.meetingPlace" },
  { key: "meetingSubject", labelKey: "meta.meetingSubject" },
  { key: "revision", labelKey: "meta.revision" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const repositoryPattern = /^(https?:\/\/|ssh:\/\/|git@|svn:\/\/).+/i;

export function validateReview(review: Review): ReviewValidationResult {
  const metadata = validateMetadata(review.metadata);
  const participants = review.participants.map(validateParticipant);
  const schematics = review.schematics.map(validateNamedFile);
  const bomFiles = review.bomFiles.map(validateNamedFile);
  const layoutFiles = review.layoutFiles.map(validateNamedFile);
  const extraDocumentFiles = review.extraDocumentFiles.map(validateNamedFile);
  const schematicFindings = review.schematics.map((file) => file.findings.map(validateFinding));
  const bomFindings = review.bomFiles.map((file) => file.findings.map(validateFinding));
  const layoutFindings = review.layoutFiles.map((file) => file.findings.map(validateFinding));
  const extraDocumentFindings = review.extraDocumentFiles.map((file) => file.findings.map(validateFinding));
  const participantList = review.participants.length === 0 ? i18n.t("validation.noParticipants") : undefined;
  const hasParticipantErrors = participants.some((participantErrors) => Object.keys(participantErrors).length > 0);
  const hasFileErrors = [schematics, bomFiles, layoutFiles, extraDocumentFiles]
    .some((group) => group.some((fileErrors) => Object.keys(fileErrors).length > 0));
  const hasFindingErrors = [schematicFindings, bomFindings, layoutFindings, extraDocumentFindings]
    .some((group) => group.some((fileFindings) => fileFindings.some((findingErrors) => Object.keys(findingErrors).length > 0)));

  return {
    metadata,
    participants,
    schematics,
    bomFiles,
    layoutFiles,
    extraDocumentFiles,
    schematicFindings,
    bomFindings,
    layoutFindings,
    extraDocumentFindings,
    participantList,
    isValid: Object.keys(metadata).length === 0 && !hasParticipantErrors && !hasFileErrors && !hasFindingErrors && !participantList,
  };
}

function validateMetadata(metadata: ReviewMetadata): MetadataErrors {
  const errors: MetadataErrors = {};

  requiredMetadataFields.forEach(({ key, labelKey }) => {
    if (!metadata[key].trim()) {
      errors[key] = i18n.t("validation.required", { field: i18n.t(labelKey) });
    }
  });

  if (metadata.svnGit.trim() && !repositoryPattern.test(metadata.svnGit.trim())) {
    errors.svnGit = i18n.t("validation.invalidRepo");
  }

  if (metadata.meetingStart && metadata.meetingEnd && metadata.meetingStart >= metadata.meetingEnd) {
    errors.meetingEnd = i18n.t("validation.invalidTimeRange");
  }

  return errors;
}

function validateParticipant(participant: Participant): Partial<Record<keyof Participant, string>> {
  const errors: Partial<Record<keyof Participant, string>> = {};

  if (!participant.name.trim()) errors.name = i18n.t("validation.nameRequired");
  if (!participant.initials.trim()) errors.initials = i18n.t("validation.initialsRequired");
  if (!participant.role.trim()) errors.role = i18n.t("validation.roleRequired");

  if (!participant.email.trim()) {
    errors.email = i18n.t("validation.emailRequired");
  } else if (!emailPattern.test(participant.email.trim())) {
    errors.email = i18n.t("validation.invalidEmail");
  }

  return errors;
}

function validateNamedFile(file: SchematicFile | BomFile | LayoutFile | ExtraDocumentFile): { name?: string } {
  if (!file.name.trim()) {
    return { name: i18n.t("validation.fileNameRequired") };
  }

  return {};
}

function validateFinding(finding: Finding): { text?: string } {
  if (!finding.text.trim()) {
    return { text: i18n.t("validation.findingRequired") };
  }

  return {};
}
