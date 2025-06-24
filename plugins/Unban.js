const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "🌐 *Este comando solo puede utilizarse en grupos.*",
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;

  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Acceso denegado.*\nSolo los *administradores* o el *propietario del bot* pueden ejecutar este comando.",
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "📌 *Debes responder al mensaje del usuario que deseas desbanear.*",
    }, { quoted: msg });
  }

  const banPath = path.resolve("./ban.json");
  const banData = fs.existsSync(banPath) ? JSON.parse(fs.readFileSync(banPath)) : {};
  if (!banData[chatId]) banData[chatId] = [];

  if (banData[chatId].includes(target)) {
    banData[chatId] = banData[chatId].filter(u => u !== target);
    fs.writeFileSync(banPath, JSON.stringify(banData, null, 2));

    await conn.sendMessage(chatId, {
      text: `✅ *El usuario* @${target.split("@")[0]} *ha sido desbaneado exitosamente.*`,
      mentions: [target]
    }, { quoted: msg });

  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ *El usuario* @${target.split("@")[0]} *no se encuentra baneado.*`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["unban"];
module.exports = handler;