const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // ID limpio del usuario que pidió el comando
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // Obtener fecha en formato largo (ajustada a -1 día)
  const now = new Date();
  now.setDate(now.getDate() - 1); // CORRECCIÓN: restar 1 día

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
🔗 Con esta función KilluaBot enviará un mensaje de bienvenida...
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙨𝙥𝙚𝙙𝙞𝙙𝙖𝙨 𝙤𝙣/𝙤𝙛𝙛
🔗 Con esta función KilluaBot mandará un mensaje despidiendo...
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

// (el resto del mensaje sigue igual)
`.trim();

  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    gifPlayback: true,
    caption: message,
    mentions: [senderId]
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["guia", "ayuda"];
module.exports = handler;