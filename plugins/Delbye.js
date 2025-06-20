const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Verificación de permisos
  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*"
    }, { quoted: msg });
  }

  const jsonPath = path.resolve("./byemsgs.json");
  const data = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    : {};

  if (data[chatId]) {
    delete data[chatId];
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });
    return conn.sendMessage(chatId, {
      text: "✅ *Mensaje de despedida personalizado borrado!*\nAhora se usará el mensaje predeterminado.",
      quoted: msg
    });
  } else {
    return conn.sendMessage(chatId, {
      text: "ℹ️ *No hay mensaje de despedida personalizado para este grupo.*",
      quoted: msg
    });
  }
};

handler.command = ["delbye"];
handler.tags = ["group"];
handler.help = ["delbye"];
module.exports = handler;