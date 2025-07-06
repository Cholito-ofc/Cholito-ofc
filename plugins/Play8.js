const fetch = require('node-fetch');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  // Definir el contacto personalizado
  const fkontak = {
    key: {
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "kirito-bot"
    },
    message: {
      contactMessage: {
        displayName: "MediaHub-Bot",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:MediaHub;Bot;;;\nFN:MediaHub Oficial\nORG:Mediahub Team;\nTEL;waid=${msg.sender.split('@')[0]}:${msg.sender.split('@')[0]}\nEMAIL;type=INTERNET:soporte@mediahub.net\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  // Reaccionar al comando
  await conn.sendMessage(chatId, { react: { text: '🎵', key: msg.key } });

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
        `╭─⬣「 *KilluaBot* 」⬣\n` +
        `│ ≡◦ 🎧 *Uso correcto del comando:*\n` +
        `│ ≡◦ .play8 Anuel perfecto\n` +
        `╰─⬣\n> © ⍴᥆ᥕᥱrᥱძ ᑲᥡ һᥒ ᥴһ᥆ᥣі𝗍᥆`
    }, { quoted: fkontak });
  }

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result?.downloadUrl) {
      return conn.sendMessage(chatId, {
        text:
          `╭─⬣「 *Barboza AI* 」⬣\n` +
          `│ ≡◦ ❌ *No se encontró resultado para:* ${text}\n` +
          `╰─⬣`
      }, { quoted: fkontak });
    }

    const { title, artist, duration, cover } = json.result.metadata;
    const audio = json.result.downloadUrl;

    // Enviar imagen con detalles
    await conn.sendMessage(chatId, {
      image: { url: cover },
      caption:
        `╭─⬣「 *KILLUA-BOT SPOTIFY* 」⬣\n` +
        `│ ≡◦ 🎵 *Título:* ${title}\n` +
        `│ ≡◦ 👤 *Artista:* ${artist}\n` +
        `│ ≡◦ ⏱️ *Duración:* ${duration}\n` +
        `╰─⬣`
    }, { quoted: fkontak });

    // Enviar el archivo de audio
    await conn.sendMessage(chatId, {
      audio: { url: audio },
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${title}.mp3`
    }, { quoted: fkontak });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(chatId, {
      text:
        `╭─⬣「 *KilluaBot* 」⬣\n` +
        `│ ≡◦ ⚠️ *Error al procesar la solicitud.*\n` +
        `│ ≡◦ Intenta nuevamente más tarde.\n` +
        `╰─⬣`
    }, { quoted: fkontak });
  }
};

handler.command = ["play8"];
handler.tags = ["descargas"];
handler.help = ["play8 <nombre de canción>"];
module.exports = handler;