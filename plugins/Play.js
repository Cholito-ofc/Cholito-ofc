const yts = require('yt-search');
const axios = require('axios');

// Configuración de reintentos
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

// Función de descarga usando Anomaki
async function getDownloadUrl(videoUrl) {
  const apiUrl = 'https://www.apis-anomaki.zone.id/downloader/yta?url=';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(`${apiUrl}${encodeURIComponent(videoUrl)}`, {
        timeout: TIMEOUT_MS
      });

      const data = res.data;
      if (data?.result?.url) {
        return {
          url: data.result.url.trim(),
          title: data.result.title || 'Audio'
        };
      }

    } catch {
      if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
    }
  }

  return null;
}

// Envía el audio como mensaje de voz
async function sendAudio(conn, chatId, audioUrl, quotedMsg, fileName) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chatId,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          fileName
        },
        { quoted: quotedMsg }
      );
      return true;
    } catch {
      if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
    }
  }
  return false;
}

// Handler del comando .play
const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderMention = '@' + sender.split('@')[0];

  if (!args.length) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso:* .play Anuel - Más rica que ayer
╰─⬣`,
    }, { quoted: msg });
  }

  const query = args.join(" ");
  await conn.sendMessage(chatId, { react: { text: '🔍', key: msg.key } });

  try {
    const search = await yts(query);
    const video = search.videos[0];

    if (!video) throw new Error('❌ No se encontró el video.');

    const { title, timestamp, url: videoUrl, author, image } = video;

    const download = await getDownloadUrl(videoUrl);
    if (!download || !download.url) throw new Error('❌ Falló la descarga del audio.');

    const caption = `🎧 *PLAY AUDIO*

🔖 *Título:* ${title}
🎤 *Artista:* ${author?.name || 'Desconocido'}
⏱️ *Duración:* ${timestamp || 'N/A'}
🔗 *URL:* ${videoUrl}

👤 *Pedido por:* ${senderMention}
⏳ *Descargando audio...*
~ KilluaBot 🎶`;

    await conn.sendMessage(chatId, {
      image: { url: image },
      caption,
      mentions: [sender]
    }, { quoted: msg });

    await sendAudio(conn, chatId, download.url, msg, `${title}.mp3`);
    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('[.play ERROR]', e);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al procesar la canción*\n\n${e.message || e.toString()}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
  }
};

handler.command = ['play', 'musica', 'song'];
module.exports = handler;