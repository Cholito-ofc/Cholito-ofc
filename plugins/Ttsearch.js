const axios = require("axios");

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`🎯 *Búsqueda de Videos TikTok*

📌 *Usa el comando así:*
.tiktoksearch <tema>

💡 *Ejemplo:*
.tiktoksearch humor negro

🔍 *KilluaBot buscará los mejores resultados para ti...*`,
    }, { quoted: msg });
  }

  try {
    const { data: response } = await axios.get(
      `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`
    );
    const results = response?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*",
      }, { quoted: msg });
    }

    results.sort(() => Math.random() - 0.5);
    const topResults = results.slice(0, 5);

    const mediaArray = await Promise.all(topResults.map(async (item, idx) => {
      const { nowm, title, author, duration, likes } = item;
      const caption =
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 🎥 𝗧𝗶𝘁𝘂𝗹𝗼: ${title || 'Desconocido'}
│ 👤 𝗔𝘂𝘁𝗼𝗿: ${author || 'Desconocido'}
│ ⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼𝗻: ${duration || 'Desconocida'}
│ ❤️ 𝗟𝗶𝗸𝗲𝘀: ${likes || 0}
╰─────────────╯

📥 𝖵𝗂́𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗇 𝖾́𝗑𝗂𝗍𝗈
> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*`;

      const videoBuffer = await conn.getFile(nowm); // o usa fetch si tu conn no tiene getFile
      return {
        type: 'videoMessage',
        video: videoBuffer.data,
        mimetype: 'video/mp4',
        caption: idx === 0 ? caption : undefined,
      };
    }));

    await conn.sendMessage(chatId, { type: 'media', media: mediaArray }, { quoted: msg });

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: `❌ *Error al buscar o enviar los videos:*
${err.message}`,
    }, { quoted: msg });
  }
};

handler.command = ["ttosearch", "tiktoks"];
handler.tags = ['buscador'];
handler.help = ['tiktoksearch <tema>'];
handler.register = true;

module.exports = handler;