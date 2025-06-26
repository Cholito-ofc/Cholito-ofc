const yts = require('yt-search');
const axios = require('axios');
const FormData = require('form-data');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function youtubeMp3(url) {
  try {
    const ds = new FormData();
    ds.append("url", url);

    const { data } = await axios.post(
      "https://www.youtubemp3.ltd/convert",
      ds,
      {
        headers: {
          ...ds.getHeaders(),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 45000
      }
    );

    if (!data || !data.link) {
      return { success: false, error: "No se pudo obtener el enlace de descarga" };
    }

    return {
      success: true,
      data: {
        title: data.filename || "Título desconocido",
        downloadUrl: data.link,
        type: "mp3"
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Error al convertir a MP3"
    };
  }
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!args.length) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso:* .play Joji - Glimpse of Us
╰─⬣`
    }, { quoted: msg });
  }

  const query = args.join(" ");
  await conn.sendMessage(chatId, { react: { text: '🔍', key: msg.key } });

  try {
    const search = await yts(query);
    const video = search.videos[0];

    if (!video) throw 'No se encontró el video.';

    const { url: videoUrl, title, duration, author, image } = video;

    const mp3Result = await youtubeMp3(videoUrl);
    if (!mp3Result.success) throw mp3Result.error;

    const caption = `🎶 *PLAY AUDIO*

📌 *Título:* ${title}
🎙️ *Artista:* ${author.name}
⏱️ *Duración:* ${duration}
🔗 *URL:* ${videoUrl}

> Pedido de: @${sender.split('@')[0]}
> ⏳ *Descargando audio...*

~ KilluaBot Music 🎧`;

    // Enviar imagen + info
    await conn.sendMessage(chatId, {
      image: { url: image },
      caption: caption,
      mentions: [sender]
    }, { quoted: msg });

    // Enviar audio
    await wait(2000);
    await conn.sendMessage(chatId, {
      audio: { url: mp3Result.data.downloadUrl },
      mimetype: "audio/mp4",
      fileName: `${title}.mp3`,
      mentions: [sender]
    }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al procesar la canción*\n\n${e.toString().slice(0, 300)}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
  }
};

handler.command = ['play', 'song', 'musica'];
module.exports = handler;