const fetch = require("node-fetch");
const yts = require("yt-search");
const axios = require("axios");

const formatAudio = ["mp3"];
const formatVideo = ["360", "480", "720", "1080"];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error("⚠️ Ese formato no es compatible.");
    }

    const response = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!response.data?.success) {
      throw new Error("⛔ No se pudo obtener los detalles del video.");
    }

    const { id, title, info } = response.data;
    const downloadUrl = await ddownr.cekProgress(id);
    return { id, title, image: info.image, downloadUrl };
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { "User-Agent": "Mozilla/5.0" }
    };

    while (true) {
      const res = await axios(config);
      if (res.data?.success && res.data.progress === 1000) {
        return res.data.download_url;
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
};

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  await conn.sendMessage(chatId, { react: { text: "⚡", key: msg.key } });

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "*🎵 Usa el comando así:* `.play Bohemian Rhapsody`",
      quoted: msg
    });
  }

  try {
    const search = await yts(text);
    if (!search.all.length) {
      return conn.sendMessage(chatId, {
        text: "❌ No se encontraron resultados.",
        quoted: msg
      });
    }

    const videoInfo = search.all[0];
    const { title, url, thumbnail, timestamp, views, ago, author } = videoInfo;

    const textPreview = `🎧 *${title}*
📺 ${author.name}
🕒 ${timestamp} | ${views.toLocaleString()} vistas
🔗 ${url}`;

    const thumbBuffer = await (await conn.getFile(thumbnail)).data;

    // Mostrar info estilo miniatura + mensaje de preview (NO imagen abierta)
    await conn.sendMessage(chatId, {
      text: textPreview,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: "🎧 Resultado de búsqueda - Pikachu Bot",
          thumbnail: thumbBuffer,
          sourceUrl: url,
          mediaUrl: url,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      },
      quoted: msg
    });

    if (["play", "yta", "ytmp3"].includes(command)) {
      const result = await ddownr.download(url, "mp3");

      await conn.sendMessage(chatId, {
        audio: { url: result.downloadUrl },
        fileName: `${title}.mp3`,
        mimetype: "audio/mpeg",
        quoted: msg,
        contextInfo: {
          externalAdReply: {
            title: "Pikachu-Bot",
            body: "🎧 Tu música está lista",
            thumbnail: thumbBuffer,
            mediaType: 1,
            showAdAttribution: true,
            sourceUrl: url
          }
        }
      });
    }

    if (["play2", "ytv", "ytmp4"].includes(command)) {
      const sources = [
        `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
        `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
        `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
        `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
      ];

      let found = false;

      for (const source of sources) {
        try {
          const res = await fetch(source);
          const json = await res.json();
          const downloadUrl = json?.data?.dl || json?.result?.download?.url || json?.downloads?.url || json?.data?.download?.url;

          if (downloadUrl) {
            found = true;

            await conn.sendMessage(chatId, {
              video: { url: downloadUrl },
              fileName: `${title}.mp4`,
              mimetype: "video/mp4",
              caption: "🎬 Tu video está listo.",
              quoted: msg,
              contextInfo: {
                externalAdReply: {
                  title: "Pikachu-Bot",
                  body: "🎥 Video descargado",
                  thumbnail: thumbBuffer,
                  mediaType: 1,
                  showAdAttribution: true,
                  sourceUrl: url
                }
              }
            });
            break;
          }
        } catch (e) {
          console.error(`❌ Error con ${source}:`, e.message);
        }
      }

      if (!found) {
        return conn.sendMessage(chatId, {
          text: "❌ No se pudo descargar el video.",
          quoted: msg
        });
      }
    }

  } catch (e) {
    console.error("⚠️ Error en el comando play:", e);
    conn.sendMessage(chatId, {
      text: `⚠️ Ocurrió un error: ${e.message}`,
      quoted: msg
    });
  }
};

handler.command = ["play", "play2", "yta", "ytv", "ytmp3", "ytmp4"];
handler.tags = ["downloader"];
handler.help = ["play <texto>", "play2 <texto>", "yta <texto>", "ytv <texto>"];
module.exports = handler;