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

╭─⬣「 *Desbanear Usuario* 」⬣
│ ✅ Responde al mensaje del usuario o 
│ ✅ Usa: *.unban @usuario*
╰─⬣`
    }, { quoted: msg });
  }

  const banPath = path.resolve("./ban.json");
  const banData = fs.existsSync(banPath) ? JSON.parse(fs.readFileSync(banPath)) : {};
  if (!banData[chatId]) banData[chatId] = [];

  if (banData[chatId].includes(target)) {
    banData[chatId] = banData[chatId].filter(u => u !== target);
    fs.writeFileSync(banPath, JSON.stringify(banData, null, 2));

    await conn.sendMessage(chatId, {
      text: `✅ *Usuario desbaneado correctamente.*

╭─⬣「 *Desbaneo Exitoso* 」⬣
│ 👤 Usuario: @${target.split("@")[0]}
│ 🔓 Acción: *DESBANEADO*
╰─⬣

> 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 ⚡`,
      mentions: [target]
    }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ *Este usuario no estaba baneado.*

╭─⬣「 *Usuario No Baneado* 」⬣
│ 👤 Usuario: @${target.split("@")[0]}
│ ℹ️ Estado: No estaba baneado
╰─⬣`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["unban"];
module.exports = handler;