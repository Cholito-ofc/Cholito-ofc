// plugins/renovar.js
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const ownerNum = "50489513153";
  const ownerName = "Cholito";

  // Enviar contacto del owner
  await conn.sendMessage(chatId, {
    contacts: [{
      displayName: ownerName,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerNum}\nEND:VCARD`
    }]
  }, { quoted: msg });

  // Enviar mensaje de confirmación
  await conn.sendMessage(chatId, {
    text: `📞 *Para renovar tu acceso, contacta con:*\n\n👑 *${ownerName}*\n🔗 wa.me/${ownerNum}`,
  }, { quoted: msg });
};

handler.command = ["renovar"];
handler.tags = ["info"];
handler.help = [".renovar"];

module.exports = handler;