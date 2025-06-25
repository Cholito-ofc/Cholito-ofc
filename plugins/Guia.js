const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // URL fija del video que quieres enviar
  const mediaUrl = 'https://cdn.russellxz.click/b66b17c2.mp4';

  let message = `
╭┈〔 🤖 *GUÍA DE USO DEL BOT* 〕┈╮
┊ Bienvenido, estos son los comandos básicos:
┊
┊ ✅ ${global.prefix}menu - Muestra todos los comandos.
┊ ✅ ${global.prefix}despedidas on/off - Activa o desactiva las despedidas.
┊ ✅ ${global.prefix}info - Muestra información del bot.
┊ ✅ ${global.prefix}estado - Muestra el estado actual.
┊
┊ 📌 Recuerda usar el prefijo: ${global.prefix}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
`.trim();

  // Enviamos el video con la descripción
  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    caption: message
  }, { quoted: msg });

  // Reacción ✅
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["guia", "ayuda"];
module.exports = handler;