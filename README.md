# ReviewForge

Herramienta frontend para la generación y edición de informes de revisión técnica. Permite estructurar hallazgos, participantes, esquemáticos, BOM y documentos adicionales, y exportar el resultado como PDF o texto estructurado.

## Stack

- React 19 + TypeScript 5
- Vite 7
- Tailwind CSS 4
- FontAwesome (SVG core)

---

## Requisitos

- [Node.js](https://nodejs.org/) >= 22 (LTS recomendado — ver `.nvmrc`)
- npm >= 10

---

## Instalación

```bash
npm install
```

---

## Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Build de producción

```bash
npm run build
```

Genera los archivos estáticos en `dist/`.

---

## Preview local del build

```bash
npm run preview
```

Sirve el contenido de `dist/` localmente para validar el build antes de desplegar.

---

## Despliegue

La aplicación se despliega automáticamente en **Cloudflare Pages** mediante GitHub Actions cada vez que se hace push a `main`.

### URL de producción

```
https://reviewforge.pages.dev
```

### Flujo de CI/CD

```
push a main
  └─► GitHub Actions (.github/workflows/deploy-cloudflare-pages.yml)
        ├── npm ci
        ├── npm run build  (genera dist/)
        └── wrangler pages deploy dist --project-name=reviewforge
```

---

## Secrets y variables requeridos en GitHub

Configurar en **Settings → Secrets and variables → Actions** del repositorio:

### Secrets (valores sensibles)

| Nombre | Descripción |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API Token de Cloudflare con permiso **Cloudflare Pages: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | ID de la cuenta de Cloudflare (visible en el dashboard) |

### Variables (no sensibles)

No se usan variables de entorno de Actions en este proyecto. El nombre del proyecto Cloudflare Pages (`reviewforge`) está declarado directamente en el workflow.

> Para cambiar el nombre del proyecto Cloudflare Pages, editar la línea `command:` en `.github/workflows/deploy-cloudflare-pages.yml`.

---

## Configuración manual requerida en Cloudflare

1. Crear el proyecto en Cloudflare Pages como **Direct Upload** (no conectar el repositorio Git de Cloudflare — el deploy lo gestiona GitHub Actions).
2. Obtener el **Account ID** desde el dashboard de Cloudflare (columna derecha al entrar).
3. Crear un **API Token** en `My Profile → API Tokens → Create Token`:
   - Usar la plantilla **Edit Cloudflare Pages** o configurar permisos:
     - `Account → Cloudflare Pages → Edit`
   - Restringir a la cuenta correspondiente.
4. Añadir `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` como secrets en GitHub.

---

## Estructura del proyecto

```
ReviewForge/
├── src/
│   ├── components/       # Componentes React (editores, tabs, preview)
│   ├── domain/           # Tipos, validación, persistencia, formateo
│   ├── report/           # Lógica de exportación PDF
│   └── content/          # Textos estáticos de la app
├── public/               # Assets públicos (favicon)
├── assets/fonts/         # Fuentes locales (Inter, IBM Plex Sans, JetBrains Mono)
├── scripts/              # Script de exportación PDF (Node)
├── .github/workflows/    # Pipeline CI/CD
└── dist/                 # Build generado (no versionado)
```

---

## Notas sobre Cloudflare Pages

- El proyecto se despliega como **sitio estático puro** — no requiere Workers ni funciones serverless.
- Las fuentes se sirven desde `assets/fonts/` incluidas en el build (sin CDN externo).
- La app es una SPA sin client-side routing (no requiere `_redirects` ni configuración de rutas).
- El directorio de deploy es `dist/` generado por `vite build`.
