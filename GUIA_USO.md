# Guía de usuario de ReviewForge

ReviewForge es una aplicación web para preparar informes de revisión técnica. Permite registrar información general de la revisión, participantes, archivos revisados, hallazgos, imágenes de soporte, anexos y generar un resumen final en formato Markdown.

Esta guía está pensada para usuarios que usan la aplicación desde un sitio web ya publicado.

## 1. Iniciar un informe

Abre ReviewForge desde el enlace del sitio web proporcionado por tu equipo.

Al entrar, verás una barra superior con las secciones principales de la aplicación:

- **Encabezado**
- **Esquemáticos**
- **BOM**
- **Layout**
- **Documentos extra**
- **Resumen**

En la esquina superior derecha también encontrarás dos botones:

- **Guardar avance**: descarga un archivo para continuar el informe después.
- **Restaurar avance**: carga un archivo guardado previamente.

## 2. Completar el encabezado

En la pestaña **Encabezado**, diligencia la información general de la revisión.

Campos obligatorios:

- **Título de la revisión**
- **Fecha de revisión**
- **Fecha de reunión**
- **Hora inicio**
- **Hora fin**
- **Lugar**
- **Asunto**
- **Revisión #**

Campo opcional:

- **SVN/GIT**

Si escribes algo en **SVN/GIT**, debe tener formato de ruta o URL de repositorio. Ejemplos:

```txt
https://gitlab.com/grupo/proyecto
git@github.com:grupo/proyecto.git
svn://servidor/repositorio
```

La **hora fin** debe ser posterior a la **hora inicio**.

## 3. Agregar participantes

En la misma pestaña **Encabezado**, completa la sección **Participantes**.

Debe existir al menos un participante.

Cada participante debe tener:

- **Nombre completo**
- **Iniciales**
- **Rol/cargo**
- **Email**

El correo debe tener un formato válido. Ejemplo:

```txt
nombre.apellido@empresa.com
```

Para agregar participantes adicionales, usa:

```txt
+ Añadir participante
```

Para eliminar un participante, usa el botón `x` al final de su fila.

## 4. Registrar archivos de esquemáticos

En la pestaña **Esquemáticos**, registra los archivos revisados.

Para cada archivo:

1. Escribe el nombre del archivo.
2. Agrega hallazgos con **+ Hallazgo**.
3. Selecciona la severidad del hallazgo.
4. Escribe la descripción.
5. Adjunta imágenes si aplica.

Ejemplo de nombre de archivo:

```txt
main-board-test-01.sch
```

Puedes agregar tantos archivos como necesites.

## 5. Registrar archivos BOM

En la pestaña **BOM**, registra los archivos de lista de materiales revisados.

Ejemplos:

```txt
main-board-bom.xlsx
component-list.csv
```

Cada archivo BOM puede tener sus propios hallazgos e imágenes.

## 6. Registrar archivos de layout

En la pestaña **Layout**, registra los archivos de layout revisados.

Ejemplos:

```txt
main-board-layout.PcbDoc
```

Cada archivo de layout puede tener sus propios hallazgos e imágenes.

## 7. Registrar documentos extra

Usa la pestaña **Documentos extra** para registrar cualquier material adicional revisado.

Ejemplos:

```txt
pcb-review-gerbers.zip
checklist-review.pdf
thermal-report.pdf
test-plan.docx
```

Cada documento puede tener sus propios hallazgos e imágenes.

## 8. Crear hallazgos

Cada hallazgo tiene:

- Una severidad.
- Una descripción.
- Imágenes opcionales.

Severidades disponibles:

- **Fatal**
- **Importante**
- **Menor**
- **Pregunta**
- **Nota**
- **Recurrente**

Usa una descripción clara y accionable. Por ejemplo:

```txt
El conector J3 no tiene referencia de pin 1 visible en el esquemático.
```

Para eliminar un hallazgo, usa el botón `x` dentro del bloque del hallazgo.

## 9. Adjuntar imágenes a hallazgos

Cada hallazgo puede tener imágenes asociadas.

Puedes agregarlas de tres formas:

1. Hacer clic en **Añadir imagen**.
2. Pegar una captura desde el portapapeles con `Ctrl + V`.
3. Arrastrar y soltar una o varias imágenes sobre el bloque del hallazgo.

Formatos permitidos:

- PNG
- JPG/JPEG
- WEBP

Tamaño máximo:

```txt
2 MB por imagen
```

Cuando pegas una captura desde el portapapeles, ReviewForge le asigna automáticamente un nombre único.

Ejemplo:

```txt
captura-2026-04-24-21-35-12-a8f31c2d.png
```

Para cada imagen puedes escribir un texto alternativo o pie de imagen. Ese texto aparecerá en la sección de anexos.

## 10. Revisar anexos

Las imágenes adjuntas no se insertan dentro de la descripción del hallazgo.

En la pestaña **Resumen**, los hallazgos se muestran en una tabla con estas columnas:

- **Severidad**
- **Descripción**
- **Anexos**

Si un hallazgo tiene imágenes, la columna **Anexos** mostrará enlaces como:

```txt
Anexo 1
Anexo 2
```

Al hacer clic en un anexo, la página navega directamente a la imagen correspondiente en la sección **Anexos**.

La sección **Anexos** aparece al final del resumen e incluye:

- Número de anexo.
- Archivo relacionado.
- Texto del hallazgo.
- Imagen.
- Pie o texto alternativo, si fue diligenciado.

## 11. Validar el informe

La pestaña **Resumen** muestra el informe final.

Si falta información obligatoria o hay formatos inválidos, ReviewForge mostrará una lista de errores en la parte superior.

Mientras existan errores:

- No podrás copiar el Markdown.
- No podrás descargar el Markdown.

Corrige los errores en las pestañas correspondientes y vuelve a **Resumen**.

## 12. Copiar el Markdown

En la pestaña **Resumen**, usa el botón con icono de copiar para copiar el Markdown al portapapeles.

Este botón solo estará disponible cuando el informe sea válido.

Puedes pegar el Markdown en herramientas compatibles, como:

- GitLab
- GitHub
- Wikis
- Editores Markdown
- Documentación interna

## 13. Descargar el Markdown

En la pestaña **Resumen**, usa el botón con icono de descarga para descargar el informe como archivo `.md`.

El archivo descargado incluye:

- Datos generales de la revisión.
- Participantes.
- Hallazgos en tablas.
- Enlaces internos a anexos.
- Imágenes embebidas.

Ten en cuenta que si agregas muchas imágenes, el archivo Markdown puede ser grande.

## 14. Guardar avance

Si no terminas el informe en una sola sesión, usa el botón **Guardar avance** en la esquina superior derecha.

ReviewForge descargará un archivo `.json` con todo el estado del informe.

Ese archivo incluye:

- Datos del encabezado.
- Participantes.
- Archivos registrados.
- Hallazgos.
- Imágenes.
- Anexos.

Guarda ese archivo en un lugar seguro para continuar más adelante.

## 15. Restaurar avance

Para continuar un informe guardado:

1. Haz clic en **Restaurar avance**.
2. Selecciona el archivo `.json` que guardaste previamente.
3. ReviewForge cargará de nuevo todo el informe.

Si el archivo no corresponde a un avance válido, la aplicación mostrará un mensaje de error.

## 16. Flujo recomendado

1. Completa el **Encabezado**.
2. Agrega los **Participantes**.
3. Registra archivos en:
   - **Esquemáticos**
   - **BOM**
   - **Layout**
   - **Documentos extra**
4. Agrega los hallazgos por archivo.
5. Adjunta imágenes cuando sean necesarias.
6. Guarda un avance.
7. Revisa la pestaña **Resumen**.
8. Corrige errores de validación si aparecen.
9. Copia o descarga el Markdown final.

## 17. Buenas prácticas

- Guarda avances periódicamente.
- Usa nombres claros para los archivos revisados.
- Escribe hallazgos específicos y accionables.
- Adjunta imágenes solo cuando aporten evidencia o contexto.
- Agrega pie o texto alternativo a las imágenes.
- Revisa el resumen antes de descargar el informe final.
- Evita imágenes innecesariamente grandes.

## 18. Preguntas frecuentes

### ¿La aplicación guarda mi información automáticamente?

No. Para conservar tu trabajo debes usar **Guardar avance**.

### ¿Puedo continuar el informe en otro computador?

Sí. Guarda el avance como `.json` y luego usa **Restaurar avance** en el otro computador.

### ¿Las imágenes se guardan en el avance?

Sí. Las imágenes quedan incluidas dentro del archivo de avance.

### ¿Puedo exportar a PDF?

La exportación a PDF todavía no está disponible. Actualmente puedes descargar el informe como Markdown.

### ¿Qué pasa si cierro el navegador sin guardar?

Puedes perder el trabajo no guardado. Usa **Guardar avance** antes de cerrar la aplicación.

## 19. Limitaciones actuales

- No hay almacenamiento automático en la nube.
- El avance se guarda manualmente como archivo `.json`.
- Las imágenes se embeben dentro del avance y del Markdown, por lo que pueden aumentar el tamaño de los archivos.
- La exportación PDF todavía no está implementada.
