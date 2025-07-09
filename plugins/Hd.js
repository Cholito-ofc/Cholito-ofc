const fetch = require('node-fetch');
const FormData = require('form-data');

const handler = async (msg, { conn, command, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const quoted = msg.quoted || msg;

  // Buscar mimetype correctamente
  const mime = quoted.message?.imageMessage?.mimetype ||
               quoted.mimetype ||
               quoted.msg?.mimetype ||
               '';

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(chatId, {
      react: { text: '❗', key: msg.key }
    });
    await conn.sendMessage(chatId, {
      text: `📸 *Responde a una imagen JPG o PNG* con:\n*${usedPrefix + command}*`
    }, { quoted: msg });
    return;
  }

  try {
    await conn.sendMessage(chatId, {
      react: { text: '⏳', key: msg.key }
    });

    const media = await quoted.download();
    const ext = mime.split('/')[1];
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

    if (!json?.result_url || !json.result_url.startsWith('http')) {
      throw new Error('No se pudo obtener la imagen mejorada desde Pixelcut.');
    }

    const resultBuffer = await (await fetch(json.result_url)).buffer();

    await conn.sendMessage(chatId, {
      image: resultBuffer,
      caption: `
✨ *Imagen mejorada*

🔍 Resolución x2  
📈 Nitidez mejorada  
🧰 Ideal para imágenes borrosas
      `.trim()
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    await conn.sendMessage(chatId, {
      react: { text: '❌', key: msg.key }
    });
    await conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error:*\n${err.message || err}`
    }, { quoted: msg });
  }
};

handler.command = ['hd'];
module.exports = handler;