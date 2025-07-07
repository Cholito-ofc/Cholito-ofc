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

  // URL del video con sonido
  const mediaUrl = 'https://cdn.russellxz.click/c5e6438b.mp4';

  // Mensaje del menú guía
  let message = `
*👋🏻 Hola!* *@${senderClean}*
\`\`\`${fechaCapitalizada}\`\`\`

𝙈𝙐𝘾𝙃𝙊 𝙂𝙐𝙎𝙏𝙊, 𝙎𝙊𝙔 *𝙆𝙄𝙇𝙇𝙐𝘼-𝘽𝙊𝙏* 🤖
𝙔 𝙀𝙎𝙏𝙊𝙔 𝘼𝙌𝙐Í 𝙋𝘼𝙍𝘼 𝘼𝙔𝙐𝘿𝘼𝙍𝙏𝙀, ¡𝘾𝙊𝙈𝙀𝙉𝘾𝙀𝙈𝙊𝙎!

⚙️ ${global.prefix}welcome on/off
🔗 Activa o desactiva la bienvenida.

⚙️ ${global.prefix}despedidas on/off
🔗 Activa o desactiva la despedida.

⚙️ ${global.prefix}setwelcome / delwelcome
🔗 Personaliza o elimina la bienvenida.

⚙️ ${global.prefix}setbye / delbye
🔗 Personaliza o elimina la despedida.

⚙️ ${global.prefix}reporte
🔗 Reporta errores al creador.

⚙️ ${global.prefix}programargrupo
🔗 Programa cuándo abrir o cerrar el grupo.

⚙️ ${global.prefix}todos
🔗 Menciona a todos automáticamente.

⚙️ ${global.prefix}play
🔗 Descarga música desde YouTube.

⚙️ ${global.prefix}sticker
🔗 Crea stickers con fotos o videos.

⚙️ ${global.prefix}abrirgrupo / cerrargrupo
🔗 Controla quién puede escribir en el grupo.

⚙️ ${global.prefix}creador
🔗 Información del creador del bot.
`.trim();

  // Enviar el video con sonido
  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    caption: message,
    mentions: [senderId],
  }, { quoted: msg });

  // Reacción de confirmación
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["guia", "ayuda"];
module.exports = handler;