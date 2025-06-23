// plugins/renovar.js
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

  if (!command.startsWith(".renovar")) return; // Asegura que solo responde a .renovar

  console.log("[RENOVAR] Comando recibido en:", chatId); // Para ver si entra

  const ownerNum = "50489513153";
  const ownerName = "Cholito";

  try {
    // Enviar contacto
    await conn.sendMessage(chatId, {
      contacts: [{
        displayName: ownerName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerNum}\nEND:VCARD`
      }]
    }, { quoted: msg });

    // Enviar mensaje
    await conn.sendMessage(chatId, {
      text: `📞 *Para renovar tu acceso, contacta con:*\n\n👑 *${ownerName}*\n🔗 wa.me/${ownerNum}`
    }, { quoted: msg });

  } catch (e) {
    console.error("[ERROR en .renovar]", e);
    await conn.sendMessage(chatId, { text: "❌ Error al enviar el contacto." }, { quoted: msg });
  }
};

handler.command = ["renovar"];
handler.tags = ["info"];
handler.help = [".renovar"];

module.exports = handler;