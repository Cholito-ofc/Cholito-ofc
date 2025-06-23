const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("./emoji.json");

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
  const isOwner = senderNum === "50489513153";
  const isFromMe = msg.key.fromMe;

  if (!isGroup) return conn.sendMessage(chatId, { text: "⚠️ Este comando solo funciona en grupos." }, { quoted: msg });

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  const permisos = isAdmin || isOwner || isFromMe;
  if (!permisos) {
    return conn.sendMessage(chatId, {
      text: "❌ *Solo administradores u owner pueden usar este comando.*"
    }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  const usedEmoji = emojiData[chatId] || "➤";

  const extraMsg = args.join(" ").trim();
  const senderFlag = getFlagFromNumber(senderNum);
  const mentionList = metadata.participants.map(p => {
    const num = p.id.split("@")[0];
    const flag = getFlagFromNumber(num);
    return `${flag} ${usedEmoji} @${num}`;
  }).join("\n");

  const finalMsg = `╔『 🔊 INVOCACIÓN MASIVA 』╗
╟🔹 *KILLUA 2.0 BOT PRESENTE*
╟👤 *Invocado por:* ${senderFlag} @${senderNum}
${extraMsg ? `╟💬 *Mensaje:* ${extraMsg}` : ""}
╚═══════════════╝

📲 *Etiquetando a todos los miembros...*

${mentionList}`;

  const mentionIds = metadata.participants.map(p => p.id);

  await conn.sendMessage(chatId, {
    image: { url: "https://cdn.russellxz.click/c207ff27.jpeg" },
    caption: finalMsg,
    mentions: mentionIds
  }, { quoted: msg });
};

// Comando para establecer el emoji
const handlerEmoji = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const newEmoji = args[0];
  if (!newEmoji || newEmoji.length > 2) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Especifica un emoji válido. Ejemplo: `.toemoji 🌀`"
    }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  emojiData[chatId] = newEmoji;
  fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));

  await conn.sendMessage(chatId, { text: `✅ Emoji actualizado a: ${newEmoji}` }, { quoted: msg });
};

// Comando para resetear
const handlerReset = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};

  if (emojiData[chatId]) {
    delete emojiData[chatId];
    fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));
    await conn.sendMessage(chatId, { text: "✅ Emoji restaurado a ➤" }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, { text: "ℹ️ Este grupo ya usa el emoji por defecto." }, { quoted: msg });
  }
};

handler.command = ["todos", "tagall", "invocar"];
handler.tags = ["group"];
handler.help = [".todos <mensaje>"];

handlerEmoji.command = ["toemoji"];
handlerEmoji.tags = ["group"];
handlerEmoji.help = [".toemoji <emoji>"];

handlerReset.command = ["resetemoji"];
handlerReset.tags = ["group"];
handlerReset.help = [".resetemoji"];

module.exports = [handler, handlerEmoji, handlerReset];