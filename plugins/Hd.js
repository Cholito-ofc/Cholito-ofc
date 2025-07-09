// ⛩️ 𝐊𝐢𝐥𝐥𝐮𝐚 - 𝐁𝐎𝐓 ⛩️
// ✨ Mejora de Imagen (HD) by DevBrayan X OVERLORD

import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    return m.reply(`*⚠️ 𝐈𝐍𝐃𝐈𝐂𝐀𝐂𝐈𝐎𝐍:*\n\nResponde o envía una imagen con el comando:\n\n*${usedPrefix + command}*\n\n📸 Solo se admiten formatos *JPG* o *PNG*.`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } })

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filename = `killua_hd_${Date.now()}.${ext}`

    const form = new FormData()
    form.append('image', media, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'es'
    }

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    const json = await res.json()

    if (!json?.result_url || !json.result_url.startsWith('http')) {
      throw new Error('No se pudo procesar la imagen.')
    }

    const resultBuffer = await (await fetch(json.result_url)).buffer()

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `
🌟 *¡IMAGEN MEJORADA!*

✅ Tu imagen ha sido escalada al *doble de resolución*.
🖼️ Ideal para mejorar nitidez y detalles de imágenes borrosas.

🔧 *Consejo:* Usa este comando en fotos con baja calidad para resultados más nítidos.

🔗 *API:* Pixelcut Upscale
`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ *Error al mejorar la imagen:*\n\n${err.message || err}`)
  }
}

handler.help = ['hd']
handler.tags = ['herramientas', 'imagen']
handler.command = /^hd$/i

export default handler