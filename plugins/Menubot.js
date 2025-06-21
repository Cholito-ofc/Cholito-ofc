const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Pon aquí tu URL de video (mp4, mov, webm, etc.)
  const videoUrl = 'https://cdn.russellxz.click/1ce86032.mp4';

  // Personaliza el texto del menú aquí:
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

  await conn.sendMessage(
    chatId,
    {
      video: { url: videoUrl },
      caption: menuText.trim()
    },
    { quoted: msg }
  );
};

handler.command = ['menu', 'soy'];
module.exports = handler;