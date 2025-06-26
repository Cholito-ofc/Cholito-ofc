const fetch = require('node-fetch');

let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Solo procesa si es evento de entrada (messageStubType 27)
  if (msg.messageStubType !== 27) return;

  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {};
  if (!global.db.data.chats[chatId].welcome) return;

  const group = await conn.groupMetadata(chatId);
  const participants = msg.messageStubParameters || [];

  for (let user of participants) {
    try {
      const name = (await conn.onWhatsApp(user))[0]?.notify || 'Nuevo Usuario';
      const members = group.participants.length;
      const groupName = group.subject;
      const pfp = await conn.profilePictureUrl(user, 'image').catch(() => 'https://i.imgur.com/5LzZk1A.png');

      const imageURL = `https://api.lolhuman.xyz/api/card/welcome?apikey=TuApiKey&pp=${encodeURIComponent(pfp)}&name=${encodeURIComponent(name)}&bg=https://i.imgur.com/OJ1kTgF.jpg&gcname=${encodeURIComponent(groupName)}&member=${members}&username=@${user.split('@')[0]}`;
      const buffer = await fetch(imageURL).then(res => res.buffer());

      const mensaje = `
👋 *¡Bienvenido(a) @${user.split('@')[0]}!*

📌 Grupo: *${groupName}*
👥 Miembros: *${members}*

✨ Preséntate y disfruta del grupo.
`.trim();

      await conn.sendMessage(chatId, {
        image: buffer,
        caption: mensaje,
        mentions: [user]
      });
    } catch (e) {
      console.log("❌ Error en welcome:", e);
    }
  }
};

handler.customPrefix = /^$/;
handler.group = true;
handler.botAdmin = true;
handler.listen = true;

module.exports = handler;