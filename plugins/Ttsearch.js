const axios = require("axios");

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`🎯 *Búsqueda TikTok*

Usa el comando así:
.tiktoksearch <tema>

Ejemplo:
.tiktoksearch anime`,
    }, { quoted: msg });
  }

  try {
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    const results = data?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "❌ No se encontraron resultados.",
      }, { quoted: msg });
    }

    const topVideos = results.slice(0, 5);
    const album = [];

    for (let i = 0; i < topVideos.length; i++) {
      const { nowm, title, author, duration, likes } = topVideos[i];
      const caption =
`🎬 *${title || 'Sin título'}*
👤 *Autor:* ${author || 'Desconocido'}
⏱️ *Duración:* ${duration || 'Desconocida'}
❤️ *Likes:* ${likes || 0}`;

      album.push({
        video: { url: nowm },
        mimetype: 'video/mp4',
        caption: i === 0 ? caption : undefined, // Solo el primero con caption
      });
    }

    // Enviar los videos al mismo tiempo (lo más cercano a un álbum real)
    await Promise.all(
      album.map(media => conn.sendMessage(chatId, media, { quoted: msg }))
    );

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: `❌ Error al buscar o enviar los videos:\n${err.message}`,
    }, { quoted: msg });
  }
};

handler.command = ["ttsearch", "tiktoksearch"];
handler.tags = ['buscador'];
handler.help = ['tiktoksearch <tema>'];

module.exports = handler;