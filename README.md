# CalcuChamba

**Tu experiencia, bien contada.**

Creado por **Andi Aguirre** · Equipo de RR. HH. · ODPE Chanchamayo.

Calculadora de experiencia laboral desarrollada con HTML, CSS y JavaScript. No requiere instalación de dependencias, compilación, API ni servidor de datos.

## Archivos

- `index.html`: interfaz y contenido.
- `style.css`: diseño minimalista oscuro y adaptación a celulares.
- `app.js`: formulario, validaciones, historial local y resumen.
- `calc.js`: cálculo de fechas, periodos, cruces y duraciones de calendario.
- `.nojekyll`: indica a GitHub Pages que publique archivos estáticos.
- `.gitignore`: exclusiones de archivos locales.

## Funciones

- Escribir `01012024` para obtener `01/01/2024`, o seleccionar desde un calendario.
- Registrar periodos con Enter o mediante el botón.
- Calcular una vista previa del total mientras se completa el formulario.
- Validar días de cada mes y años bisiestos.
- Aceptar solo fechas anteriores a hoy, tomando como referencia America/Lima.
- Detectar y bloquear cruces con periodos ya registrados.
- Editar y eliminar registros, y copiar el resumen de registros guardados.
- Guardar los datos en el navegador mediante localStorage.

## Criterio de cálculo

Por defecto se incluyen el día inicial y el final. Del 01/01/2024 al 31/12/2024 son 366 días y un año de calendario; el mismo periodo en 2023 son 365 días y un año.

El total exacto de días se normaliza a años, meses y días desde la fecha de inicio más antigua. Los días de huecos entre contratos no se cuentan. Para periodos separados, esta es una equivalencia de calendario: no representa un único periodo continuo trabajado.

Cuando solo se ingresan días manuales, la interfaz permite elegir una fecha de referencia. Por defecto se usa el 1 de enero del año actual (o ayer si hoy fuera 1 de enero); la selección se guarda en el navegador. Los días manuales no permiten verificar cruces con otros periodos.

Los años bisiestos y la duración de los meses se toman del calendario de referencia. Cada registro por fechas mantiene también su duración individual. Ejemplo de regresión: 01/01/2018–31/08/2025 más 98 días manuales = 2898 días; equivalencia desde 01/01/2018: 7 años, 11 meses y 7 días.

## Probar en tu equipo

Abre la carpeta con Visual Studio Code y usa Live Server. También puedes iniciar un servidor local con Python:

```sh
python -m http.server 8000
```

Después abre `http://localhost:8000`. El copiado al portapapeles funciona en HTTPS o localhost, sujeto a los permisos del navegador.

## Subir a GitHub

1. Descomprime el ZIP.
2. Crea un repositorio llamado `calcuchamba`.
3. Sube **el contenido** de esta carpeta a la raíz del repositorio. `index.html` debe quedar directamente en la raíz.
4. Confirma la carga con un commit.

Para subirlo con Git desde esta carpeta, reemplaza TU_USUARIO por tu usuario:

```sh
git init
git add .
git commit -m "Agregar CalcuChamba"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/calcuchamba.git
git push -u origin main
```

## Publicar con GitHub Pages

En el repositorio, abre **Settings → Pages**. En **Build and deployment**, selecciona **Deploy from a branch**, rama **main** y carpeta **/(root)**. Guarda la configuración. La dirección publicada será la que indique GitHub Pages.

Referencia: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Los registros son locales a cada navegador y dirección web; no se transfieren automáticamente de la página anterior a GitHub Pages ni se comparten con otros usuarios.

## Google y buscadores

`robots.txt` permite el rastreo y señala el `sitemap.xml`, que incluye la URL pública `https://calcuchamba.netlify.app/`. Ambos archivos deben publicarse en la misma carpeta que `index.html`. La página también incluye URL canónica, descripción y metadatos para compartir.

En [Google Search Console](https://search.google.com/search-console), agrega y verifica la propiedad `https://calcuchamba.netlify.app/` y envía `sitemap.xml` desde la sección **Sitemaps**. La metaetiqueta de verificación de Google ya está incluida en `index.html`; si Search Console proporciona una etiqueta distinta, reemplaza su valor por el nuevo y vuelve a publicar. El rastreo y la indexación pueden tardar y no están garantizados por la configuración del sitio.

## Correcciones — 23/10/2026

- Guardado con Enter compatible con HTTP y navegadores sin crypto.randomUUID.
- Borrado de dígitos junto a separadores y pegado de fechas ISO o con separadores.
- Preferencias de conteo restauradas al recargar.
- Cambio de modo durante una edición sin sobrescribir accidentalmente el registro.
- Validación inmediata de fechas futuras, datos dañados y cantidades enteras.
- Cruces bloqueados independientemente de la opción de incluir extremos.
- Copia de registros guardados con alternativa cuando el portapapeles no está disponible.
- Sin reconstrucción del historial cada minuto: conserva el foco durante el uso.

## Pruebas

Con Node.js 18 o superior, ejecuta `node --test tests/calc.test.cjs`. Incluye 15 pruebas de fechas, años bisiestos, cruces, almacenamiento válido y sumas. También se verificaron en navegador: registro con Enter, edición, cambio de modo, calendario, borrado de dígitos, persistencia de opciones, cruces, fechas futuras y copia del resumen.

## Corrección de días sobrantes

La suma ya no muestra cantidades como 98 días en el componente final. Se normaliza el total utilizando una referencia visible, se incluye esa referencia en el resumen y se mantiene el total de días exactos. Los registros existentes se recalculan sin borrarlos.

## Restablecer

El botón Restablecer limpia el formulario, elimina los registros guardados y restaura las opciones iniciales. Pide confirmación si hay registros o campos escritos. Cancelar conserva los datos. El reinicio confirmado se guarda en este navegador.

## Versión 1.2 — Botones y compatibilidad

Restablecer y Borrar todo ahora utilizan una confirmación dentro de la página, sin depender de ventanas confirm del navegador. El código de cálculo y de la interfaz se publica junto en un archivo con nombre versionado para evitar mezclas de archivos antiguos en caché.

Si modificas `app.js`, `calc.js` o `style.css`, ejecuta `node scripts/build-static.cjs` y sube también el `index.html` actualizado y los archivos `calcuchamba-*.js` y `calcuchamba-*.css` generados. El ZIP ya incluye estos archivos listos para subir.
