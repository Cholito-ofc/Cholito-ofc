const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("emoji.json");

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

async function todosHandler(msg, { conn, args }) {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) return conn.sendMessage(chatId, { text: "⚠️ Este comando solo funciona en grupos." }, { quoted: msg });

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin) return conn.sendMessage(chatId, { text: "🚫 Solo administradores pueden usar este comando." }, { quoted: msg });

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  const emoji = emojiData[chatId] || "➤";
  const mentionIds = metadata.participants.map(p => p.id);

  const lines = metadata.participants.map(p => {
    const num = p.id.split("@")[0];
    return `${getFlagFromNumber(num)} ${emoji} @${num}`;
  });

  const texto = args.join(" ");
  const msgTexto = `╔『 🔊 INVOCACIÓN MASIVA 』╗
╟🧿 *Invocado por:* @${senderNum}
${texto ? `╟💬 *Mensaje:* ${texto}` : ""}
╚═══════════════╝

${lines.join("\n")}`;

  await conn.sendMessage(chatId, {
    text: msgTexto,
    mentions: mentionIds
  }, { quoted: msg });
}

async function toemojiHandler(msg, { conn, args }) {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) return conn.sendMessage(chatId, { text: "⚠️ Este comando solo funciona en grupos." }, { quoted: msg });

  const metadata = await conn.groupMetadata(chatId);
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  if (!isAdmin) return conn.sendMessage(chatId, { text: "🚫 Solo administradores pueden cambiar el emoji." }, { quoted: msg });

  const nuevoEmoji = args[0];
  if (!nuevoEmoji || nuevoEmoji.length > 2) {
    return conn.sendMessage(chatId, { text: "⚠️ Usa: `.toemoji 🔥` (solo un emoji)" }, { quoted: msg });
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  emojiData[chatId] = nuevoEmoji;
  fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));

  return conn.sendMessage(chatId, { text: `✅ Emoji cambiado a: ${nuevoEmoji}` }, { quoted: msg });
}

// Exporte los handlers
module.exports = {
  command: ["todos", "tagall", "invocar", "toemoji"],
  handler: async function (msg, context) {
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
    const command = body.split(" ")[0].toLowerCase();
    const args = body.trim().split(/\s+/).slice(1);

    if (command === ".todos" || command === ".tagall" || command === ".invocar") {
      return await todosHandler(msg, { ...context, args });
    }

    if (command === ".toemoji") {
      return await toemojiHandler(msg, { ...context, args });
    }
  },
  help: [".todos", ".toemoji <emoji>"],
  tags: ["group"]
};