const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el dueño del bot puede activar el modo prueba.*\n\nSi deseas adquirir este servicio, ¡contáctanos! 😉"
    }, { quoted: msg });
  }

  const minutos = parseInt(args[0]);
  if (!minutos || minutos < 1 || minutos > 1440) {
    return conn.sendMessage(chatId, {
      text: "⏳ *Por favor, indica la duración en minutos (entre 1 y 1440).* \n\nEjemplo: *.pruebagrupo 30*"
    }, { quoted: msg });
  }

  const filePath = "./pruebas_grupo.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  data[chatId] = {
    fin: Date.now() + minutos * 60 * 1000,
    minutos
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, {
    text: `🎉 *¡Modo prueba ACTIVADO!*\n\nEl bot estará disponible en este grupo durante *${minutos} minutos*.\n\nDisfrútalo y comprueba todas sus funciones. Si te gusta, ¡no dudes en adquirirlo!`
  }, { quoted: msg });

  // Temporizador para aviso y desactivar prueba
  setTimeout(async () => {
    const updatedData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};
    if (updatedData[chatId]) {
      await conn.sendMessage(chatId, {
        text: "🕒 *¡La prueba ha finalizado!*\n\nEsperamos que hayas disfrutado el bot. Si quieres tenerlo de forma permanente en tu grupo, contacta al owner o solicita tu suscripción.\n\n¡Gracias por tu interés! 💎"
      });
      delete updatedData[chatId];
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    }
  }, minutos * 60 * 1000);
};

handler.command = ["pruebagrupo"];
module.exports = handler;

// Middleware (no toques tu index.js, esto lo toma el sistema de plugins)
handler.before = async (msg, { conn }) => {
  if (!msg.key.remoteJid.endsWith('@g.us')) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // El owner siempre puede usar el bot
  if (isOwner) return;

  const filePath = "./pruebas_grupo.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  const prueba = data[msg.key.remoteJid];
  if (!prueba) {
    return !1; // No hay prueba activa, bloquea el bot para el grupo
  }
  if (Date.now() > prueba.fin) {
    // Si terminó la prueba, borra y bloquea
    delete data[msg.key.remoteJid];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return !1;
  }
  // Si la prueba está activa, sigue normalmente
};