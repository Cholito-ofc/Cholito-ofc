const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("./emoji.json");

// Lista de emojis por país según código
function getFlagFromNumber(number) {
  const flags = {
    "504": "🇭🇳", "502": "🇬🇹", "503": "🇸🇻", "505": "🇳🇮", "506": "🇨🇷",
    "507": "🇵🇦", "51": "🇵🇪", "52": "🇲🇽", "54": "🇦🇷", "55": "🇧🇷",
    "56": "🇨🇱", "57": "🇨🇴", "58": "🇻🇪", "591": "🇧🇴", "593": "🇪🇨",
    "595": "🇵🇾", "34": "🇪🇸", "1": "🇺🇸"
  };
  const match = Object.keys(flags).find(code => number.startsWith(code));
  return flags[match] || "🌐";
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    return conn.sendMessage(chatId, { text: "⚠️ Este comando solo funciona en grupos." }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin) {
    return conn.sendMessage(chatId, { text: "❌ Solo administradores pueden usar este comando." }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  const usedEmoji = emojiData[chatId] || "➤";
  const extraMsg = args.join(" ").trim();

  const mentionList = metadata.participants.map(p => {
    const num = p.id.split("@")[0];
    const flag = getFlagFromNumber(num);
    return `${flag} ${usedEmoji} @${num}`;
  }).join("\n");

  const finalMsg = `╔『 🔊 INVOCACIÓN MASIVA 』╗
╟🔹 *KILLUA 2.0 BOT PRESENTE*
╟👤 *Invocado por:* ${getFlagFromNumber(senderNum)} @${senderNum}
${extraMsg ? `╟💬 *Mensaje:* ${extraMsg}` : ""}
╚═══════════════╝

📲 *Etiquetando a todos los miembros...*

${mentionList}`;

  const mentionIds = metadata.participants.map(p => p.id);

  await conn.sendMessage(chatId, {
    text: finalMsg,
    mentions: mentionIds
  }, { quoted: msg });
};

// Cambiar emoji por grupo
const toemoji = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin) {
    return conn.sendMessage(chatId, { text: "❌ Solo administradores pueden cambiar el emoji." }, { quoted: msg });
  }

  const emoji = args[0];
  if (!emoji || emoji.length > 2) {
    return conn.sendMessage(chatId, { text: "⚠️ Usa: `.toemoji 🌀` (1 solo emoji)" }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  emojiData[chatId] = emoji;
  fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));

  return conn.sendMessage(chatId, { text: `✅ Emoji cambiado a: ${emoji}` }, { quoted: msg });
};

// Resetear emoji al predeterminado ➤
const resetemoji = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin) {
    return conn.sendMessage(chatId, { text: "❌ Solo administradores pueden restaurar el emoji." }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};

  if (emojiData[chatId]) {
    delete emojiData[chatId];
    fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));
    return conn.sendMessage(chatId, { text: "✅ Emoji restaurado a ➤" }, { quoted: msg });
  } else {
    return conn.sendMessage(chatId, { text: "ℹ️ Este grupo ya usa el emoji por defecto." }, { quoted: msg });
  }
};

handler.command = ["todos", "tagall", "invocar"];
handler.tags = ["group"];
handler.help = [".todos <mensaje>"];
handler.disabled = false;

toemoji.command = ["toemoji"];
toemoji.tags = ["group"];
toemoji.help = [".toemoji <emoji>"];
toemoji.disabled = false;

resetemoji.command = ["resetemoji"];
resetemoji.tags = ["group"];
resetemoji.help = [".resetemoji"];
resetemoji.disabled = false;

module.exports = [handler, toemoji, resetemoji];