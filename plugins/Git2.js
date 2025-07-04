const fs = require('fs')
const path = require('path')

// Agrega aquí tus números OWNER en formato internacional sin +
const owners = [
  '50489513153', // Tu número real
  '50489115621'  // Otro owner si quieres
]

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid || ''
  const senderNum = sender.replace(/[^0-9]/g, '')
  const isBotMessage = sender.startsWith('lid_')

  // ✅ Verificación Owner o Bot
  if (!owners.includes(senderNum) && !isBotMessage) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo los OWNER autorizados pueden usar este comando.'
    }, { quoted: msg })
  }

  // ✅ Validación de nombre de plugin
  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Uso correcto:\n.git2 nombre_del_plugin\nEjemplo: .git2 play'
    }, { quoted: msg })
  }

  // ✅ Seguridad: limpiar y generar ruta del plugin
  let pluginName = args.join(' ').trim()
  pluginName = pluginName.replace(/[^a-zA-Z0-9/_-]/g, '') // solo nombre válido
  const filePath = path.join(__dirname, pluginName + '.js')

  if (!filePath.startsWith(__dirname)) {
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

    if (code.length > 4000) {
      return conn.sendMessage(chatId, {
        text: '⚠️ El archivo es muy largo para mostrarlo completo en un solo mensaje.'
      }, { quoted: msg })
    }

    return conn.sendMessage(chatId, {
      text: `📂 *Código de: plugins/${pluginName}.js*\n\n\`\`\`js\n${code}\n\`\`\`\n✅ Fin del archivo.`,
    }, { quoted: msg })

  } catch (e) {
    return conn.sendMessage(chatId, {
      text: `❌ Error al leer el plugin:\n${e.message}`
    }, { quoted: msg })
  }
}

handler.command = ['git2']
module.exports = handler