const { tempTikTokSearch } = require("./ttsearch");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const num = parseInt(body.trim());

  if (!Number.isInteger(num) || num < 1 || num > 10) return; // Ignorar si no es un número válido

  // Verificamos si hay búsqueda guardada
  const results = tempTikTokSearch[sender];
  if (!results || results.length === 0) {
    return conn.sendMessage(chatId, {
      text: "⏳ *No hay búsqueda activa.* Usa `.ttsearch <tema>` primero."
    }, { quoted: msg });
  }

  const selected = results.slice(0, num);

  await conn.sendMessage(chatId, {
    text: `📦 *Enviando ${selected.length} video(s)...*`
  }, { quoted: msg });

  for (let i = 0; i < selected.length; i++) {
    const { nowm, title, author } = selected[i];

    await conn.sendMessage(chatId, {
      video: { url: nowm },
      caption:
`🎬 *Video #${i + 1}*

📌 *Título:* ${title}
👤 *Autor:* ${author}
🎯 *Solicitado por:* @${sender.split("@")[0]}

━━━━━━━━━━━━━━
🪄 *KilluaBot - Buscador TikTok*`,
      mimetype: "video/mp4",
      mentions: [sender]
    }, { quoted: msg });
  }

  delete tempTikTokSearch[sender]; // Limpiar para no repetir
};

handler.customPrefix = /^([1-9]|10)$/i;
handler.command = new RegExp(""); // Obligatorio para respuestas numéricas

module.exports = handler;