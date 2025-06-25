const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

// Usa solo tu API key, no la URL
const apiKey = 'TU_API_KEY_AQUI'; // ← Reemplaza esto con tu API key real

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
> © ⍴᥆ᥕᥱrᥱძ ᑲᥡ һᥒ ᥴһ᥆ᥣі𝗍᥆`
    }, { quoted: msg });
  }

  const query = args.join(" ").trim();

  try {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) throw '❌ No se encontraron resultados.';

    const { title, timestamp: duration, url, thumbnail } = video;

    const caption = `╭─⬣「 *𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖬𝗎́𝗌𝗂𝖼* 」⬣
│  🎵 *Título:* ${title}
│  ⏱ *Duración:* ${duration || 'Desconocida'}
│  🔗 *URL:* ${url}
╰─⬣

*[🛠️] 𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗇𝖽𝗈 𝖺𝗎𝖽𝗂𝗈 𝖾𝗌𝗉𝖾𝗋𝖾...*

> ® ⍴᥆ᥕᥱrᥱძ ᑲᥡ 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍⚡`;

    await conn.sendMessage(chatId, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: msg });

    const apiUrl = `https://api.lolhuman.xyz/api/ytmp3?apikey=${apiKey}&url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const audioUrl = res.data.result.link;

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

Pruebe usar *.rolita* *.play1* o *.play2*
".reporte no funciona .play"
> El equipo lo revisará tan pronto. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;