const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9 isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarlo el *dueño del bot*."
    }, { quoted: msg });
  }

  const minutos = parseInt(args[0]);
  if (!minutos || minutos < 1 || minutos > 1440) {
    return conn.sendMessage(chatId, {
      text: "❌ Especifica los minutos de prueba (entre 1 y 1440).\nEjemplo: .pruebagrupo 30"
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
    text: `✅ *Modo prueba activado.*\nEl bot responderá aquí por *${minutos} minutos*.`
  }, { quoted: msg });

  // Temporizador para aviso y desactivar prueba
  setTimeout(async () => {
    const updatedData = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};
    if (updatedData[chatId]) {
      await conn.sendMessage(chatId, {
        text: "⏰ *El tiempo de prueba ha finalizado.*\nContacta al owner para contratar el bot permanentemente."
      });
      delete updatedData[chatId];
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    }
  }, minutos * 60 * 1000);
};

handler.command = ["pruebagrupo"];
module.exports = handler;

// Middleware: pon esto en tu handler global, normalmente en el index.js o crea un archivo plugins/filtroPrueba.js si tu bot soporta middlewares

handler.before = async (msg, { conn }) => {
  if (!msg.key.remoteJid.endsWith('@g.us')) return;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // Permite que el owner siempre use el bot
  if (isOwner) return;

  const filePath = "./pruebas_grupo.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  const prueba = data[msg.key.remoteJid];
  if (!prueba) {
    return !1; // No hay prueba activa, bloquea el uso del bot
  }
  if (Date.now() > prueba.fin) {
    // Si se acabó el tiempo, borra la prueba y bloquea el uso
    delete data[msg.key.remoteJid];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return !1;
  }
  // Si hay prueba vigente, deja pasar
};