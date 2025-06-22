const fs = require('fs');
const path = require('path');
const PRUEBAS_FILE = path.resolve('./pruebas_grupo.json');

// Lee y guarda el estado de las pruebas
function cargarPruebas() {
  if (!fs.existsSync(PRUEBAS_FILE)) return {};
  return JSON.parse(fs.readFileSync(PRUEBAS_FILE, 'utf-8'));
}
function guardarPruebas(data) {
  fs.writeFileSync(PRUEBAS_FILE, JSON.stringify(data, null, 2));
}

// Middleware global para filtrar mensajes y avisar cuando termina la prueba
async function before(m, { conn }) {
  if (!m.isGroup) return;
  if (m.fromMe) return; // Owner siempre puede usar
  const pruebas = cargarPruebas();
  const prueba = pruebas[m.chat];
  if (!prueba) return m.reply('⏳ El bot está en modo prueba y no está habilitado para este grupo.');
  if (Date.now() > prueba.fin) {
    // Envía el aviso SOLO UNA VEZ y elimina la prueba
    await conn.sendMessage(m.chat, { text: '⏰ *El tiempo de prueba ha finalizado.*\nContacta al owner para contratar el bot permanentemente.' });
    delete pruebas[m.chat];
    guardarPruebas(pruebas);
    return false; // El bot ya no responde
  }
  // Si está en tiempo de prueba, deja pasar
}
exports.before = before;

// Comando para activar la prueba
const handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return m.reply('🚫 Solo el owner puede usar este comando.');
  const minutos = parseInt(args[0]);
  if (!minutos || minutos < 1 || minutos > 1440) return m.reply('❌ Especifica los minutos de prueba (1 a 1440).\nEjemplo: .pruebagrupo 30');
  let pruebas = cargarPruebas();
  pruebas[m.chat] = {
    fin: Date.now() + minutos * 60 * 1000,
    minutos
  };
  guardarPruebas(pruebas);
  return m.reply(`✅ Modo prueba activado por ${minutos} minutos.\nEl bot responderá aquí hasta que termine el tiempo.`);
};
handler.command = ['pruebagrupo'];
handler.group = true;
handler.owner = true;

module.exports = handler;