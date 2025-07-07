const axios = require("axios");

// Objeto temporal para guardar resultados por usuario
const tempTikTokSearch = {};

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`🎯 *Búsqueda de Videos TikTok*

📌 *Usa el comando así:*
.ttsearch edits de Messi

💡 *KilluaBot buscará hasta 10 resultados para ti...*`
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

    results = results.slice(0, 10); // máximo 10 resultados

    // Guardar resultados temporalmente usando ID del usuario
    tempTikTokSearch[sender] = results;

    return conn.sendMessage(chatId, {
      text:
`🧠 *Se encontraron ${results.length} resultados para:* "${text}"

📥 *Responde con un número del 1 al ${results.length}* para recibir esa cantidad de videos.

🔢 *Ejemplo:* 5`
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: "❌ *Error al buscar en TikTok:*\n" + err.message
    }, { quoted: msg });
  }
};

handler.command = ["ttsearch"];
handler.tags = ["buscador"];
handler.help = ["ttsearch <tema>"];
handler.register = true;

// Exportamos resultados temporales para usar en el otro plugin
module.exports = handler;
module.exports.tempTikTokSearch = tempTikTokSearch;