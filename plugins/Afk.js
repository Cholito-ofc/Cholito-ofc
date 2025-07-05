const fs = require("fs");
const path = require("path");

const afkPath = path.resolve("./afk.json");
let afkData = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : {};

const handler = async (msg, { conn, args }) => {
  const user = msg.key.participant || msg.key.remoteJid;
  const chatId = msg.key.remoteJid;
  const motivo = args.join(" ") || "Sin motivo.";

  afkData[user] = {
    tiempo: Date.now(),
    razon: motivo
  };
  fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

  await conn.sendMessage(chatId, {
    text: `🌙 *${msg.pushName || "Usuario"}* está en modo *AFK*\n📌 *Motivo:* ${motivo}`,
    mentions: [user]
  }, { quoted: msg });
};

handler.command = ["afk"];
module.exports = handler;