import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const modules = import.meta.glob("./locales/*.json", { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;

const resources: Record<string, { translation: Record<string, unknown> }> = {};

for (const path in modules) {
  const match = path.match(/\/([a-z]{2,5})\.json$/);
  if (match) {
    resources[match[1]] = { translation: modules[path].default };
  }
}

const supportedLangs = Object.keys(resources);
const savedLang = localStorage.getItem("lang");
const browserCode = navigator.language.slice(0, 2);
const defaultLang =
  savedLang && supportedLangs.includes(savedLang)
    ? savedLang
    : supportedLangs.includes(browserCode)
      ? browserCode
      : supportedLangs[0] ?? "en";

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: supportedLangs[0] ?? "en",
  interpolation: { escapeValue: false },
});

export default i18n;
