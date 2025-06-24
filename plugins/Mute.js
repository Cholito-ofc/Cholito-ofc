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
      text: "📛 *Este comando solo puede usarse en grupos.*"
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;
  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Acceso denegado*\nSolo los *admins* o *dueños* del bot pueden usar este comando."
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentionedJid = context?.mentionedJid || [];

  let target = null;

  // Opción 1: responder a mensaje
  if (context?.participant) {
    target = context.participant;
  }
  // Opción 2: mencionar con @
  else if (mentionedJid.length > 0) {
    target = mentionedJid[0];
  }

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "📍 *Debes responder al mensaje o mencionar con @ al usuario que deseas mutear.*"
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  const isTargetOwner = global.owner.some(([id]) => id === targetNum);

  if (isTargetOwner) {
    return conn.sendMessage(chatId, {
      text: "❌ *No puedes mutear al dueño del bot.*"
    }, { quoted: msg });
  }

  const mutePath = path.resolve("./mute.json");
  const muteData = fs.existsSync(mutePath) ? JSON.parse(fs.readFileSync(mutePath)) : {};
  if (!muteData[chatId]) muteData[chatId] = [];

  if (!muteData[chatId].includes(target)) {
    muteData[chatId].push(target);
    fs.writeFileSync(mutePath, JSON.stringify(muteData, null, 2));

    await conn.sendMessage(chatId, {
      text:
`🔇 *El usuario ha sido silenciado en el grupo.*

╭─⬣「 *Usuario Silenciado* 」⬣
│ 👤 Usuario: @${target.split("@")[0]}
│ 🚫 Estado: Muteado
╰─⬣`,
      mentions: [target]
    }, { quoted: msg });

  } else {
    await conn.sendMessage(chatId, {
      text:
`⚠️ *Este usuario ya está silenciado.*

╭─⬣「 *Ya Silenciado* 」⬣
│ 👤 Usuario: @${target.split("@")[0]}
│ 🔇 Estado: Muteado
╰─⬣`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["mute"];
module.exports = handler;