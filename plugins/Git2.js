const fs = require('fs')
const path = require('path')

const owners = [
  '50489513153',
  '50489115621',
]

function isOwner(num) {
  return global.owner.some(([number, , active]) => number === num && active)
}

// Función para dividir texto en partes <= 4000 caracteres
function splitText(text, maxLength = 4000) {
  const parts = []
  for (let i = 0; i < text.length; i += maxLength) {
    parts.push(text.slice(i, i + maxLength))
  }
  return parts
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid || ''
  const senderNum = sender.replace(/[^0-9]/g, '')
  const isBotMessage = sender.startsWith('lid_')

  if (!isOwner(senderNum) && !isBotMessage) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo los OWNER autorizados pueden usar este comando.'
    }, { quoted: msg })
  }

  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Uso correcto:\n.git2 nombre_del_plugin\nEjemplo: .git2 play'
    }, { quoted: msg })
  }

  let pluginName = args.join(' ').trim()
  pluginName = pluginName.replace(/[^a-zA-Z0-9/_-]/g, '')

  // Ajusta esta ruta según dónde tengas tu carpeta plugins
  const basePath = path.resolve(__dirname) // si este plugin está dentro de /plugins
  // Si está fuera, usar: const basePath = path.resolve(__dirname, 'plugins')

  const filePath = path.join(basePath, pluginName + '.js')

  if (!filePath.startsWith(basePath)) {
    return conn.sendMessage(chatId, {
      text: '❌ Ruta inválida. Solo se permite leer archivos dentro de /plugins.'
    }, { quoted: msg })
  }

  if (!fs.existsSync(filePath)) {
    return conn.sendMessage(chatId, {
      text: `❌ El plugin "${pluginName}" no existe en /plugins.`
    }, { quoted: msg })
  }

  try {
    const code = fs.readFileSync(filePath, 'utf-8')
    const parts = splitText(code, 4000)

    await conn.sendMessage(chatId, {
      text: `📂 *Código de: plugins/${pluginName}.js*`
    }, { quoted: msg })

    for (const part of parts) {
      await conn.sendMessage(chatId, {
        text: '```js\n' + part + '\n```'
      })
    }

    await conn.sendMessage(chatId, {
      text: '✅ Fin del archivo.'
    })

  } catch (e) {
    return conn.sendMessage(chatId, {
      text: `❌ Error al leer el plugin:\n${e.message}`
    }, { quoted: msg })
  }
}

handler.command = ['git2']
module.exports = handler