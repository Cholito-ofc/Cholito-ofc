const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const wait = (ms) => new Promise(res => setTimeout(res, ms));
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

function isUserBlocked(userId) {
  try {
    const blocked = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blocked.includes(userId);
  } catch {
    return false;
  }
}

async function getDownloadUrl(videoUrl) {
  const apis = [
    { url: `https://api.vreden.my.id/api/ytmp3?url=`, type: 'vreden' },
    { url: `https://api.anhdev.eu.org/api/ytmp3?url=`, type: 'anh' },
    { url: `https://api.lolhuman.xyz/api/ytaudio?apikey=TuAPIKEY&url=`, type: 'lolhuman' },
    { url: `https://bx-team-api.up.railway.app/api/download/youtube-mp3?url=`, type: 'bx' }
  ];

  for (const api of apis) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await axios.get(`${api.url}${encodeURIComponent(videoUrl)}`, { timeout: TIMEOUT_MS });

        switch (api.type) {
          case 'vreden':
            if (res.data?.status === 200 && res.data?.result?.download?.url) {
              return {
                url: res.data.result.download.url.trim(),
                title: res.data.result.metadata.title
              };
            }
            break;
          case 'anh':
            if (res.data?.status && res.data.result?.url) {
              return { url: res.data.result.url, title: res.data.result.title || 'Audio' };
            }
            break;
          case 'lolhuman':
            if (res.data?.status === 200 && res.data.result?.link) {
              return { url: res.data.result.link, title: res.data.result.title };
            }
            break;
          case 'bx':
            if (res.data?.success && res.data?.data?.url) {
              return { url: res.data.data.url, title: res.data.data.title };
            }
            break;
        }
      } catch {
        if (i < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
      }
    }
  }

  return null;
}

async function sendAudio(conn, chatId, audioUrl, quoted) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await conn.sendMessage(chatId, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted });
      return true;
    } catch {
      if (i < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
    }
  }
  return false;
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, '');

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (isUserBlocked(senderNum)) {
    return conn.sendMessage(chatId, {
      text: '🚫 Lo siento, estás en la lista de usuarios bloqueados.'
    }, { quoted: msg });
  }

  const text = args.join(' ').trim();
  if (!text) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ .play Anuel - Mejor que yo
╰─⬣`
    }, { quoted: msg });
  }

  try {
    const search = await yts(text);
    if (!search?.videos?.length) throw new Error('No se encontraron resultados');

    const video = search.videos[0];
    const { title, timestamp: duration, url: videoUrl, image: thumbnailUrl } = video;

    // ✅ Descargar miniatura como buffer
    let thumb = null;
    try {
      const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
      thumb = response.data;
    } catch {
      console.warn('⚠️ Error al descargar thumbnail');
    }

    // 🖼️ Enviar solo UNA vez la portada
    const adMessage = {
      text: `╭─⬣「 *KilluaBot Música* 」⬣
│ 🎵 *Título:* ${title}
│ ⏱ *Duración:* ${duration}
│ 🔗 *URL:* ${videoUrl}
╰─⬣\n\n*[🛠️] Descargando audio, espere...*`,
      contextInfo: {
        externalAdReply: {
          title,
          body: 'KilluaBot 🎶',
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: thumb,
          sourceUrl: videoUrl
        }
      }
    };

    await conn.sendMessage(chatId, adMessage, { quoted: msg });

    const download = await getDownloadUrl(videoUrl);
    if (!download?.url) throw new Error('No se pudo descargar la música');

    // 🔊 Enviar solo el audio, sin repetir miniaturas
    await sendAudio(conn, chatId, download.url, msg);

  } catch (err) {
    console.error('[ERROR .play]', err);
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

Prueba usar *.rolita*, *.play1* o *.play2*
".report no funciona .play" para que el equipo lo revise.`
    }, { quoted: msg });
  }
};

handler.command = ['play'];
module.exports = handler;