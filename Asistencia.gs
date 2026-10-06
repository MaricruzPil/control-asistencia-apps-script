function obtenerSesiones() {
  const libro = obtenerLibro_();
  const hoja = libro.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) {
    return [];
  }

  const zonaHoraria = Session.getScriptTimeZone();
  const valores = hoja.getRange(2, 1, hoja.getLastRow() - 1, 5).getValues();

  return valores
    .filter((fila) => fila[0])
    .map((fila) => ({
      id: fila[0],
      numero: fila[1],
      fecha: fila[2] instanceof Date
        ? Utilities.formatDate(fila[2], zonaHoraria, 'yyyy-MM-dd')
        : fila[2],
      tema: fila[3],
      estado: fila[4],
    }));
}

function obtenerParticipantes(idSesion) {
  if (!idSesion) {
    throw new Error('Selecciona una sesión antes de consultar participantes.');
  }

  const libro = obtenerLibro_();
  const hojaParticipantes = libro.getSheetByName(HOJAS.PARTICIPANTES);
  const asistenciasPorParticipante = obtenerAsistenciasPorParticipante_(libro, idSesion);

  if (!hojaParticipantes || hojaParticipantes.getLastRow() < 2) {
    return [];
  }

  const valores = hojaParticipantes.getRange(2, 1, hojaParticipantes.getLastRow() - 1, 4).getValues();

  return valores
    .filter((fila) => fila[0] && fila[3] === true)
    .map((fila) => {
      const idParticipante = fila[0];
      const estadoGuardado = asistenciasPorParticipante.get(idParticipante);

      return {
        id: idParticipante,
        nombre: fila[1],
        correo: fila[2],
        presente: estadoGuardado === 'PRESENTE',
      };
    });
}

function guardarAsistencia(idSesion, participantes) {
  if (!idSesion) {
    throw new Error('Selecciona una sesión antes de guardar la asistencia.');
  }

  if (!Array.isArray(participantes) || participantes.length === 0) {
    throw new Error('No hay participantes para guardar.');
  }

  const libro = obtenerLibro_();
  validarSesionExiste_(libro, idSesion);

  const hoja = libro.getSheetByName(HOJAS.ASISTENCIAS);

  if (!hoja) {
    throw new Error(`No existe la hoja ${HOJAS.ASISTENCIAS}. Ejecuta prepararBaseDatos() primero.`);
  }

  const indiceExistente = obtenerIndiceAsistencias_(hoja);
  const ahora = new Date();
  const nuevasFilas = [];
  let presentes = 0;
  let ausentes = 0;

  participantes.forEach((participante) => {
    const idParticipante = participante.id;

    if (!idParticipante) {
      return;
    }

    const estado = participante.presente === true ? 'PRESENTE' : 'AUSENTE';
    const fila = indiceExistente.get(crearLlaveAsistencia_(idSesion, idParticipante));

    if (estado === 'PRESENTE') {
      presentes++;
    } else {
      ausentes++;
    }

    if (fila) {
      hoja.getRange(fila, 3, 1, 2).setValues([[estado, ahora]]);
    } else {
      nuevasFilas.push([idSesion, idParticipante, estado, ahora]);
    }
  });

  if (nuevasFilas.length > 0) {
    hoja.getRange(hoja.getLastRow() + 1, 1, nuevasFilas.length, 4).setValues(nuevasFilas);
  }

  hoja.getRange(2, 4, Math.max(hoja.getLastRow() - 1, 1), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  marcarSesionRegistrada_(libro, idSesion);

  return {
    ok: true,
    idSesion,
    presentes,
    ausentes,
    total: presentes + ausentes,
  };
}

function obtenerAsistenciasPorParticipante_(libro, idSesion) {
  const hoja = libro.getSheetByName(HOJAS.ASISTENCIAS);
  const asistencias = new Map();

  if (!hoja || hoja.getLastRow() < 2) {
    return asistencias;
  }

  const valores = hoja.getRange(2, 1, hoja.getLastRow() - 1, 3).getValues();

  valores.forEach((fila) => {
    if (fila[0] === idSesion && fila[1]) {
      asistencias.set(fila[1], fila[2]);
    }
  });

  return asistencias;
}

function obtenerIndiceAsistencias_(hoja) {
  const indice = new Map();

  if (hoja.getLastRow() < 2) {
    return indice;
  }

  const valores = hoja.getRange(2, 1, hoja.getLastRow() - 1, 2).getValues();

  valores.forEach((fila, i) => {
    if (fila[0] && fila[1]) {
      indice.set(crearLlaveAsistencia_(fila[0], fila[1]), i + 2);
    }
  });

  return indice;
}

function crearLlaveAsistencia_(idSesion, idParticipante) {
  return `${idSesion}::${idParticipante}`;
}

function validarSesionExiste_(libro, idSesion) {
  const hoja = libro.getSheetByName(HOJAS.SESIONES);

  if (!hoja || hoja.getLastRow() < 2) {
    throw new Error(`No existe la sesión ${idSesion}.`);
  }

  const valores = hoja.getRange(2, 1, hoja.getLastRow() - 1, 1).getValues();
  const indice = valores.findIndex((fila) => fila[0] === idSesion);

  if (indice === -1) {
    throw new Error(`No existe la sesión ${idSesion}.`);
  }

  return indice + 2;
}

function marcarSesionRegistrada_(libro, idSesion) {
  const hoja = libro.getSheetByName(HOJAS.SESIONES);
  const filaSesion = validarSesionExiste_(libro, idSesion);

  hoja.getRange(filaSesion, 5).setValue('REGISTRADA');
}
