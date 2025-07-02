const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "📛 *Este comando solo está disponible en grupos.*",
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentionedJid = context?.mentionedJid || [];

  let target = null;

  if (context?.participant) {
    target = context.participant;
  } else if (mentionedJid.length > 0) {
    target = mentionedJid[0];
  }

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "📍 *Debes responder o mencionar al usuario para ver sus advertencias.*",
    }, { quoted: msg });
  }

  const warnPath = path.resolve("./database/warns.json");
  const warnData = fs.existsSync(warnPath) ? JSON.parse(fs.readFileSync(warnPath)) : {};
  const totalWarns = warnData?.[chatId]?.[target] || 0;

  await conn.sendMessage(chatId, {
    text:
`📋 *Advertencias actuales*

╭─⬣「 *Ver Warns* 」⬣
│ 👤 Usuario: @${target.split("@")[0]}
│ ⚠️ Advertencias: ${totalWarns}/3
╰─⬣`,
    mentions: [target]
  }, { quoted: msg });
};

handler.command = ["verwarns"];
module.exports = handler;