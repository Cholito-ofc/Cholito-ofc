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

async function sendAudioNormal(conn, chatId, audioUrl, quotedMsg) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chatId,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg'
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

  // Reacción inicial al comando
  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  // Verifica si el usuario está bloqueado
  if (isUserBlocked(senderNum)) {
    return conn.sendMessage(chatId, {
      text: "🚫 Lo siento, estás en la lista de usuarios bloqueados."
    }, { quoted: msg });
  }

  // Si no escribe nombre de canción
  if (!args || !args.length) {
  let imageBuffer = null;
  try {
    const response = await axios.get("https://files.catbox.moe/ltq7ph.jpg", { responseType: "arraybuffer" });
    imageBuffer = Buffer.from(response.data);
  } catch {
    // Si falla, no pasa nada, simplemente se mostrará solo el texto
  }

  return conn.sendMessage(chatId, {
    ...(imageBuffer
      ? {
          image: imageBuffer,
          caption: `*Uso del comando .play*\n\nEjemplo:\n.play Despacito\n\nEnvía música desde YouTube en formato MP3.`
        }
      : {
          text: `🎵 *Uso del comando .play*\n\nEjemplo:\n.play Despacito\n\nEnvía música desde YouTube en formato MP3.`
        }),
  }, { quoted: msg });
}

  const query = args.join(" ").trim();

  try {
    const searchResults = await yts(query);
    if (!searchResults?.videos?.length) throw new Error('No se encontraron resultados.');

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, views, ago, url: videoUrl, image: thumbnail } = videoInfo;

    let imageBuffer = null;
    try {
      const response = await axios.get(thumbnail, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data, 'binary');
    } catch {}

    const caption = `╭─⬣「 *𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖬𝗎́𝗌𝗂𝖼* 」⬣
│  🎵 *Título:* ${title}
│  ⏱ *Duración:* ${duration || 'Desconocida'}
│  👁 *Vistas:* ${views.toLocaleString()}
│  📅 *Publicado:* ${ago || 'Desconocido'}
│  🔗 *URL:* ${videoUrl}
╰─⬣

*[🛠️] 𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗇𝖽𝗈 𝖺𝗎𝖽𝗂𝗈 𝖾𝗌𝗉𝖾𝗋𝖾...*

> ® ⍴᥆ᥕᥱrᥱძ ᑲᥡ kіᥣᥣᥙᥲᑲ᥆𝗍⚡`;

    await conn.sendMessage(chatId, {
      image: imageBuffer,
      caption: caption
    }, { quoted: msg });

    const downloadData = await getDownloadUrl(videoUrl);
    if (!downloadData || !downloadData.url) {
      throw new Error('No se pudo descargar la música.');
    }

    await sendAudioNormal(conn, chatId, downloadData.url, msg);

  } catch (error) {
    return conn.sendMessage(chatId, {
      text: `🚨 *Error:* ${error.message || 'Error desconocido'}`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;