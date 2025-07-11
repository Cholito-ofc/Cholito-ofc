const handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat];
  try {
    let text = m.text.toLowerCase();

    if (chat.audios) {
      switch (text) {
        case 'tarado':
          await conn.sendPresenceUpdate('recording', m.chat);
          await conn.sendFile(m.chat, 'https://qu.ax/CoOd.mp3', 'tarado.mp3', null, m, true, { type: 'audioMessage' });
          break;

        case 'teamo':
          await conn.sendPresenceUpdate('recording', m.chat);
          await conn.sendFile(m.chat, 'https://cdn.russellxz.click/4a69e7be.mp3', 'teamo.mp3', null, m, true, { type: 'audioMessage' });
          break;

        case 'tka':
          await conn.sendPresenceUpdate('recording', m.chat);
          await conn.sendFile(m.chat, 'https://qu.ax/jakw.mp3', 'tka.mp3', null, m, true, { type: 'audioMessage' });
          break;

        case 'buen dia grupo':
          await conn.sendPresenceUpdate('recording', m.chat);
          await conn.sendFile(m.chat, 'https://qu.ax/GoKq.mp3', 'buen_dia_grupo.mp3', null, m, true, { type: 'audioMessage' });
          break;

        // 🔁 Agregá más aquí si querés
      }
    }
  } catch (err) {
    console.error(err);
    m.reply('❌ Ocurrió un error al enviar el audio.');
  }
};

// 📌 Usá customPrefix con las palabras exactas
handler.customPrefix = /^(tarado|teamo|tka|buen dia grupo)$/i;
handler.command = /^$/; // Esto evita que cause conflicto con main.js

module.exports = handler;