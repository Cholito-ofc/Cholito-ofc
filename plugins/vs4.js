let partidasVS4 = {}
let jugadoresGlobal = new Set()

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)
  const isFromMe = msg.key.fromMe

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg })
  }

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "❌ Solo *admins* o *el dueño del bot* pueden usar este comando." }, { quoted: msg })
  }

  const horaTexto = args[0]
  const modalidad = args.slice(1).join(' ') || 'CLK'
  if (!horaTexto) {
    return conn.sendMessage(chatId, { text: "✳️ Usa el comando así:\n*.4vs4 [hora] [modalidad]*\nEjemplo: *.4vs4 5:00pm vs sala normal*" }, { quoted: msg })
  }

  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/)
    let [h, m] = time.split(":").map(n => parseInt(n))
    if (modifier === 'pm' && h !== 12) h += 12
    if (modifier === 'am' && h === 12) h = 0
    return { h, m: m || 0 }
  }

  const to12Hour = (h, m) => {
    const suffix = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    return `${h}:${m.toString().padStart(2, '0')}${suffix}`
  }

  const base = to24Hour(horaTexto)

  const zonas = [
    { pais: "MÉXICO 🇲🇽", offset: 0 },
    { pais: "COLOMBIA 🇨🇴", offset: 1 }
  ]

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset
    let newM = base.m
    if (newH >= 24) newH -= 24
    let hora = to12Hour(newH, newM)
    let nombre = z.pais.replace(/🇲🇽|🇨🇴/g, '').trim()
    let bandera = z.pais.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)?.[0] || ''
    return `┊ • ${hora} ${nombre} ${bandera}`
  }).join("\n")

  const idPartida = new Date().getTime().toString()

  let plantilla = `
ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`${modalidad}\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
${horaMsg}
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
┊ 👑 ➤ 
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
┊ ⚜️ ➤ 
┊ ⚜️ ➤ 
╰─────────────╯

❤️ = Participar | 👍 = Suplente
`.trim()

  let tempMsg = await conn.sendMessage(chatId, { text: plantilla }, { quoted: msg })

  partidasVS4[tempMsg.key.id] = {
    chat: chatId,
    jugadores: [],
    suplentes: [],
    originalMsgKey: tempMsg.key,
    modalidad,
    horaMsg,
    idPartida
  }

  conn.ev.on('messages.upsert', async ({ messages }) => {
    let m = messages[0]
    if (!m?.message?.reactionMessage) return

    let reaction = m.message.reactionMessage
    let key = reaction.key
    let emoji = reaction.text
    let sender = m.key.participant || m.key.remoteJid

    let data = partidasVS4[key.id]
    if (!data) return

    const emojisParticipar = ['❤️', '❤', '♥', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥']
    const emojisSuplente = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']

    const esTitular = data.jugadores.includes(sender)
    const esSuplente = data.suplentes.includes(sender)

    if (emojisSuplente.includes(emoji)) {
      if (esTitular) {
        if (data.suplentes.length < 2) {
          data.jugadores = data.jugadores.filter(j => j !== sender)
          jugadoresGlobal.delete(sender)
          data.suplentes.push(sender)
        } else {
          return
        }
      } else if (!esSuplente) {
        if (data.suplentes.length < 2) {
          data.suplentes.push(sender)
        } else {
          return
        }
      } else {
        return
      }
    } else if (emojisParticipar.includes(emoji)) {
      if (esTitular) return
      if (esSuplente) {
        if (data.jugadores.length < 4) {
          data.suplentes = data.suplentes.filter(s => s !== sender)
          data.jugadores.push(sender)
          jugadoresGlobal.add(sender)
        } else {
          return
        }
      } else if (data.jugadores.length < 4) {
        data.jugadores.push(sender)
        jugadoresGlobal.add(sender)
      } else {
        return
      }
    } else {
      return
    }

    let jugadores = data.jugadores.map(u => `@${u.split('@')[0]}`)
    let suplentes = data.suplentes.map(u => `@${u.split('@')[0]}`)

    let plantilla = `
ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`${data.modalidad}\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
${data.horaMsg}
┊
┊ » \`𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔\`
┊ 👑 ➤ ${jugadores[0] || ''}
┊ ⚜️ ➤ ${jugadores[1] || ''}
┊ ⚜️ ➤ ${jugadores[2] || ''}
┊ ⚜️ ➤ ${jugadores[3] || ''}
┊
┊ » \`𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘:\`
┊ ⚜️ ➤ ${suplentes[0] || ''}
┊ ⚜️ ➤ ${suplentes[1] || ''}
╰─────────────╯

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos
`.trim()

    await conn.sendMessage(data.chat, { delete: data.originalMsgKey })
    let newMsg = await conn.sendMessage(data.chat, { text: plantilla, mentions: [...data.jugadores, ...data.suplentes] })

    partidasVS4[newMsg.key.id] = data
    partidasVS4[newMsg.key.id].originalMsgKey = newMsg.key
    delete partidasVS4[key.id]
  })
}

handler.command = ['vs4']
module.exports = handler

// 🔒 .cerrarvs4
let cerrarVS4 = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin
  if (!isAdmin && !isOwner) return conn.sendMessage(chatId, { text: '❌ Solo un admin o el dueño del bot puede cerrar la partida.' }, { quoted: msg })

  let matchId = Object.keys(partidasVS4).find(id => partidasVS4[id].chat === chatId)
  if (!matchId) return conn.sendMessage(chatId, { text: '⚠️ No hay partidas activas en este grupo.' }, { quoted: msg })

  delete partidasVS4[matchId]
  conn.sendMessage(chatId, { text: '✅ La partida ha sido cerrada. Ya no se pueden registrar jugadores.' }, { quoted: msg })
}
cerrarVS4.command = ['cerrarvs4']
module.exports.cerrarvs4 = cerrarVS4

// 🗑️ .cancelarvs4
let cancelarVS4 = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin
  if (!isAdmin && !isOwner) return conn.sendMessage(chatId, { text: '❌ Solo un admin o el dueño del bot puede cancelar la partida.' }, { quoted: msg })

  let matchId = Object.keys(partidasVS4).find(id => partidasVS4[id].chat === chatId)
  if (!matchId) return conn.sendMessage(chatId, { text: '⚠️ No hay partidas activas en este grupo.' }, { quoted: msg })

  let partida = partidasVS4[matchId]
  await conn.sendMessage(chatId, { delete: partida.originalMsgKey })
  delete partidasVS4[matchId]

  conn.sendMessage(chatId, { text: '🗑️ La partida ha sido *cancelada y eliminada*.' }, { quoted: msg })
}
cancelarVS4.command = ['cancelarvs4']
module.exports.cancelarvs4 = cancelarVS4