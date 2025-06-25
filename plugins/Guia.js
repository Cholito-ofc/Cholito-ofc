const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // ID limpio del usuario que pidió el comando
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, '');

  // URL fija del video (GIF animado)
  const mediaUrl = 'https://cdn.russellxz.click/b66b17c2.mp4';

  // Guía adaptada con mención
  let message = `
Hola @${senderClean} 👋

𝙈𝙐𝘾𝙃𝙊 𝙂𝙐𝙎𝙏𝙊 𝙎𝙊𝙔 *𝙆𝙄𝙇𝙇𝙐𝘼-𝘽𝙊𝙏* 𝙔 𝙀𝙎𝙏𝙊𝙔 𝘼𝙌𝙐𝙄́ 𝙋𝘼𝙍𝘼 𝘼𝙔𝙐𝘿𝘼𝙍𝙏𝙀, 𝘾𝙊𝙈𝙀𝙉𝘾𝙀𝙈𝙊𝙎...

⚙️.𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙤𝙣
🔗 Con esta función KilluaBot enviará un mensaje de bienvenida al usuario que entre el grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙤𝙛𝙛
🔗 Con esta función KilluaBot mandará un mensaje despidiendo al usuario que salió del grupo.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙍𝙚𝙥𝙤𝙧𝙩
🔗 Con esta función podrás enviar algún reporte técnico a mi creador.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙋𝙧𝙤𝙜𝙧𝙖𝙢𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función podrás abrir / cerrar el grupo automáticamente.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙏𝙤𝙙𝙤𝙨
🔗 Con esta función KilluaBot mencionará a todos automáticamente.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙋𝙡𝙖𝙮
🔗 Con esta función KilluaBot te mandará la música que desees.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝙎𝙩𝙞𝙘𝙠𝙚𝙧
🔗 Con esta función KilluaBot te hará un sticker.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝘼𝙗𝙧𝙞𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función KilluaBot abrirá el grupo por ti.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝘾𝙚𝙧𝙧𝙖𝙧𝙜𝙧𝙪𝙥𝙤
🔗 Con esta función KilluaBot cerrará el grupo por ti.
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

⚙️.𝘾𝙧𝙚𝙖𝙙𝙤𝙧
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