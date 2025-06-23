// plugins/renovar.js
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const ownerNum = "50489513153";
  const ownerName = "Cholito";

  try {
    // Botón arriba y mensaje debajo
    await conn.sendMessage(chatId, {
      text: `🔒 *Tu acceso al sistema está por finalizar o ya ha expirado.*\n\nSi deseas continuar utilizando el bot y mantener todas sus funciones activas, contacta con el Owner para renovar tu acceso.\n\n🛠️ Soporte personalizado, activación rápida y atención directa.\n\n👤 *Contacto:* ${ownerName}\n📞 *WhatsApp:* wa.me/${ownerNum}`,
      buttons: [
        { buttonId: ".renovar", buttonText: { displayText: "💼 CONTACTAR OWNER" }, type: 1 }
      ],
      footer: "",
      headerType: 1
    }, { quoted: msg });

    // Enviar contacto real
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