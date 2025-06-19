const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const texto = args.join(" ").trim();

  if (!texto) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el nombre de la canción o artista que deseas buscar.*\n\nEjemplo: .play Shakira - Waka Waka",
    }, { quoted: msg });
  }

  try {
    const search = await yts(texto);
    const video = search.videos[0];
    if (!video) return conn.sendMessage(chatId, { text: "No se encontró ningún resultado." }, { quoted: msg });

    const info = await ytdl.getInfo(video.url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    // Ruta temporal para guardar el audio
    const tempFilePath = path.join(__dirname, '../tmp', `${video.videoId}.mp3`);
    const writeStream = fs.createWriteStream(tempFilePath);

    ytdl(video.url, { filter: 'audioonly' })
      .pipe(writeStream)
      .on('finish', async () => {
        await conn.sendMessage(chatId, {
          audio: { url: tempFilePath },
          mimetype: 'audio/mp4',
          fileName: `${video.title}.mp3`,
          ptt: false
        }, { quoted: msg });
        fs.unlinkSync(tempFilePath);
      })
      .on('error', (err) => {
        conn.sendMessage(chatId, { text: "Ocurrió un error al descargar la canción." }, { quoted: msg });
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      });

    await conn.sendMessage(chatId, {
      text: `🎵 *${video.title}*\n🕒 *${video.timestamp}*\n🔗 ${video.url}\n\n_Descargando audio..._`
    }, { quoted: msg });

  } catch (e) {
    await conn.sendMessage(chatId, { text: "Hubo un error al buscar o descargar la música." }, { quoted: msg });
  }
};

handler.command = ["playy"];
handler.tags = ["music", "audio"];
handler.help = ["play <nombre de la canción o artista>"];
module.exports = handler;