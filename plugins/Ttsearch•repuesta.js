const { tempTikTokSearch } = require("./ttsearch");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const num = parseInt(body.trim());

  // Validar si es número válido
  if (!Number.isInteger(num) || num < 1 || num > 10) return;

  // Verificar si hay resultados almacenados
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

  // Limpiar resultados temporales
  delete tempTikTokSearch[sender];
};

handler.customPrefix = /^([1-9]|10)$/i;
handler.command = new RegExp(""); // obligatorio para capturar solo respuestas numéricas

module.exports = handler;