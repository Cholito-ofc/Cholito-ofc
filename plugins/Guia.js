const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // ID limpio del usuario que pidió el comando
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // Obtener la fecha actual (formato dd/mm/yyyy)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // URL fija del video (GIF animado)
  const mediaUrl = 'https://cdn.russellxz.click/b66b17c2.mp4';

  // Guía adaptada con mención y fecha
  let message = `
*Hola @${senderClean} 👋*
\`\`\`${fechalarga}\`\`\`

𝙈𝙐𝘾𝙃𝙊 𝙂𝙐𝙎𝙏𝙊 𝙎𝙊𝙔 *𝙆𝙄𝙇𝙇𝙐𝘼-𝘽𝙊𝙏* 𝙔 𝙀𝙎𝙏𝙊𝙔 𝘼𝙌𝙐Í 𝙋𝘼𝙍𝘼 𝘼𝙔𝙐𝘿𝘼𝙍𝙏𝙀, 𝘾𝙊𝙈𝙀𝙉𝘾𝙀𝙈𝙊𝙎...

⚙️${global.prefix}𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙤𝙣/𝙤𝙛𝙛
🔗 Con esta función KilluaBot enviará un mensaje de bienvenida al usuario que entre el grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙨𝙥𝙚𝙙𝙞𝙙𝙖𝙨 𝙤𝙣/𝙤𝙛𝙛
🔗 Con esta función KilluaBot mandará un mensaje despidiendo al usuario que salió del grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙎𝙚𝙩𝙬𝙚𝙡𝙘𝙤𝙢𝙚
🔗 𝘊𝘰𝘯 𝘦𝘴𝘵𝘢 𝘧𝘶𝘯𝘤𝘪𝘰́𝘯 𝘱𝘰𝘥𝘳𝘢́𝘴 𝘱𝘦𝘳𝘴𝘰𝘯𝘢𝘭𝘪𝘻𝘢𝘳 𝘭𝘢 𝘣𝘪𝘦𝘯𝘷𝘦𝘯𝘪𝘥𝘢 𝘥𝘦𝘭 𝘶𝘴𝘶𝘢𝘳𝘪𝘰 𝘢𝘭 𝘨𝘳𝘶𝘱𝘰. 
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙡𝙬𝙚𝙡𝙘𝙤𝙢𝙚
🔗 𝘊𝘰𝘯 𝘦𝘴𝘵𝘢 𝘧𝘶𝘯𝘤𝘪𝘰́𝘯 𝘱𝘰𝘥𝘳𝘢́𝘴 𝘦𝘭𝘪𝘮𝘪𝘯𝘢𝘳 𝘦𝘭 𝘮𝘦𝘯𝘴𝘢𝘫𝘦 𝘱𝘦𝘳𝘴𝘰𝘯𝘢𝘭𝘪𝘻𝘢𝘥𝘰 𝘥𝘦 𝘭𝘢 𝘣𝘪𝘦𝘯𝘷𝘦𝘯𝘪𝘥𝘢. 
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

🔗${global.prefix}𝙎𝙚𝙩𝙗𝙮𝙚
𝘊𝘰𝘯 𝘦𝘴𝘵𝘢 𝘧𝘶𝘯𝘤𝘪𝘰́𝘯 𝘱𝘰𝘥𝘳𝘢́𝘴 𝘱𝘦𝘳𝘴𝘰𝘯𝘢𝘭𝘪𝘻𝘢𝘳 𝘦𝘭 𝘮𝘦𝘯𝘴𝘢𝘫𝘦 𝘥𝘦 𝘥𝘦𝘴𝘱𝘦𝘥𝘪𝘥𝘢 𝘦𝘯 𝘦𝘭 𝘨𝘳𝘶𝘱𝘰.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘿𝙚𝙡𝙗𝙮𝙚
🔗 𝘊𝘰𝘯 𝘦𝘴𝘵𝘢 𝘧𝘶𝘯𝘤𝘪𝘰́𝘯 𝘱𝘰𝘥𝘳𝘢́𝘴 𝘦𝘭𝘪𝘮𝘪𝘯𝘢𝘳 𝘵𝘶́ 𝘮𝘦𝘯𝘴𝘢𝘫𝘦 𝘱𝘦𝘳𝘴𝘰𝘯𝘢𝘭𝘪𝘻𝘢𝘥𝘰 𝘱𝘢𝘳𝘢 𝘭𝘢𝘴 𝘥𝘦𝘴𝘱𝘦𝘥𝘪𝘥𝘢𝘴 𝘤𝘶𝘢𝘯𝘥𝘰 𝘦𝘭 𝘶𝘴𝘶𝘢𝘳𝘪𝘰 𝘴𝘢𝘭𝘦 𝘥𝘦𝘭 𝘎𝘳𝘶𝘱𝘰. 
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙍𝙚𝙥𝙤𝙧𝙩
🔗 Con esta función podrás enviar algún reporte técnico a mi creador.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙋𝙧𝙤𝙜𝙧𝙖𝙢𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función podrás abrir / cerrar el grupo automáticamente.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙏𝙤𝙙𝙤𝙨
🔗 Con esta función KilluaBot mencionará a todos automáticamente.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙋𝙡𝙖𝙮
🔗 Con esta función KilluaBot te mandará la música que desees.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝙎𝙩𝙞𝙘𝙠𝙚𝙧
🔗 Con esta función KilluaBot te hará un sticker.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘼𝙗𝙧𝙞𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función KilluaBot abrirá el grupo por ti.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘾𝙚𝙧𝙧𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función KilluaBot cerrará el grupo por ti.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️${global.prefix}𝘾𝙧𝙚𝙖𝙙𝙤𝙧
🔗 Con esta función encontrarás el contacto de mi creador.
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