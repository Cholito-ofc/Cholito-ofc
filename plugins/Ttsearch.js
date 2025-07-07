const axios = require("axios");

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`🎯 *Búsqueda de Videos TikTok*

📌 *Usa el comando así:*
.tiktoksearch <tema>

💡 *Ejemplo:*
.tiktoksearch humor negro

🔍 *KilluaBot buscará los mejores resultados para ti...*`
    }, { quoted: msg });
  }

  try {
    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    let results = response?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*"
      }, { quoted: msg });
    }

    // Reordenar aleatoriamente
    results.sort(() => Math.random() - 0.5);

    const topResults = results.slice(0, 5); // Solo 5 para no saturar

    for (let i = 0; i < topResults.length; i++) {
      const { nowm, title, author } = topResults[i];

      await conn.sendMessage(chatId, {
        video: { url: nowm },
        caption:
`🎬 *Resultado #${i + 1}*

📌 *Título:* ${title}
👤 *Autor:* ${author}
🔍 *Buscado por:* ${text}

━━━━━━━━━━━━━━
🪄 *KilluaBot - Buscador TikTok*`,
        mimetype: "video/mp4"
      }, { quoted: msg });
    }

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: "❌ *Error al buscar o enviar los videos:*\n" + err.message
    }, { quoted: msg });
  }
};

handler.command = ["ttsearch", "tiktoks"];
handler.tags = ["buscador"];
handler.help = ["tiktoksearch <tema>"];
handler.register = true;

module.exports = handler;