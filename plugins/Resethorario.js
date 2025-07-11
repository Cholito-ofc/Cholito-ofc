const fs = require("fs");
const path = require("path");

const horariosPath = path.resolve("./horarios_grupo.json");

function cargarHorarios() {
  if (!fs.existsSync(horariosPath)) return {};
  return JSON.parse(fs.readFileSync(horariosPath, "utf-8"));
}

function guardarHorarios(data) {
  fs.writeFileSync(horariosPath, JSON.stringify(data, null, 2));
}

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: "🚫 *Solo admins, owner o bot pueden usar este comando.*" }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando en privado.*" }, { quoted: msg });
  }

  let data = cargarHorarios();
  if (data[chatId]) {
    delete data[chatId];
    guardarHorarios(data);
    return conn.sendMessage(chatId, { text: "🗑️ *Horario programado eliminado correctamente.*", quoted: msg });
  } else {
    return conn.sendMessage(chatId, { text: "⚠️ *No hay horarios programados para este grupo.*", quoted: msg });
  }
};

handler.command = ["resethorario"];
handler.tags = ["group"];
handler.help = ["resethorario"];
module.exports = handler;