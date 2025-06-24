const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "📛 *Este comando solo está disponible en grupos.*",
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;

  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Permiso denegado*\nSolo los *admins* o el *dueño del bot* pueden usar este comando.",
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  let target = null;

  // Opción 1: Si se responde a un mensaje
  if (context?.participant) {
    target = context.participant;
  }
  // Opción 2: Si se usa una mención @usuario
  else if (mentionedJid.length > 0) {
    target = mentionedJid[0];
  }

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "📍 *Debes responder al mensaje o mencionar con @ al usuario que quieres desbanear.*",
    }, { quoted: msg });
  }

  const banPath = path.resolve("./ban.json");
  const banData = fs.existsSync(banPath) ? JSON.parse(fs.readFileSync(banPath)) : {};
  if (!banData[chatId]) banData[chatId] = [];

  if (banData[chatId].includes(target)) {
    // Desbanear
    banData[chatId] = banData[chatId].filter(u => u !== target);
    fs.writeFileSync(banPath, JSON.stringify(banData, null, 2));

    await conn.sendMessage(chatId, {
      text: `✅ *Usuario* @${target.split("@")[0]} *ha sido desbaneado exitosamente.*`,
      mentions: [target],
    }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ *El usuario* @${target.split("@")[0]} *no está baneado actualmente.*`,
      mentions: [target],
    }, { quoted: msg });
  }
};

handler.command = ["unban"];
module.exports = handler;