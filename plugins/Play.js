const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

const countryCodes = {
  '+54': { country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  '+591': { country: 'Bolivia', timeZone: 'America/La_Paz' },
  '+56': { country: 'Chile', timeZone: 'America/Santiago' },
  '+57': { country: 'Colombia', timeZone: 'America/Bogota' },
  '+506': { country: 'Costa Rica', timeZone: 'America/Costa_Rica' },
  '+53': { country: 'Cuba', timeZone: 'America/Havana' },
  '+593': { country: 'Ecuador', timeZone: 'America/Guayaquil' },
  '+503': { country: 'El Salvador', timeZone: 'America/El_Salvador' },
  '+34': { country: 'España', timeZone: 'Europe/Madrid' },
  '+502': { country: 'Guatemala', timeZone: 'America/Guatemala' },
  '+504': { country: 'Honduras', timeZone: 'America/Tegucigalpa' },
  '+52': { country: 'México', timeZone: 'America/Mexico_City' },
  '+505': { country: 'Nicaragua', timeZone: 'America/Managua' },
  '+507': { country: 'Panamá', timeZone: 'America/Panama' },
  '+595': { country: 'Paraguay', timeZone: 'America/Asuncion' },
  '+51': { country: 'Perú', timeZone: 'America/Lima' },
  '+1': { country: 'Puerto Rico', timeZone: 'America/Puerto_Rico' },
  '+1-809': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+1-829': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+1-849': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+598': { country: 'Uruguay', timeZone: 'America/Montevideo' },
  '+58': { country: 'Venezuela', timeZone: 'America/Caracas' }
};

function getGreeting(hour) {
  return hour < 12 ? 'Buenos días 🌅' : hour < 18 ? 'Buenas tardes 🌄' : 'Buenas noches 🌃';
}

function getUserGreeting(userNumber, limaTime) {
  const phoneCode = userNumber.startsWith('+') ? userNumber.split('@')[0].split('-')[0] : null;
  const countryInfo = phoneCode ? countryCodes[phoneCode] : null;

  if (countryInfo) {
    try {
      const localTime = new Date(limaTime.toLocaleString('en-US', { timeZone: countryInfo.timeZone }));
      const localHour = localTime.getHours();
      return `${getGreeting(localHour)} @${userNumber}, (${countryInfo.country})`;
    } catch {
      return `${getGreeting(limaTime.getHours())} @${userNumber}, (${countryInfo.country})`;
    }
  }
  return `${getGreeting(limaTime.getHours())} @${userNumber}`;
}

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
  let thumbnailBuffer = null;
  try {
    const response = await axios.get('https://files.catbox.moe/ltq7ph.jpg', { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch {}

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
              previewType: 'PHOTO',
              thumbnail: thumbnailBuffer || null,
              mediaType: 1,
              renderLargerThumbnail: false,
              showAdAttribution: true,
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
    let thumbnailBuffer = null;
    try {
      const response = await axios.get('https://files.catbox.moe/ltq7ph.jpg', { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data, 'binary');
    } catch {}

    return conn.sendMessage(chatId, {
      text: "Uso: .play <nombre de la canción>\n> Ejemplo: .play Mi Vida Eres Tu",
      contextInfo: {
        externalAdReply: {
          title: 'Barboza Music',
          previewType: 'PHOTO',
          thumbnail: thumbnailBuffer || null,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true,
          sourceUrl: 'Ella Nunca Te Quizo'
        }
      }
    }, { quoted: msg });
  }

  const text = args.join(" ");
  const limaTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const userNumber = "+" + senderNum;
  const greeting = getUserGreeting(userNumber, limaTime);

  const searchMsg = await conn.sendMessage(chatId, {
    text: `${greeting},\nEstoy buscando la música solicitada...`
  }, { quoted: msg });

  await conn.sendMessage(chatId, { react: { text: '📀', key: searchMsg.key } }, { quoted: msg });

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
      text: description,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Barboza Music',
          previewType: 'PHOTO',
          thumbnail: thumbnailBuffer || null,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        }
      }
    }, { quoted: msg });

    const downloadData = await getDownloadUrl(videoUrl);
    if (!downloadData || !downloadData.url) {
      await conn.sendMessage(chatId, { react: { text: '🔴', key: searchMsg.key } }, { quoted: msg });
      throw new Error('No se pudo descargar la música desde ninguna API.');
    }

    await conn.sendMessage(chatId, { react: { text: '🟢', key: searchMsg.key } }, { quoted: msg });
    const success = await sendAudioNormal(conn, chatId, downloadData.url, downloadData.title || title, msg);
    if (!success) throw new Error('No se pudo enviar el audio.');

  } catch (error) {
    await conn.sendMessage(chatId, { react: { text: '🔴', key: searchMsg.key } }, { quoted: msg });
    return conn.sendMessage(chatId, {
      text: `🚨 *Error:* ${error.message || 'Error desconocido'}`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;