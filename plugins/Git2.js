const fs = require('fs')
const path = require('path')

const handler = async (msg, { conn, args, isOwner }) => {
  const chatId = msg.chat

  if (!isOwner) return conn.sendMessage(chatId, { text: '❌ Solo el OWNER puede usar este comando.' }, { quoted: msg })
  if (!args[0]) return conn.sendMessage(chatId, { text: '✍️ Uso: .git2 nombre_del_plugin (sin .js)' }, { quoted: msg })

  // Limpia argumento para evitar rutas inseguras
  let inputPath = args.join(' ').trim()
  inputPath = inputPath.replace(/(\.\.(\/|\\))/g, '') // evita subir carpetas fuera de plugins

  // Construye ruta absoluta dentro de /plugins
  const filePath = path.join(__dirname, 'plugins', inputPath + '.js')

  // Verifica que el archivo esté dentro de /plugins
  if (!filePath.startsWith(path.join(__dirname, 'plugins'))) {
    return conn.sendMessage(chatId, { text: '❌ Ruta inválida o fuera de la carpeta plugins.' }, { quoted: msg })
  }

  if (!fs.existsSync(filePath)) {
    return conn.sendMessage(chatId, { text: `❌ No se encontró el archivo: plugins/${inputPath}.js` }, { quoted: msg })
  }

  try {
    const code = fs.readFileSync(filePath, 'utf-8')

    // Limitar tamaño para no saturar WhatsApp
    if (code.length > 4000) {
      return conn.sendMessage(chatId, { text: '⚠️ Archivo muy grande para enviar completo.' }, { quoted: msg })
    }

    await conn.sendMessage(chatId, {
      text: `📂 Código del plugin: plugins/${inputPath}.js\n\n\`\`\`js\n${code}\n\`\`\`\n✅ Fin del archivo.`,
    }, { quoted: msg })

  } catch (e) {
    conn.sendMessage(chatId, { text: `❌ Error al leer archivo:\n${e.message}` }, { quoted: msg })
  }
}

handler.command = ['git2']
handler.owner = true

module.exports = handler