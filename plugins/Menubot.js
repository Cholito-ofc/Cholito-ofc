const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Cambia la URL o path según tu archivo multimedia (imagen o video)
  // Ejemplo de imagen: const mediaPath = 'https://cdn.russellxz.click/1ce86032.mp4';
  // Ejemplo de video: const mediaPath = 'https://telegra.ph/file/1a4f0e9c1a37f3a5be36d.mp4';
  const mediaPath = 'https://cdn.russellxz.click/1ce86032.mp4'; // Cambia por tu imagen o video

  // Si es video, cambia el tipo abajo a 'video', si es imagen deja 'image'
  const mediaType = 'image'; // Cambia a 'video' si usas video

  // Personaliza tu menú aquí:
  const menuText = `
╭━━━〔 *🤖 MENÚ DEL BOT* 〕━━━✦
│
│  *Comandos disponibles:*
│
│  • .menu   - Ver este menú
│  • .report - Reportar errores/sugerencias
│  • .listgrupos - Ver grupos del bot
│  • .programargrupo - Programar horarios
│  • .aviso - Enviar aviso a un grupo
│
╰━━━━━━━━━━━━━━━━━━━━━━━✦
*Bot de Cholito-ofc*
  `;

  const mediaMessage = {};
  mediaMessage[mediaType] = { url: mediaPath };
  mediaMessage.caption = menuText.trim();

  await conn.sendMessage(chatId, mediaMessage, { quoted: msg });
};

handler.command = ['menu', 'soy'];
module.exports = handler;