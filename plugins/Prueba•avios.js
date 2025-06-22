const fs = require("fs");
const path = require("path");
const filePath = "./pruebas_grupo.json";
const TIEMPO_PREDETERMINADO = 30; // minutos

function cargarPruebas() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function guardarPruebas(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el dueño del bot puede activar o extender el modo prueba.*"
    }, { quoted: msg });
  }

  // Toma minutos del argumento, o usa predeterminado
  const minutos = parseInt(args[0]) || TIEMPO_PREDETERMINADO;
  if (minutos < 1 || minutos > 1440) {
    return conn.sendMessage(chatId, {
      text: "⏳ *El tiempo debe ser entre 1 y 1440 minutos.* \n\nEjemplo: *.pruebagrupo 45*"
    }, { quoted: msg });
  }

  let pruebas = cargarPruebas();
  const activar = !pruebas[chatId] || Date.now() > pruebas[chatId].fin;

  pruebas[chatId] = {
    fin: Date.now() + minutos * 60 * 1000,
    minutos
  };
  guardarPruebas(pruebas);

  await conn.sendMessage(chatId, {
    text: activar
      ? `🎉 *¡Prueba activada!* El bot estará disponible por *${minutos} minutos*.\n\nDisfruta y prueba todas las funciones.`
      : `⏰ *Prueba extendida!* Ahora tendrás *${minutos} minutos* más para disfrutar el bot.`
  }, { quoted: msg });

  // Aviso automático al finalizar el tiempo de prueba
  setTimeout(async () => {
    let updatedData = cargarPruebas();
    if (updatedData[chatId] && Date.now() > updatedData[chatId].fin) {
      await conn.sendMessage(chatId, {
        text: "🔕 *La prueba ha finalizado.*\n¿Quieres más tiempo? Pídeselo al owner para reactivar el bot en este grupo."
      });
      delete updatedData[chatId];
      guardarPruebas(updatedData);
    }
  }, minutos * 60 * 1000);
};

handler.command = ["pruebagrupo"];
module.exports = handler;

// Middleware para filtrar mensajes en grupos
handler.before = async (msg, { conn }) => {
  if (!msg.key.remoteJid.endsWith('@g.us')) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  if (isOwner) return;

  let pruebas = cargarPruebas();
  const prueba = pruebas[msg.key.remoteJid];
  if (!prueba) return !1;
  if (Date.now() > prueba.fin) {
    delete pruebas[msg.key.remoteJid];
    guardarPruebas(pruebas);
    return !1;
  }
  // Si la prueba está activa, deja pasar
};