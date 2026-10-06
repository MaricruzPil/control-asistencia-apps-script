function prepararBaseDatos() {
  const libro = obtenerLibro_();

  const hojaParticipantes = obtenerOCrearHoja_(libro, HOJAS.PARTICIPANTES);
  const hojaSesiones = obtenerOCrearHoja_(libro, HOJAS.SESIONES);
  const hojaAsistencias = obtenerOCrearHoja_(libro, HOJAS.ASISTENCIAS);

  prepararParticipantes_(hojaParticipantes);
  prepararSesiones_(hojaSesiones);
  prepararAsistencias_(hojaAsistencias);

  return 'Base de datos preparada correctamente.';
}

function prepararParticipantes_(hoja) {
  const encabezados = ['id_participante', 'nombre', 'correo', 'activo'];
  establecerEncabezados_(hoja, encabezados);

  const idsExistentes = obtenerValoresColumna_(hoja, 1);
  const participantes = [];

  for (let i = 1; i <= 30; i++) {
    const id = `P${String(i).padStart(2, '0')}`;

    if (!idsExistentes.has(id)) {
      participantes.push([
        id,
        `Participante ${String(i).padStart(2, '0')}`,
        `participante${String(i).padStart(2, '0')}@ejemplo.com`,
        true,
      ]);
    }
  }

  insertarFilas_(hoja, participantes);
  formatearHoja_(hoja, encabezados.length);
}

function prepararSesiones_(hoja) {
  const encabezados = ['id_sesion', 'numero', 'fecha', 'tema', 'estado'];
  establecerEncabezados_(hoja, encabezados);

  const idsExistentes = obtenerValoresColumna_(hoja, 1);
  const fechaInicial = new Date();
  fechaInicial.setHours(0, 0, 0, 0);

  const sesiones = [];

  for (let i = 1; i <= 10; i++) {
    const id = `S${String(i).padStart(2, '0')}`;

    if (!idsExistentes.has(id)) {
      const fecha = new Date(fechaInicial);
      fecha.setDate(fechaInicial.getDate() + ((i - 1) * 7));

      sesiones.push([
        id,
        i,
        fecha,
        `Sesión ${i}`,
        'PENDIENTE',
      ]);
    }
  }

  insertarFilas_(hoja, sesiones);
  hoja.getRange(2, 3, Math.max(hoja.getLastRow() - 1, 1), 1).setNumberFormat('yyyy-mm-dd');
  formatearHoja_(hoja, encabezados.length);
}

function prepararAsistencias_(hoja) {
  const encabezados = ['id_sesion', 'id_participante', 'estado', 'hora_registro'];
  establecerEncabezados_(hoja, encabezados);
  formatearHoja_(hoja, encabezados.length);
}

function obtenerOCrearHoja_(libro, nombre) {
  return libro.getSheetByName(nombre) || libro.insertSheet(nombre);
}

function establecerEncabezados_(hoja, encabezados) {
  hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
}

function obtenerValoresColumna_(hoja, columna) {
  const ultimaFila = hoja.getLastRow();

  if (ultimaFila < 2) {
    return new Set();
  }

  const valores = hoja.getRange(2, columna, ultimaFila - 1, 1).getValues();
  return new Set(valores.flat().filter(String));
}

function insertarFilas_(hoja, filas) {
  if (filas.length === 0) {
    return;
  }

  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
}

function formatearHoja_(hoja, totalColumnas) {
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, totalColumnas)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  hoja.autoResizeColumns(1, totalColumnas);
}
