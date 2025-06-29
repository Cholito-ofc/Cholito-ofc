// Este comando ha sido completamente desactivado.
// No responde, no ejecuta funciones, no muestra mensajes.
// Mantiene su estructura para una futura reactivación si se desea.

module.exports = {
  name: 'serbot',
  alias: ['se', 'codigo', 'killua', 'killuabot', 'qrbot'],
  tags: ['owner'],
  help: ['serbot', 'code'],
  desc: 'Este comando ha sido desactivado por el desarrollador.',

  /**
   * @param {Object} msg - Mensaje que activa el comando
   * @param {Object} param1 - Objeto con conexión, argumentos, etc.
   * @returns {void}
   */
  async run(msg, { conn, command, sock, args }) {
    // Comando neutralizado completamente. No responde.
    return;
  }
};