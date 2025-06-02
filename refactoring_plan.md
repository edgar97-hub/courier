# Plan de Refactorización: Eliminación de Clases de Tailwind CSS en Archivos HTML de Angular

## Objetivo
Refactorizar todos los archivos HTML (.html) dentro del directorio `frontend/src/app/` de este proyecto Angular para eliminar las clases de utilidad de Tailwind CSS y reemplazarlas con estilos CSS puros o clases CSS personalizadas definidas en los archivos SCSS de los componentes o en archivos SCSS globales/parciales.

## Contexto
Hemos decidido dejar de depender directamente de las clases de utilidad de Tailwind en nuestras plantillas para mejorar la semántica del HTML, centralizar los estilos y reducir el acoplamiento con el framework de utilidad. Los estilos principales ahora se gestionarán a través de SCSS de componentes y/o archivos SCSS globales.

## Plan Detallado

### Phase 1: Information Gathering and Context Understanding (Completada)

*   **Goal 1.1: Listar todos los archivos HTML en `frontend/src/app/`**
    *   *Estado:* Completado. Se obtuvo la lista de archivos HTML.
*   **Goal 1.2: Examinar archivos SCSS globales para variables y clases de utilidad existentes**
    *   *Estado:* Completado. Se revisaron `frontend/src/styles.scss`, `frontend/src/app/styles/_variables.scss` y `frontend/src/app/styles/tailwind.css`.

### Phase 2: Ejecución de la Refactorización (Iterativa para cada archivo HTML)

Esta fase se ejecutará una vez que el plan sea aprobado y se cambie al modo `code`.

*   **Goal 2.1: Procesar cada archivo HTML**
    *   Para cada archivo `.html` identificado:
        *   **Leer Contenido HTML:** Leer el contenido completo del archivo HTML.
        *   **Identificar Clases de Tailwind:** Analizar el contenido HTML para identificar todos los atributos `class` que contengan clases de utilidad de Tailwind.
        *   **Mapear a SCSS del Componente:** Determinar el archivo `.scss` correspondiente para el componente (ej. `my-component.component.html` se mapea a `my-component.component.scss`).
        *   **Traducir Tailwind a CSS Puro/Clases Semánticas:** Para cada clase o grupo de clases de Tailwind identificadas:
            *   Mapear la utilidad de Tailwind a sus propiedades CSS puras equivalentes (ej. `p-4` se convierte en `padding: 1rem;`).
            *   Decidir si se necesita una nueva clase CSS semántica (ej. `.info-box`, `.page-subtitle`) o si se pueden aplicar directamente estilos/variables globales existentes. Se priorizarán las clases semánticas para la reutilización y legibilidad.
            *   Si hay clases responsivas (ej. `md:flex`), se traducirán a media queries CSS estándar dentro del archivo SCSS.
        *   **Generar Cambios en SCSS:** Generar las operaciones `apply_diff` o `insert_content` necesarias para:
            *   Añadir nuevas reglas CSS para clases semánticas al archivo SCSS del componente.
            *   Añadir o modificar media queries para estilos responsivos en el archivo SCSS del componente.
            *   Utilizar variables CSS corporativas (de `_variables.scss`) cuando sea apropiado para colores y tipografía.
        *   **Generar Cambios en HTML:** Generar las operaciones `apply_diff` necesarias para:
            *   Modificar el archivo HTML para reemplazar las clases de Tailwind con las clases semánticas recién definidas o eliminarlas si la aplicación directa de CSS es suficiente.
            *   Asegurarse de que todas las clases de utilidad de Tailwind se eliminen de los atributos `class`.

### Phase 3: Finalización y Confirmación

*   **Goal 3.1: Confirmar plan con el usuario**
    *   *Estado:* Aprobado.
*   **Goal 3.2: Ofrecer escribir el plan en un archivo markdown**
    *   *Estado:* Solicitado por el usuario.
*   **Goal 3.3: Cambiar al modo Code**
    *   *Estado:* Pendiente de ejecución.

## Diagrama del Plan

```mermaid
graph TD
    A[Start Refactoring Task] --> B{Information Gathering};

    B --> B1[List all HTML files in src/app/];
    B1 --> B2[Examine global SCSS files];
    B2 --> C{Plan Approved?};

    C -- No --> D[Ask for Plan Adjustments];
    D --> C;

    C -- Yes --> E[Offer to Write Plan to Markdown];
    E --> F[Switch to Code Mode for Implementation];

    F --> G[End Planning Phase];

    subgraph Information Gathering
        B1 -- list_files --> HTML_FILES[List of .html files];
        B2 -- read_file --> GLOBAL_SCSS[Content of styles.scss, _variables.scss, tailwind.css];
    end

    subgraph Refactoring Execution (in Code Mode)
        F --> H{Process Each HTML File};
        H --> H1[Read HTML Content];
        H1 --> H2[Identify Tailwind Classes];
        H2 --> H3[Map to Component SCSS];
        H3 --> H4[Translate Tailwind to Pure CSS/Semantic Classes];
        H4 --> H5[Generate SCSS Changes];
        H5 --> H5_1[Apply SCSS Changes];
        H5_1 --> H6[Generate HTML Changes];
        H6 --> H6_1[Apply HTML Changes];
        H6_1 --> H{Next HTML File or Done};
        H -- Done --> I[Verify and Test];
    end