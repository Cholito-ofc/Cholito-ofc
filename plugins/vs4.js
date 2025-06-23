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
    return conn.sendMessage(chatId, { text: "❌ Solo admins o el dueño del bot pueden usar este comando." }, { quoted: msg })
  }

  const horaTexto = args[0]
  const modalidad = args.slice(1).join(' ') || 'CLK'
  if (!horaTexto) {
    return conn.sendMessage(chatId, { text: "✳️ Usa el comando así:\n*.4vs4 [hora] [modalidad]*\nEjemplo: .4vs4 5:00pm vs sala normal" }, { quoted: msg })
  }

  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/)
    let [h, m] = time.split(":").map(n => parseInt(n))
    if (modifier === 'pm' && h !== 12) h += 12
    if (modifier === 'am' && h === 12) h = 0
    return { h, m: m || 0 }
  }

  const to12Hour = (h, m) => {
    const suffix = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m.toString().padStart(2, '0')} ${suffix}`
  }

  const base = to24Hour(horaTexto)

  const zonas = [
    { pais: "🇲🇽", offset: 0 },
    { pais: "🇨🇴", offset: 1 }
  ]

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset
    let newM = base.m
    if (newH >= 24) newH -= 24
    return `┊ • ${to12Hour(newH, newM)} ${z.pais}`
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
┊
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

    if (jugadoresGlobal.has(sender)) return
    if (data.jugadores.includes(sender)) return

    if (emojisParticipar.includes(emoji)) {
      if (data.jugadores.length < 4) {
        let index = data.suplentes.indexOf(sender)
        if (index !== -1) {
          data.suplentes.splice(index, 1)
          data.jugadores.push(sender)
          jugadoresGlobal.add(sender)
        } else {
          data.jugadores.push(sender)
          jugadoresGlobal.add(sender)
        }
      }
    } else if (emojisSuplente.includes(emoji)) {
      if (data.suplentes.length < 2 && !data.suplentes.includes(sender)) {
        data.suplentes.push(sender)
      }
    } else return

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
┊
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

• Lista activa por 5 minutos
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