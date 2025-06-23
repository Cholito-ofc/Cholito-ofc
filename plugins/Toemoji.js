// plugins/toemoji.js
const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("./emoji.json");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Este comando solo funciona en grupos.*"
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo administradores, el owner o el bot pueden cambiar el emoji.*"
    }, { quoted: msg });
  }

  const nuevoEmoji = args[0];
  if (!nuevoEmoji || nuevoEmoji.length > 2) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Usa:* `.toemoji 🔥` (solo un emoji)"
    }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath)
    ? JSON.parse(fs.readFileSync(emojiPath, "utf-8"))
    : {};

  emojiData[chatId] = nuevoEmoji;
  fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });

  return conn.sendMessage(chatId, {
    text: `✅ *Emoji cambiado a:* ${nuevoEmoji}`,
    quoted: msg
  });
};

handler.command = ["toemoji"];
handler.tags = ["group"];
handler.help = ["toemoji <emoji>"];
module.exports = handler;