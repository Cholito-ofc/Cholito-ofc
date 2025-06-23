// plugins/owner.js
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const ownerNum = "50489513153";
  const ownerName = "Cholito";

  // Enviar contacto
  await conn.sendMessage(chatId, {
    contacts: [{
      displayName: ownerName,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerNum}\nEND:VCARD`
    }]
  }, { quoted: msg });

  // Enviar mensaje personalizado
  await conn.sendMessage(chatId, {
    text: `👑 *Aquí tienes el contacto del owner: ${ownerName}*\n\n📞 *WhatsApp:* wa.me/${ownerNum}\n💬 *Puedes escribirle si necesitas ayuda, soporte o renovar servicios.*`,
  }, { quoted: msg });
};

handler.command = ["renovar"];
handler.tags = ["info"];
handler.help = [".owner"];

module.exports = handler;