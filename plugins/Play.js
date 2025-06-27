const yts = require('yt-search');
const axios = require('axios');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (!args || !args.join(" ").trim()) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ .play Anuel - Mejor Que Yo
╰─⬣
> ® 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝖢𝗁𝗈𝗅𝗂𝗍𝗈`,
    }, { quoted: msg });
  }

  const query = args.join(" ").trim();

  try {
    const results = await yts(query);
    const video = results.videos[0];
    if (!video) throw new Error("❌ No se encontró ningún video.");

    const { title, timestamp: duration, views, ago, url, thumbnail, author } = video;

    // Descargar la imagen en buffer
    let thumbBuffer;
    try {
      const { data } = await axios.get(thumbnail, { responseType: 'arraybuffer' });
      thumbBuffer = Buffer.from(data);
    } catch (e) {
      thumbBuffer = null;
    }

    // Texto de descripción
    const description = `🎵 Título: ${title}
🎬 Duración: ${duration}
📺 Canal: ${author.name}
👁️ Vistas: ${views.toLocaleString()}
📆 Publicado: ${ago}`;

    // Enviar preview como tarjeta enriquecida
    await conn.sendMessage(chatId, {
      text: description,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'KilluaBot - Descargador YouTube',
          mediaType: 1,
          previewType: 0,
          thumbnail: thumbBuffer,
          sourceUrl: url,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(chatId, {
      text: "❌ Ocurrió un error al buscar la canción. Intenta con otro nombre."
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;