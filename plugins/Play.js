const yts = require('yt-search');
const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

const getDownloadUrl = async (videoUrl) => {
  const apis = [{ url: 'https://api.vreden.my.id/api/ytmp3?url=', type: 'vreden' }];
  for (const api of apis) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(`${api.url}${encodeURIComponent(videoUrl)}`, { timeout: TIMEOUT_MS });
        if (
          response.data?.status === 200 &&
          response.data?.result?.download?.url &&
          response.data?.result?.download?.status === true
        ) {
          return {
            url: response.data.result.download.url.trim(),
            title: response.data.result.metadata.title
          };
        }
      } catch {
        if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      }
    }
  }
  return null;
};

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const chatId = msg.key.remoteJid;

  // Reacción al usar el comando
  await conn.sendMessage(chatId, { react: { text: '🎵', key: msg.key } });

  const text = args.join(' ').trim();
  if (!text) {
    return conn.sendMessage(chatId, {
      text: `Uso: ${usedPrefix + command} <nombre de la canción>\nEjemplo: ${usedPrefix + command} Mi Vida Eres Tú`
    }, { quoted: msg });
  }

  // Buscar video en YouTube
  let searchResults;
  try {
    searchResults = await yts(text);
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Hubo un error buscando en YouTube.' }, { quoted: msg });
  }
  if (!searchResults?.videos?.length) {
    return conn.sendMessage(chatId, { text: '❌ No se encontraron resultados en YouTube.' }, { quoted: msg });
  }

  const videoInfo = searchResults.videos[0];
  const { title, timestamp: duration, views, ago, url: videoUrl, image } = videoInfo;

  // Descargar la portada grande y enviarla como imagen normal
  let thumbnailBuffer = null;
  try {
    const response = await axios.get(image, { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch {}

  const description = `╭─⬣「 *Barboza-Ai* 」⬣
│  ≡◦ 🎵 Título ∙ ${title}
│  ≡◦ ⏱ Duración ∙ ${duration || 'Desconocida'}
│  ≡◦ 👀 Vistas ∙ ${views.toLocaleString()}
│  ≡◦ 📅 Publicado ∙ ${ago || 'Desconocido'}
│  ≡◦ 🔗 URL ∙ ${videoUrl}
╰─⬣
> © Powered By Barboza™`;

  await conn.sendMessage(chatId, {
    image: { buffer: thumbnailBuffer },
    caption: description
  }, { quoted: msg });

  // Descargar y enviar audio como archivo limpio
  const downloadData = await getDownloadUrl(videoUrl);
  if (!downloadData || !downloadData.url) {
    return conn.sendMessage(chatId, { text: '❌ No se pudo descargar la música desde ninguna API.' }, { quoted: msg });
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chatId,
        {
          audio: { url: downloadData.url },
          mimetype: 'audio/mpeg',
          fileName: `${downloadData.title || title}.mp3`,
          ptt: false
        },
        { quoted: msg }
      );
      break;
    } catch (e) {
      if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      else
        return conn.sendMessage(chatId, { text: '❌ No se pudo enviar el audio.' }, { quoted: msg });
    }
  }
};

handler.command = ['play'];
handler.help = ['play <texto>'];
handler.tags = ['descargas'];
module.exports = handler;