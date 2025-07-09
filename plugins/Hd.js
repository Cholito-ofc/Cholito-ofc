const fetch = require('node-fetch');
const FormData = require('form-data');

const handler = async (msg, { conn, command, usedPrefix }) => {
  const chatId = msg.key.remoteJid;

  // 1. Verificar que el mensaje sea respuesta (quoted)
  if (!msg.quoted) {
    await conn.sendMessage(chatId, {
      text: `❗ Por favor responde a una imagen con el comando:\n*${usedPrefix + command}*`
    }, { quoted: msg });
    return;
  }

  const quoted = msg.quoted;

  // 2. Obtener tipo de mensaje citado
  const messageType = Object.keys(quoted.message || {})[0];

  // 3. Validar que sea imagen (imageMessage)
  if (messageType !== 'imageMessage') {
    await conn.sendMessage(chatId, {
      text: `❗ El mensaje citado no es una imagen. Responde a una imagen JPG o PNG con:\n*${usedPrefix + command}*`
    }, { quoted: msg });
    return;
  }

  // 4. Obtener mimetype
  const mime = quoted.message.imageMessage.mimetype || '';

  // 5. Validar mimetype JPG o PNG
  if (!/^image\/(jpe?g|png)$/i.test(mime)) {
    await conn.sendMessage(chatId, {
      text: `❗ Solo imágenes JPG o PNG son soportadas.`
    }, { quoted: msg });
    return;
  }

  try {
    await conn.sendMessage(chatId, { react: { text: '⏳', key: msg.key } });

    // 6. Descargar la imagen
    const media = await conn.downloadM(quoted);

    // 7. Preparar archivo
    const ext = mime.split('/')[1];
    const filename = `mejorada_${Date.now()}.${ext}`;

    // 8. Formulario para API
    const form = new FormData();
    form.append('image', media, { filename, contentType: mime });
    form.append('scale', '2');

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'es'
    };

    // 9. Petición a la API de mejora
    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    });

    const json = await res.json();

    if (!json?.result_url || !json.result_url.startsWith('http')) {
      throw new Error('No se pudo obtener la imagen mejorada desde Pixelcut.');
    }

    // 10. Descargar imagen mejorada
    const resultBuffer = await (await fetch(json.result_url)).buffer();

    // 11. Enviar imagen mejorada
    await conn.sendMessage(chatId, {
      image: resultBuffer,
      caption: `
✨ Imagen mejorada con éxito
🔍 Resolución duplicada
📈 Nitidez y detalles mejorados
      `.trim()
    }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (error) {
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    await conn.sendMessage(chatId, {
      text: `❌ Error al mejorar la imagen:\n${error.message || error}`
    }, { quoted: msg });
  }
};

handler.command = ['hd'];
module.exports = handler;