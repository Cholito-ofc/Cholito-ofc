const fs = require("fs");
const path = require("path");

const afkPath = path.resolve("./afk.json");
const afkData = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : {};

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const user = senderId;
  const motivo = args.join(" ") || "No especificó motivo";

  afkData[user] = {
    tiempo: Date.now(),
    razon: motivo
  };
  fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

  await conn.sendMessage(chatId, {
    text: `🌙 *${msg.pushName || "Usuario"}* ha activado el modo *AFK*\n📌 *Motivo:* ${motivo}`,
    mentions: [user]
  }, { quoted: msg });
};

// ⏳ Auto quitar AFK si habla
handler.before = async (msg, { conn }) => {
  const senderId = msg.key.participant || msg.key.remoteJid;
  const chatId = msg.key.remoteJid;

  // Si estaba AFK y habla, se le borra el estado
  if (afkData[senderId]) {
    delete afkData[senderId];
    fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

    await conn.sendMessage(chatId, {
      text: `🌞 *${msg.pushName || "Usuario"}* ha vuelto del modo AFK.`,
      mentions: [senderId]
    }, { quoted: msg });
  }

  // Si alguien menciona a un AFK
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = context?.mentionedJid || [];

  for (const id of mentioned) {
    if (afkData[id]) {
      const tiempo = Date.now() - afkData[id].tiempo;
      const horas = Math.floor(tiempo / 3600000);
      const minutos = Math.floor((tiempo % 3600000) / 60000);
      const segundos = Math.floor((tiempo % 60000) / 1000);
      const tiempoTexto = `${horas}h ${minutos}m ${segundos}s`;

      await conn.sendMessage(chatId, {
        text: `📴 *${id.split("@")[0]}* está en modo *AFK*\n⏱️ *Hace:* ${tiempoTexto}\n📌 *Motivo:* ${afkData[id].razon}`,
        mentions: [id]
      }, { quoted: msg });
    }
  }
};

handler.command = ["afk"];
module.exports = handler;