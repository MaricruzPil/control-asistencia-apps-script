# Control de Asistencia con Google Apps Script

## Descripción

Este proyecto es una Web App responsive y mobile-first para controlar la asistencia de 30 participantes durante 10 sesiones.

La aplicación utiliza Google Apps Script como backend y Google Sheets como almacenamiento. La interfaz está desarrollada con HTML, CSS y JavaScript, y está pensada para funcionar correctamente desde un teléfono móvil.

El sistema permite seleccionar una sesión, cargar la lista de participantes, marcar asistencia como presente o ausente, guardar los registros y recuperar posteriormente la asistencia registrada.

## Tecnologías utilizadas

- **Google Apps Script**: backend de la aplicación y publicación como Web App.
- **Google Sheets**: base de datos para participantes, sesiones y asistencias.
- **HTML**: estructura de la interfaz.
- **CSS**: diseño responsive/mobile-first.
- **JavaScript**: lógica del frontend y comunicación con Apps Script mediante `google.script.run`.
- **Node.js**: entorno necesario para utilizar herramientas de desarrollo como `clasp`.
- **clasp**: herramienta de línea de comandos para sincronizar el proyecto local con Google Apps Script.
- **Git**: control de versiones local.
- **GitHub**: alojamiento remoto del repositorio.

## Uso de skills de Codex

Durante el desarrollo se utilizaron skills locales de Codex como apoyo metodológico para revisar y mejorar la interfaz de la Web App.

- **frontend-design-codex**: se utilizó para orientar el rediseño visual de la interfaz, cuidando jerarquía, responsive design, accesibilidad, estados visuales y consistencia de componentes.
- **ui-ux**: se utilizó como criterio de revisión UX/UI para evaluar que la aplicación fuera clara, usable, mobile-first y adecuada para el flujo principal de pasar lista.

Estas skills no forman parte del código ejecutado por Google Apps Script ni son dependencias de la aplicación publicada. Su función fue apoyar el proceso de diseño, revisión y toma de decisiones durante el desarrollo.

## Estructura del proyecto

- `Code.gs`: contiene `doGet()`, función que sirve `index.html` como entrada de la Web App.
- `Config.gs`: contiene la configuración general del proyecto, los nombres de las hojas y la función auxiliar para abrir el Spreadsheet.
- `Setup.gs`: contiene `prepararBaseDatos()`, encargada de crear e inicializar las hojas necesarias.
- `Asistencia.gs`: contiene la lógica backend para consultar sesiones, consultar participantes y guardar asistencia.
- `index.html`: contiene la interfaz responsive de la Web App.
- `appsscript.json`: manifiesto del proyecto de Google Apps Script.
- `.clasp.json`: configuración local de `clasp` para vincular el proyecto con Apps Script.
- `.gitignore`: define archivos y carpetas que no deben versionarse.

## Estructura de Google Sheets

El Spreadsheet funciona como base de datos del sistema y contiene tres hojas principales.

### Participantes

```text
id_participante | nombre | correo | activo
```

Contiene 30 participantes iniciales, identificados desde `P01` hasta `P30`.

### Sesiones

```text
id_sesion | numero | fecha | tema | estado
```

Contiene 10 sesiones iniciales, identificadas desde `S01` hasta `S10`. El estado inicial de cada sesión es `PENDIENTE` y cambia a `REGISTRADA` cuando se guarda asistencia.

### Asistencias

```text
id_sesion | id_participante | estado | hora_registro
```

La combinación:

```text
id_sesion + id_participante
```

funciona como llave lógica compuesta. Esto evita duplicar registros para el mismo participante dentro de la misma sesión. Si ya existe un registro, se actualiza; si no existe, se crea.

## Configuración inicial

Antes de ejecutar la aplicación debe existir un archivo de Google Sheets que será utilizado como base de datos.

El ID del Spreadsheet no debe escribirse directamente en el código fuente. Debe configurarse como propiedad de script en Google Apps Script:

```text
Google Apps Script → Configuración del proyecto → Propiedades de script
```

Crear una propiedad con:

```text
Nombre: SPREADSHEET_ID
Valor: ID del Spreadsheet de Google Sheets
```

Después de configurar la propiedad, debe ejecutarse una vez la función:

```text
prepararBaseDatos()
```

Esta función crea o inicializa las hojas `Participantes`, `Sesiones` y `Asistencias`, además de generar los 30 participantes y las 10 sesiones requeridas.

`prepararBaseDatos()` es idempotente: puede ejecutarse nuevamente sin duplicar los participantes `P01` a `P30` ni las sesiones `S01` a `S10`.

## Sincronización con clasp

Comandos principales:

```perl
clasp login
clasp push
clasp pull
clasp open-script
```

- `clasp login`: inicia sesión con una cuenta de Google.
- `clasp push`: sube los archivos locales al proyecto de Apps Script.
- `clasp pull`: descarga los archivos actuales desde Apps Script al proyecto local.
- `clasp open-script`: abre el proyecto en el editor de Google Apps Script.

No se debe incluir en la documentación ningún ID real del proyecto ni del Spreadsheet.

## Uso

Flujo general de uso:

1. Abrir la Web App publicada desde Google Apps Script.
2. Seleccionar una sesión.
3. Cargar los participantes de la sesión seleccionada.
4. Marcar participantes como presentes o ausentes.
5. Usar `Marcar todos` o `Desmarcar todos` si se requiere.
6. Revisar el contador de presentes.
7. Presionar `Guardar asistencia`.
8. Confirmar el mensaje de guardado.
9. Volver a abrir la sesión si se desea comprobar que la asistencia fue recuperada correctamente.

## Funciones principales

- `doGet()`: carga la interfaz de la Web App.
- `obtenerLibro_()`: abre el Spreadsheet configurado en las propiedades del script.
- `prepararBaseDatos()`: prepara las hojas y los datos iniciales.
- `obtenerSesiones()`: devuelve la lista de sesiones disponibles.
- `obtenerParticipantes(idSesion)`: devuelve los participantes activos y su asistencia registrada para una sesión.
- `guardarAsistencia(idSesion, participantes)`: guarda o actualiza la asistencia de una sesión.

## Publicación como Web App

Para publicar la aplicación:

1. Abrir el proyecto en Google Apps Script.
2. Ir a `Implementar`.
3. Seleccionar `Nueva implementación`.
4. Elegir el tipo `Aplicación web`.
5. Configurar quién puede acceder según los requerimientos de la práctica.
6. Publicar y utilizar la URL generada.

## Notas de integridad

- No se guarda el ID real del Spreadsheet en el repositorio.
- La asistencia no se duplica porque se utiliza la combinación `id_sesion + id_participante` como llave lógica.
- Una sesión inexistente no debe generar registros de asistencia.
- La interfaz evita clics repetidos durante el guardado deshabilitando controles temporalmente.
- La aplicación está diseñada para uso móvil, con controles grandes y estados visuales claros.

## Manejo de errores

El sistema incluye validaciones para reducir errores durante el uso y proteger la integridad de los datos.

- Valida que se seleccione una sesión antes de consultar o guardar asistencia.
- Valida que existan participantes para guardar.
- Valida que la sesión realmente exista antes de escribir registros en la hoja `Asistencias`.
- Valida que exista la hoja `Asistencias` antes de intentar guardar datos.
- El frontend utiliza `withFailureHandler(...)` en las llamadas a `google.script.run` para mostrar errores visibles al usuario.

## Control de versiones

Git y GitHub se utilizan para mantener el historial del proyecto, revisar cambios y conservar una copia remota del avance.

Antes de aceptar y guardar cambios se recomienda revisar el estado del proyecto con:

```bash
git status
git diff
```

Después de revisar los cambios, el flujo habitual de versionado es:

```bash
git add .
git commit -m "Descripción breve del cambio"
git push
```

No se debe incluir información privada, credenciales, tokens, URLs privadas ni IDs reales dentro del repositorio.

## Pruebas realizadas

Durante el desarrollo se realizaron las siguientes pruebas:

- Creación de 30 participantes.
- Creación de 10 sesiones.
- Segunda ejecución de `prepararBaseDatos()` sin duplicar participantes ni sesiones.
- Carga de las 10 sesiones en la Web App.
- Carga de los 30 participantes.
- Funcionamiento de `Marcar todos` y `Desmarcar todos`.
- Actualización del contador de presentes.
- Registro de presentes y ausentes.
- Cambio de la sesión de `PENDIENTE` a `REGISTRADA`.
- Recuperación de una asistencia previamente guardada.
- Modificación y segundo guardado de la misma sesión.
- Comprobación de que el segundo guardado actualiza registros y no crea duplicados.

## Datos académicos

- **Materia**: Inteligencia artificial aplicada a las TIC.
- **Autor**: Maricruz Pineda Lara.
