const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

function isUserBlocked(userId) {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch {
    return false;
  }
}

async function getDownloadUrl(videoUrl) {
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
}

async function sendAudioNormal(conn, chatId, audioUrl, videoTitle, quotedMsg) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chatId,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          contextInfo: {
            externalAdReply: {
              title: videoTitle,
              body: 'Barboza Music',
              previewType: 'NONE',
              mediaType: 1,
              renderLargerThumbnail: false,
              showAdAttribution: false,
            }
          }
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

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  if (isUserBlocked(senderNum)) {
    return conn.sendMessage(chatId, {
      text: "🚫 Lo siento, estás en la lista de usuarios bloqueados."
    }, { quoted: msg });
  }

  if (!args || !args.length) {
    return conn.sendMessage(chatId, {
      text: "Uso: .play <nombre de la canción>\n> Ejemplo: .play Mi Vida Eres Tu"
    }, { quoted: msg });
  }

  const text = args.join(" ");

  try {
    const searchResults = await yts(text.trim());
    if (!searchResults?.videos?.length) throw new Error('No se encontraron resultados en YouTube.');

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, views, ago, url: videoUrl } = videoInfo;

    let thumbnailBuffer = null;
    try {
      const response = await axios.get(videoInfo.image, { responseType: 'arraybuffer' });
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
      image: thumbnailBuffer,
      caption: description
    }, { quoted: msg });

    const downloadData = await getDownloadUrl(videoUrl);
    if (!downloadData || !downloadData.url) {
      throw new Error('No se pudo descargar la música desde ninguna API.');
    }

    await sendAudioNormal(conn, chatId, downloadData.url, downloadData.title || title, msg);

  } catch (error) {
    return conn.sendMessage(chatId, {
      text: `🚨 *Error:* ${error.message || 'Error desconocido'}`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;