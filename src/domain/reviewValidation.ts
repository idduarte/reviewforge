import type { BomFile, ExtraDocumentFile, Finding, LayoutFile, Participant, Review, ReviewMetadata, SchematicFile } from "./reviewTypes";

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

const requiredMetadataFields: Array<{ key: keyof ReviewMetadata; label: string }> = [
  { key: "reviewTitle", label: "Título de la revisión" },
  { key: "reviewDate", label: "Fecha de revisión" },
  { key: "meetingDate", label: "Fecha de reunión" },
  { key: "meetingStart", label: "Hora inicio" },
  { key: "meetingEnd", label: "Hora fin" },
  { key: "meetingPlace", label: "Lugar" },
  { key: "meetingSubject", label: "Asunto" },
  { key: "revision", label: "Revisión #" },
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
  const participantList = review.participants.length === 0 ? "Debe existir al menos un participante." : undefined;
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

  requiredMetadataFields.forEach(({ key, label }) => {
    if (!metadata[key].trim()) {
      errors[key] = `${label} es obligatorio.`;
    }
  });

  if (metadata.svnGit.trim() && !repositoryPattern.test(metadata.svnGit.trim())) {
    errors.svnGit = "Ingresa una URL o ruta de repositorio válida.";
  }

  if (metadata.meetingStart && metadata.meetingEnd && metadata.meetingStart >= metadata.meetingEnd) {
    errors.meetingEnd = "La hora fin debe ser posterior a la hora inicio.";
  }

  return errors;
}

function validateParticipant(participant: Participant): Partial<Record<keyof Participant, string>> {
  const errors: Partial<Record<keyof Participant, string>> = {};

  if (!participant.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  }

  if (!participant.initials.trim()) {
    errors.initials = "Las iniciales son obligatorias.";
  }

  if (!participant.role.trim()) {
    errors.role = "El rol/cargo es obligatorio.";
  }

  if (!participant.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!emailPattern.test(participant.email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }

  return errors;
}

function validateNamedFile(file: SchematicFile | BomFile | LayoutFile | ExtraDocumentFile): { name?: string } {
  if (!file.name.trim()) {
    return { name: "El nombre del archivo es obligatorio." };
  }

  return {};
}

function validateFinding(finding: Finding): { text?: string } {
  if (!finding.text.trim()) {
    return { text: "La descripción del hallazgo es obligatoria." };
  }

  return {};
}
