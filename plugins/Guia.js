const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // ID limpio del usuario que pidió el comando
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // Obtener fecha real ajustada a Ciudad de México y con primera letra en mayúscula
  const fechaLarga = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'America/Mexico_City',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const fechaCapitalizada = fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1);

  // URL del video animado (tipo GIF)
  const mediaUrl = 'https://cdn.russellxz.click/c5e6438b.mp4';

  // Mensaje del menú guía
  let message = `
*👋🏻Hola!* *@${senderClean}*
\`\`\`${fechaCapitalizada}\`\`\`

𝙈𝙐𝘾𝙃𝙊 𝙂𝙐𝙎𝙏𝙊 𝙎𝙊𝙔 *𝙆𝙄𝙇𝙇𝙐𝘼-𝘽𝙊𝙏* 𝙔 𝙀𝙎𝙏𝙊𝙔 𝘼𝙌𝙐Í 𝙋𝘼𝙍𝘼 𝘼𝙔𝙐𝘿𝘼𝙍𝙏𝙀, 𝘾𝙊𝙈𝙀𝙉𝘾𝙀𝙈𝙊𝙎...

// ... resto del texto ...
`.trim();

  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    gifPlayback: true,  // clave para reproducción automática
    caption: message,
    mentions: [senderId],
  }, { quoted: msg });

  // Reacción ✅
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["guia", "ayuda"];
module.exports = handler;