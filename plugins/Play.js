const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

// Agrega tu clave si usas lolhuman
const LOLHUMAN_KEY = 'Tu_API_Key_Aquí';

function isUserBlocked(userId) {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch {
    return false;
  }
}

async function getDownloadUrl(videoUrl) {
  const apis = [
    {
      name: 'vreden',
      url: `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`,
      extract: res => res?.data?.result?.download?.url && res?.data?.result?.download?.status
        ? {
            url: res.data.result.download.url.trim(),
            title: res.data.result.metadata.title
          } : null
    },
    {
      name: 'bx',
      url: `https://bx-hunter.herokuapp.com/api/yta?url=${encodeURIComponent(videoUrl)}`,
      extract: res => res?.data?.dl_link
        ? {
            url: res.data.dl_link,
            title: res.data.title
          } : null
    },
    {
      name: 'lolhuman',
      url: `https://api.lolhuman.xyz/api/ytaudio?apikey=${LOLHUMAN_KEY}&url=${encodeURIComponent(videoUrl)}`,
      extract: res => res?.data?.link
        ? {
            url: res.data.link,
            title: res.data.title
          } : null
    }
  ];

  for (const api of apis) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(api.url, { timeout: TIMEOUT_MS });
        const downloadData = api.extract(response);
        if (downloadData) return downloadData;
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

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (isUserBlocked(senderNum)) {
    return conn.sendMessage(chatId, {
      text: "🚫 Lo siento, estás en la lista de usuarios bloqueados."
    }, { quoted: msg });
  }

  if (!args || !args.join(" ").trim()) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ .play Anuel perfecto
╰─⬣
> © ⍴᥆ᥕᥱrᥱძ ᑲᥡ һᥒ ᥴһ᥆ᥣі𝗍᥆`,
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
│  🔗 *URL:* ${videoUrl}
╰─⬣

*[🛠️] 𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗇𝖽𝗈 𝖺𝗎𝖽𝗂𝗈 𝖾𝗌𝗉𝖾𝗋𝖾...*

> ® ⍴᥆ᥕᥱrᥱძ ᑲᥡ 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍⚡`;

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
      text: `➤ \`UPS, ERROR\` ❌

𝖯𝗋𝗎𝖾𝖻𝖾 𝗎𝗌𝖺𝗋 *.𝗌𝗉𝗈𝗍𝗂𝖿𝗒* *.𝗋𝗈𝗅𝗂𝗍𝖺* 𝗈 *.𝗉𝗅𝖺𝗒𝗒*
".𝗋𝖾𝗉𝗈𝗋𝗍𝖾 𝗇𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 .play"
> 𝖤𝗅 𝖾𝗊𝗎𝗂𝗉𝗈 𝗅𝗈 𝗋𝖾𝗏𝗂𝗌𝖺𝗋𝖺 𝗍𝖺𝗇 𝗉𝗋𝗈𝗇𝗍𝗈. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;