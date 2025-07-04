const fs = require('fs')
const path = require('path')

// Lista de números owners permitidos
const owners = [
  '50489513153', // Owner 1
  '50489115621', // Owner 2
]

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid || ''
  const senderNum = sender.replace(/[^0-9]/g, '')
  const isBotMessage = sender.startsWith('lid_') // detecta si es el bot

  // Validación de acceso
  if (!owners.includes(senderNum) && !isBotMessage) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo los OWNER autorizados pueden usar este comando.'
    }, { quoted: msg })
  }

  // Verificar que haya argumento
  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '✍️ Uso correcto: .git2 nombre_del_plugin (sin .js)\nEjemplo: .git2 play'
    }, { quoted: msg })
  }

  // Ruta segura
  let inputPath = args.join(' ').trim()
  inputPath = inputPath.replace(/(\.\.(\/|\\))/g, '') // evita ../ inyecciones

  const basePath = path.join(__dirname, 'plugins')
  const filePath = path.join(basePath, inputPath + '.js')

  if (!filePath.startsWith(basePath)) {
    return conn.sendMessage(chatId, {
      text: '❌ Ruta inválida o fuera de la carpeta plugins.'
    }, { quoted: msg })
  }

  if (!fs.existsSync(filePath)) {
    return conn.sendMessage(chatId, {
      text: `❌ No se encontró el archivo: plugins/${inputPath}.js`
    }, { quoted: msg })
  }

  try {
    const code = fs.readFileSync(filePath, 'utf-8')

    if (code.length > 4000) {
      return conn.sendMessage(chatId, {
        text: '⚠️ Archivo muy grande para enviar completo.'
      }, { quoted: msg })
    }

    await conn.sendMessage(chatId, {
      text: `📂 Código del plugin: plugins/${inputPath}.js\n\n\`\`\`js\n${code}\n\`\`\`\n✅ Fin del archivo.`
    }, { quoted: msg })

  } catch (e) {
    conn.sendMessage(chatId, {
      text: `❌ Error al leer archivo:\n${e.message}`
    }, { quoted: msg })
  }
}

handler.command = ['git2']
module.exports = handler