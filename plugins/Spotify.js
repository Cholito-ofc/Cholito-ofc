const fetch = require('node-fetch');

const handler = async (msg, { conn, args, command, usedPrefix }) => {
  const text = args.join(" ");
  const emoji = '🎧';

  if (!text) {
    return conn.sendMessage(msg.chat, {
      text: `╭─⬣「 *KilluaBot Spotify* 」⬣
│ ≡◦ ${emoji} *Uso correcto:*
│ ≡◦ ${usedPrefix + command} <nombre de canción>
│ ≡◦ Ejemplo: *${usedPrefix + command} shakira - waka waka*
╰─⬣`,
    }, { quoted: msg });
  }

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result?.downloadUrl) {
      return conn.sendMessage(msg.chat, {
        text: `╭─⬣「 *KilluaBot Spotify* 」⬣
│ ≡◦ ❌ *No se encontró ningún resultado para:* ${text}
╰─⬣`,
      }, { quoted: msg });
    }

    const { title, artist, duration, cover, url } = json.result.metadata;
    const audio = json.result.downloadUrl;

    // Enviar portada con detalles
    await conn.sendMessage(msg.chat, {
      image: { url: cover },
      caption: `╭─⬣「 *MÚSICA ENCONTRADA* 」⬣
│ ≡◦ 🎵 *Título:* ${title}
│ ≡◦ 👤 *Artista:* ${artist}
│ ≡◦ ⏱️ *Duración:* ${duration}
│ ≡◦ 🌐 *Spotify:* ${url}
╰─⬣`,
    }, { quoted: msg });

    // Enviar audio
    await conn.sendMessage(msg.chat, {
      audio: { url: audio },
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${title}.mp3`
    }, { quoted: msg });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(msg.chat, {
      text: `╭─⬣「 *KilluaBot Spotify* 」⬣
│ ≡◦ ⚠️ *Error al procesar tu solicitud.*
│ ≡◦ Intenta nuevamente más tarde.
╰─⬣`,
    }, { quoted: msg });
  }
};

handler.help = ['rolita <nombre>'];
handler.tags = ['descargas'];
handler.command = /^spotify$/i;
handler.register = true;

module.exports = handler;