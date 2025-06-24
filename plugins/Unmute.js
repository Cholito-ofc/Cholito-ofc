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
      text: "🚫 Este comando solo puede usarse en *grupos*."
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;

  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "⛔ Solo *administradores* o el *dueño* del bot pueden usar este comando."
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  let target = context?.participant;

  // Si no respondió, buscar en las menciones
  if (!target && args.length > 0) {
    const mention = args[0].replace(/[@+]/g, "").replace(/[^0-9]/g, "");
    target = metadata.participants.find(p => p.id.startsWith(mention))?.id + "@s.whatsapp.net";
  }

  if (!target) {
    return conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto del comando*

╭─⬣「 *Desmutear Usuario* 」⬣
│ 🔊 Responde al mensaje del usuario o 
│ 🔊 Usa: *.unmute @usuario*
╰─⬣`
    }, { quoted: msg });
  }

  const mutePath = path.resolve("./mute.json");
  const muteData = fs.existsSync(mutePath) ? JSON.parse(fs.readFileSync(mutePath)) : {};
  if (!muteData[chatId]) muteData[chatId] = [];

  if (muteData[chatId].includes(target)) {
    muteData[chatId] = muteData[chatId].filter(u => u !== target);
    fs.writeFileSync(mutePath, JSON.stringify(muteData, null, 2));

    await conn.sendMessage(chatId, {
      text: `✅ *Usuario desmuteado correctamente.*

╭─⬣「 *Desmuteo Exitoso* 」⬣
│ 🔊 Usuario: @${target.split("@")[0]}
│ 🔓 Acción: *DESMUTEADO*
╰─⬣

> 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 ⚡`,
      mentions: [target]
    }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ *Este usuario no estaba muteado.*

╭─⬣「 *Usuario No Muteado* 」⬣
│ 🔊 Usuario: @${target.split("@")[0]}
│ ℹ️ Estado: No estaba muteado
╰─⬣`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["unmute"];
module.exports = handler;