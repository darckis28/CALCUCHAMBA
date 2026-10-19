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

Se calculan meses completos desde la fecha inicial, ajustando al último día disponible cuando corresponde. Cada 12 meses forman un año. Cuando se activa la opción de no duplicar fechas, los intervalos superpuestos o contiguos se unen antes del cálculo.

Al sumar periodos separados, se suman sus componentes de años, meses y días. Los días residuales y los días ingresados manualmente permanecen como días: pueden superar 30, porque no se les aplica una equivalencia fija de mes o año. El total de días también se muestra por separado.

Sin fechas de referencia, no se pueden identificar cruces ni distinguir años bisiestos para los días manuales.

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
