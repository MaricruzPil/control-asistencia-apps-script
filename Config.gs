const HOJAS = Object.freeze({
  PARTICIPANTES: 'Participantes',
  SESIONES: 'Sesiones',
  ASISTENCIAS: 'Asistencias',
});

function obtenerLibro_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error('Configura la propiedad de script SPREADSHEET_ID con el ID real de BD_Control_Asistencia.');
  }

  return SpreadsheetApp.openById(spreadsheetId);
}
