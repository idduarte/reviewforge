/// <reference types="vite/client" />

declare module "*.mjs" {
  const value: any;
  export default value;
  export const renderReportHtml: any;
  export const renderReportPrintStyles: any;
  export const mapSeverity: any;
  export const collectAppendices: any;
  export const exportReportPdf: any;
}
