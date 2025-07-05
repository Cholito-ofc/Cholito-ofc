const fs = require("fs");
const path = require("path");

const afkPath = path.resolve("./afk.json");
let afkData = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : {};

const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const chatId = msg.key.remoteJid;

  // Quitar AFK si el que habla es quien estaba AFK
  if (afkData[sender]) {
    delete afkData[sender];
    fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

    await conn.sendMessage(chatId, {
      text: `🌞 *${msg.pushName || "Usuario"}* ha salido del modo AFK.`,
      mentions: [sender]
    }, { quoted: msg });
  }

  // Detectar si se mencionó a alguien AFK
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = context?.mentionedJid || [];

  for (const jid of mentioned) {
    if (afkData[jid]) {
      const tiempo = Date.now() - afkData[jid].tiempo;
      const horas = Math.floor(tiempo / 3600000);
      const minutos = Math.floor((tiempo % 3600000) / 60000);
      const segundos = Math.floor((tiempo % 60000) / 1000);
      const tiempoTexto = `${horas}h ${minutos}m ${segundos}s`;

      await conn.sendMessage(chatId, {
        text: `📴 *${jid.split("@")[0]}* está en modo *AFK*\n⏱️ *Hace:* ${tiempoTexto}\n📌 *Motivo:* ${afkData[jid].razon}`,
        mentions: [jid]
      }, { quoted: msg });
    }
  }
};

handler.all = true; // <- este es el secreto: se ejecuta en todos los mensajes
module.exports = handler;