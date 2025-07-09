const fetch = require('node-fetch');
const FormData = require('form-data');

const handler = async (msg, { conn, command, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const quoted = msg.quoted;

  if (!quoted) {
    await conn.sendMessage(chatId, { text: `❗ Por favor responde a una imagen con:\n*${usedPrefix + command}*` }, { quoted: msg });
    return;
  }

  // Tratar de obtener el mimetype en todas las formas posibles
  const mime =
    (quoted.msg && quoted.msg.mimetype) ||
    (quoted.message && quoted.message.imageMessage && quoted.message.imageMessage.mimetype) ||
    (quoted.mimetype) ||
    '';

  if (!mime || !mime.startsWith('image/')) {
    await conn.sendMessage(chatId, { text: `❗ Responde a una imagen JPG o PNG con:\n*${usedPrefix + command}*` }, { quoted: msg });
    return;
  }

  try {
    await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

    // Descargar imagen usando downloadM (compatible con Baileys)
    const media = await conn.downloadM(quoted);

    const ext = mime.split('/')[1] || 'jpg';
    const filename = `mejorada_${Date.now()}.${ext}`;

    const form = new FormData();
    form.append('image', media, { filename, contentType: mime });
    form.append('scale', '2');

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'es'
    };

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    });

    const json = await res.json();

    if (!json?.result_url || !json.result_url.startsWith('http')) throw new Error('No se pudo obtener la imagen mejorada');

    const resultBuffer = await (await fetch(json.result_url)).buffer();

    await conn.sendMessage(chatId, {
      image: resultBuffer,
      caption: `
✨ Imagen mejorada (x2 resolución)
🔍 Más nitidez y detalles
🧰 Para imágenes borrosas o pixeladas
      `.trim()
    }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (error) {
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    await conn.sendMessage(chatId, { text: `❌ Error al mejorar imagen:\n${error.message || error}` }, { quoted: msg });
  }
};

handler.command = ['hd'];
module.exports = handler;