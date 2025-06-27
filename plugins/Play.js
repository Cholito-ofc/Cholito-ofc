const yts = require('yt-search');
const axios = require('axios');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

async function getDownloadUrl(videoUrl) {
  const apis = [
    { url: `https://api.vreden.my.id/api/ytmp3?url=`, type: 'vreden' },
    { url: `https://api.anhdev.eu.org/api/ytmp3?url=`, type: 'anh' },
    { url: `https://bx-team-api.up.railway.app/api/download/youtube-mp3?url=`, type: 'bx' }
  ];

  for (const api of apis) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await axios.get(`${api.url}${encodeURIComponent(videoUrl)}`, { timeout: TIMEOUT_MS });
        if (api.type === 'vreden' && res.data?.result?.download?.url) {
          return { url: res.data.result.download.url, title: res.data.result.metadata.title };
        }
        if (api.type === 'anh' && res.data?.result?.url) {
          return { url: res.data.result.url, title: res.data.result.title };
        }
        if (api.type === 'bx' && res.data?.data?.url) {
          return { url: res.data.data.url, title: res.data.data.title };
        }
      } catch {
        if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      }
    }
  }

  return null;
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(" ").trim();

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (!text) {
    return conn.sendMessage(chatId, {
      text: `🔊 *Uso correcto del comando:*\n\n*${global.prefix}play* Anuel - Ella quiere beber`
    }, { quoted: msg });
  }

  try {
    const results = await yts(text);
    const video = results.videos[0];
    if (!video) throw '❌ No se encontraron resultados.';

    const { title, timestamp, url: videoUrl, image: thumbnail, views, ago, author } = video;

    // Caption tipo tabla visual (como Pikachu)
    const caption = `╭───⬣「 *KilluaBot Descargas 🎧* 」
│ 🎶 *Título:* ${title}
│ 🕒 *Duración:* ${timestamp}
│ 👁️ *Vistas:* ${views.toLocaleString()}
│ 📺 *Canal:* ${author.name}
│ 📆 *Publicado:* ${ago}
╰────────────⬣`;

    // Enviar miniatura como tarjeta estilo vista de enlace (sin que se pueda abrir)
    await conn.sendMessage(chatId, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: "🎧 KilluaBot Audio",
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: msg });

    // Descargar audio
    const result = await getDownloadUrl(videoUrl);
    if (!result?.url) throw '❌ No se pudo descargar el audio.';

    // Enviar audio
    await conn.sendMessage(chatId, {
      audio: { url: result.url },
      mimetype: 'audio/mpeg'
    }, { quoted: msg });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error al procesar el video.*\n\nUsa *.play1* o *.play2* si este falla.`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;