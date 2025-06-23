// plugins/renovar.js
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const ownerNum = "50489513153";
  const ownerName = "Cholito";

  try {
    // Mensaje principal con botón arriba (sin enlace, solo texto)
    await conn.sendMessage(chatId, {
      text: `👑 *RENOVAR ACCESO*`,
      buttons: [
        { buttonId: ".renovar", buttonText: { displayText: "💼 CONTACTAR OWNER" }, type: 1 }
      ],
      footer: `Hola, si necesitas renovar tu acceso, aquí tienes el contacto del owner.\n\n📞 WhatsApp: wa.me/50489513153${ownerNum}`,
      headerType: 1
    }, { quoted: msg });

    // Contacto real del owner
    await conn.sendMessage(chatId, {
      contacts: {
        displayName: ownerName,
        contacts: [
          {
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${ownerNum}\nEND:VCARD`
          }
        ]
      }
    }, { quoted: msg });

  } catch (e) {
    console.error("[ERROR en .renovar]", e);
    await conn.sendMessage(chatId, { text: "❌ No se pudo enviar el contacto." }, { quoted: msg });
  }
};

handler.command = ["renovar"];
handler.tags = ["info"];
handler.help = [".renovar"];

module.exports = handler;