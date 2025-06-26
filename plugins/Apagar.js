const fs = require("fs");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // 🚫 Si no es owner
  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: `🚫 *Acceso denegado:*\nEste comando es exclusivo para el *propietario del bot*.`,
      mentions: [sender]
    }, { quoted: msg });
  }

  // ✅ Guardar apagado en el archivo
  const filePath = "./activos.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  if (!data.apagado) data.apagado = {};
  data.apagado[chatId] = true;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // 🎉 Mensaje personalizado
  const mensaje = `
╭━━━[ 🔒 *MODO APAGADO* ]━━⬣
┃
┃ 💥 *Estado:* El bot ha sido *desactivado* en este grupo.
┃ 📵 *Comandos:* No responderá más hasta ser reactivado.
┃ 👑 *Acción por:* @${senderNum}
┃
╰━━━━━━━━━━━━━━━━━━━━⬣`;

  await conn.sendMessage(chatId, {
    text: mensaje.trim(),
    mentions: [sender]
  }, { quoted: msg });
};

handler.command = ["apagar"];
module.exports = handler;