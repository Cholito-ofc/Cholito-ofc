const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // ID limpio del usuario que pidió el comando
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // Obtener fecha en formato largo: jueves, 25 de junio de 2025
  const now = new Date();
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const diaSemana = dias[now.getDay()];
  const dia = now.getDate();
  const mes = meses[now.getMonth()];
  const año = now.getFullYear();
  const fechaLarga = `${diaSemana}, ${dia} de ${mes} de ${año}`;

  // URL del video animado (tipo GIF)
  const mediaUrl = 'https://cdn.russellxz.click/b66b17c2.mp4';

  // Mensaje del menú guía
  let message = `
*Hola @${senderClean} 👋*
📅 ${fechaLarga}

𝙈𝙐𝘾𝙃𝙊 𝙂𝙐𝙎𝙏𝙊 𝙎𝙊𝙔 *𝙆𝙄𝙇𝙇𝙐𝘼-𝘽𝙊𝙏* 𝙔 𝙀𝙎𝙏𝙊𝙔 𝘼𝙌𝙐Í 𝙋𝘼𝙍𝘼 𝘼𝙔𝙐𝘿𝘼𝙍𝙏𝙀, 𝘾𝙊𝙈𝙀𝙉𝘾𝙀𝙈𝙊𝙎...

⚙️${global.prefix}𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙤𝙣/𝙤𝙛𝙛
🔗 Con esta función KilluaBot enviará un mensaje de bienvenida al usuario que entre el grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙨𝙥𝙚𝙙𝙞𝙙𝙖𝙨 𝙤𝙣/𝙤𝙛𝙛
🔗 Con esta función KilluaBot mandará un mensaje despidiendo al usuario que salió del grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙎𝙚𝙩𝙬𝙚𝙡𝙘𝙤𝙢𝙚
🔗 Personaliza el mensaje de bienvenida para nuevos miembros.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙡𝙬𝙚𝙡𝙘𝙤𝙢𝙚
🔗 Elimina el mensaje personalizado de bienvenida.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙎𝙚𝙩𝙗𝙮𝙚
🔗 Personaliza el mensaje de despedida.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙡𝙗𝙮𝙚
🔗 Elimina tu mensaje de despedida personalizado.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙍𝙚𝙥𝙤𝙧𝙩
🔗 Reporta errores o problemas al creador.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙋𝙧𝙤𝙜𝙧𝙖𝙢𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Configura horarios para abrir o cerrar el grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙏𝙤𝙙𝙤𝙨
🔗 Menciona automáticamente a todos los miembros.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙋𝙡𝙖𝙮
🔗 Envía música desde YouTube.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙎𝙩𝙞𝙘𝙠𝙚𝙧
🔗 Crea stickers a partir de imágenes o videos.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘼𝙗𝙧𝙞𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Abre el grupo para que todos puedan escribir.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘾𝙚𝙧𝙧𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Cierra el grupo para que solo admins escriban.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘾𝙧𝙚𝙖𝙙𝙤𝙧
🔗 Información del creador de KilluaBot.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
`.trim();

  // Enviamos el video como GIF animado (se reproduce automáticamente)
  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    gifPlayback: true,
    caption: message,
    mentions: [senderId]
  }, { quoted: msg });

  // Reacción ✅
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["guia", "ayuda"];
module.exports = handler;