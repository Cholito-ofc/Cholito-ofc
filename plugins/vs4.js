let partidasVS4 = {};
let jugadoresGlobal = new Set();

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg });
  }

  const meta = await conn.groupMetadata(chatId);
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin;

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "❌ Solo admins o el dueño del bot pueden usar este comando." }, { quoted: msg });
  }

  const horaTexto = args[0];
  const modalidad = args.slice(1).join(" ") || "CLK";
  if (!horaTexto) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n*.4vs4 [hora] [modalidad]*\nEjemplo: *.4vs4 5:00pm clk*",
    }, { quoted: msg });
  }

  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/);
    let [h, m] = time.split(":").map(n => parseInt(n));
    if (modifier === 'pm' && h !== 12) h += 12;
    if (modifier === 'am' && h === 12) h = 0;
    return { h, m: m || 0 };
  };

  const to12Hour = (h, m) => {
    const suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')}${suffix}`;
  };

  const base = to24Hour(horaTexto);
  const zonas = [
    { pais: "🇲🇽 MÉXICO", offset: 0 },
    { pais: "🇨🇴 COLOMBIA", offset: 1 }
  ];

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset;
    let newM = base.m;
    if (newH >= 24) newH -= 24;
    return `┊ • ${to12Hour(newH, newM)} ${z.pais}`;
  }).join("\n");

  const plantilla = generarPlantilla([], [], modalidad, horaMsg);
  const tempMsg = await conn.sendMessage(chatId, { text: plantilla }, { quoted: msg });

  partidasVS4[tempMsg.key.id] = {
    chat: chatId,
    jugadores: [],
    suplentes: [],
    originalMsgKey: tempMsg.key,
    modalidad,
    horaMsg
  };

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message?.reactionMessage) return;

    const { key, text: emoji } = m.message.reactionMessage;
    const sender = m.key.participant || m.key.remoteJid;
    const data = partidasVS4[key.id];
    if (!data) return;

    const corazones = ['❤️', '❤', '♥', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥'];
    const likes = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'];

    const esTitular = data.jugadores.includes(sender);
    const esSuplente = data.suplentes.includes(sender);

    let cambio = false;

    if (corazones.includes(emoji)) {
      if (esTitular) return;
      if (esSuplente && data.jugadores.length < 4) {
        data.suplentes = data.suplentes.filter(s => s !== sender);
        data.jugadores.push(sender);
        cambio = true;
      } else if (!esTitular && !esSuplente && data.jugadores.length < 4) {
        data.jugadores.push(sender);
        cambio = true;
      }
    }

    else if (likes.includes(emoji)) {
      if (esSuplente) return;
      if (esTitular && data.suplentes.length < 2) {
        data.jugadores = data.jugadores.filter(j => j !== sender);
        data.suplentes.push(sender);
        cambio = true;
      } else if (!esTitular && !esSuplente && data.suplentes.length < 2) {
        data.suplentes.push(sender);
        cambio = true;
      }
    }

    if (!cambio) return;

    const jugadores = data.jugadores.map(u => `@${u.split('@')[0]}`);
    const suplentes = data.suplentes.map(u => `@${u.split('@')[0]}`);
    const nuevoTexto = generarPlantilla(jugadores, suplentes, data.modalidad, data.horaMsg);

    await conn.sendMessage(data.chat, {
      text: nuevoTexto,
      mentions: [...data.jugadores, ...data.suplentes]
    });
  });
};

function generarPlantilla(jugadores, suplentes, modalidad, horaMsg) {
  return `
ㅤ ㅤ4 \`𝗩𝗘𝗥𝗦𝗨𝗦\` 4
╭─────────────╮
┊ \`𝗠𝗢𝗗𝗢:\` \`\`\`${modalidad}\`\`\`
┊
┊ ⏱️ \`𝗛𝗢𝗥𝗔𝗥𝗜𝗢\`
${horaMsg}
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

• Lista Activa Por 5 Minutos`.trim();
}

handler.command = ['vs4'];
module.exports = handler;