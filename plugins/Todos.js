// plugins/todos.js
const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("./emoji.json");

// Mapeo de banderas
function getFlagFromNumber(number) {
  const flags = {
    "504": "🇭🇳", "502": "🇬🇹", "503": "🇸🇻", "505": "🇳🇮", "506": "🇨🇷",
    "507": "🇵🇦", "51": "🇵🇪", "52": "🇲🇽", "54": "🇦🇷", "55": "🇧🇷",
    "56": "🇨🇱", "57": "🇨🇴", "58": "🇻🇪", "591": "🇧🇴", "593": "🇪🇨",
    "595": "🇵🇾", "34": "🇪🇸", "1": "🇺🇸"
  };
  const code = Object.keys(flags).find(k => number.startsWith(k));
  return flags[code] || "🌐";
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Verificación permisos
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
      text: "🚫 *Solo administradores, el owner o el bot pueden usar este comando.*"
    }, { quoted: msg });
  }

  // Cargar o crear el emoji
  const emojiData = fs.existsSync(emojiPath)
    ? JSON.parse(fs.readFileSync(emojiPath, "utf-8"))
    : {};
  const emoji = emojiData[chatId] || "➤";

  const mentionIds = metadata.participants.map(p => p.id);
  const lines = metadata.participants.map(p => {
    const num = p.id.split("@")[0];
    return `${getFlagFromNumber(num)} ${emoji} @${num}`;
  });

  const textoExtra = args.join(" ");
  const senderMention = `@${senderNum}`;

  const mensaje = `
╭─────⭑『 *📢 INVOCACIÓN GENERAL* 』⭑─────╮
│ 👤 *Invocado por:* ${senderMention}
${textoExtra ? `│ ✏️ *Mensaje:* ${textoExtra}` : ""}
╰─────────────────────────────╯

📋 *Etiquetando a todos los miembros:*
${lines.join("\n")}
`;

  // Ver si se respondió con imagen
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const hasImage = quoted?.imageMessage;

  if (hasImage) {
    const buffer = await conn.downloadMediaMessage({ message: quoted });
    await conn.sendMessage(chatId, {
      image: buffer,
      caption: mensaje,
      mentions: mentionIds
    }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, {
      text: mensaje,
      mentions: mentionIds
    }, { quoted: msg });
  }
};

handler.command = ["todos", "tagall", "mencionar"];
handler.tags = ["group"];
handler.help = ["todos <texto>"];
module.exports = handler;