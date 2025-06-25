const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const apiKey = 'TU_API_KEY_AQUI'; // <-- Coloca tu API Key aquí

function isUserBlocked(userId) {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch {
    return false;
  }
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

    // 📥 Usar API de lolhuman
    const apiUrl = `https://api.lolhuman.xyz/api/ytmp3?apikey=${apiKey}&url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(apiUrl);
    const audioUrl = res.data.result.link;

    // 🎧 Enviar audio
    await conn.sendMessage(
      chatId,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        fileName: `${title}.mp3`,
        ptt: false
      },
      { quoted: msg }
    );

  } catch (error) {
    console.error(error);
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

𝖯𝗋𝗎𝖾𝖻𝖾 𝗎𝗌𝖺𝗋 *.𝗋𝗈𝗅𝗂𝗍𝖺* *.𝗉𝗅𝖺𝗒𝟣* 𝗈 *.𝗉𝗅𝖺𝗒2*
".𝗋𝖾𝗉𝗈𝗋𝗍𝖾 𝗇𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 .play"
> 𝖤𝗅 𝖾𝗊𝗎𝗂𝗉𝗈 𝗅𝗈 𝗋𝖾𝗏𝗂𝗌𝖺𝗋𝖺 𝗍𝖺𝗇 𝗉𝗋𝗈𝗇𝗍𝗈. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;