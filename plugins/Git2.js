const fs = require('fs')
const path = require('path')

// Lista de owners válidos
const owners = ['50489513153', '50489115621']

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid || ''
  const senderNum = sender.replace(/[^0-9]/g, '')
  const isBotMessage = sender.startsWith('lid_')

  // Validar permisos
  if (!owners.includes(senderNum) && !isBotMessage) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo el OWNER puede usar este comando.'
    }, { quoted: msg })
  }

  // Validar argumento
  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes especificar el nombre de un comando.\nEjemplo: .gitcase rest'
    }, { quoted: msg })
  }

  const commandName = args[0].toLowerCase()
  const mainFilePath = path.join(__dirname, '..', 'main.js') // Ruta relativa al main.js

  if (!fs.existsSync(mainFilePath)) {
    return conn.sendMessage(chatId, {
      text: '❌ No se encontró el archivo *main.js*'
    }, { quoted: msg })
  }

  try {
    const content = fs.readFileSync(mainFilePath, 'utf-8')
    const regex = new RegExp(`case\\s+['"\`]${commandName}['"\`]\\s*:\\s*([\\s\\S]*?)\\bbreak;`)
    const match = content.match(regex)

    if (!match) {
      return conn.sendMessage(chatId, {
        text: `❌ No se encontró el comando *${commandName}* dentro de main.js`
      }, { quoted: msg })
    }

    const result = `📂 *Código del comando "${commandName}":*\n\n\`\`\`js\ncase '${commandName}': {\n${match[1].trim()}\n  break;\n}\n\`\`\``

    return conn.sendMessage(chatId, {
      text: result.length > 4000 ? '⚠️ El bloque es demasiado largo para mostrarlo completo.' : result
    }, { quoted: msg })

  } catch (e) {
    return conn.sendMessage(chatId, {
      text: `❌ Error al leer el archivo:\n${e.message}`
    }, { quoted: msg })
  }
}

handler.command = ['gitcase']
module.exports = handler