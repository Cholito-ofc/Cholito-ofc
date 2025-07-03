const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  const frasesOwner = [
    '🛡️ *Protección Suprema Activada*\n@{user} es el creador, el alfa y el omega de este bot. No se toca.',
    '👑 *Error de Sistema: Intento fallido de escaneo*\n@{user} tiene inmunidad absoluta ante el gayómetro.',
    '⚠️ *Advertencia Crítica*\nEscanear a @{user} puede causar una explosión del servidor. Operación cancelada.',
    '🚨 *ALERTA: OBJETIVO RESTRINGIDO*\n@{user} tiene un sello celestial. Intocable por simples mortales.',
    '🔒 *Modo Dios Activado*\nNo puedes medir lo que está más allá del arcoíris. @{user} está fuera del sistema.'
  ];

  const stickersOwner = [
    'https://cdn.russellxz.click/9087aa1c.webp',
    'https://cdn.russellxz.click/85a16aa5.webp',
    'https://cdn.russellxz.click/270edf17.webp',
    'https://cdn.russellxz.click/afd908e6.webp'
  ];

  const audioURL = 'https://cdn.russellxz.click/96beb11b.mp3';

  let mentionedJid;
  try {
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message?.contextInfo?.mentionedJid?.length) {
      mentionedJid = msg.message.contextInfo.mentionedJid[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      mentionedJid = msg.message.extendedTextMessage.contextInfo.participant;
    } else if (msg.message?.contextInfo?.participant) {
      mentionedJid = msg.message.contextInfo.participant;
    }
  } catch {
    mentionedJid = null;
  }

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, {
      text: '🔍 *Etiqueta o responde a alguien para escanear su porcentaje gay.*',
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    const fraseElegida = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero);
    const stickerElegido = stickersOwner[Math.floor(Math.random() * stickersOwner.length)];

    await conn.sendMessage(chatId, {
      text: fraseElegida,
      mentions: [mentionedJid]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      sticker: { url: stickerElegido }
    }, { quoted: msg });

    return;
  }

  const porcentaje = Math.floor(Math.random() * 101);
  const barra = (valor) => {
    const total = 10;
    const llenos = Math.round((valor / 100) * total);
    return `[${'█'.repeat(llenos)}${'░'.repeat(total - llenos)}]`;
  };

  const mensajeInicial = await conn.sendMessage(chatId, {
    text: `📡 *Escaneando a @${numero}...*\n🔬 Analizando el arcoíris interior...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  for (let i = 0; i <= porcentaje; i += 20) {
    await new Promise(resolve => setTimeout(resolve, 450));
    await conn.sendMessage(chatId, {
      text: `🔎 *Procesando...*\n${barra(i)} ${i}%`,
      edit: mensajeInicial.key
    });
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  // 🔥 Mensajes tipo 81-100% para todos los porcentajes
  const mensajesTodos = [
    `👑 ERES PURA LUZ, GLAMOUR Y DIVERSIDAD.\n   EL CORAZÓN DEL ARCOÍRIS LATE FUERTE EN TI.`,
    `🔥 EL BRILLO QUE LLEVAS NO SE PUEDE OCULTAR.\n   EL UNIVERSO TE BENDIJO CON ESTILO Y MAGIA.`,
    `✨ BRILLAS CON UNA INTENSIDAD FUERA DE ESTE MUNDO.\n   ERES LA DEFINICIÓN VIVA DEL ORGULLO Y LA ALEGRÍA.`,
    `💅 DESBORDAS COLOR, ENCANTO Y ACTITUD.\n   ERES LA REINA DEL ARCOÍRIS Y SE SIENTE.`,
    `🌈 CADA PASO TUYO DEJA UN RASTRO DE GLAMOUR.\n   EL MUNDO ADMIRA TU ENERGÍA Y TU FUERZA.`
  ];

  const mensajeFinal = mensajesTodos[Math.floor(Math.random() * mensajesTodos.length)];

  const emojiPorcentaje =
    porcentaje <= 20 ? '🔥' :
    porcentaje <= 50 ? '🌈' :
    porcentaje <= 80 ? '💅' : '👑';

  const decorado =
`╭┈┈┈≫[ 🎯 *ESCÁNER GAY* ]≪┈┈┈╮

${emojiPorcentaje} @${numero} es *${porcentaje}% Gay Confirmado* 🏳️‍🌈

${mensajeFinal}

╰┈┈┈┈≫ *𝑬𝒍 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒐 𝒏𝒖𝒏𝒄𝒂 𝒇𝒂𝒍𝒍𝒂* ≪┈┈┈╯`;

  await conn.sendMessage(chatId, {
    text: decorado,
    mentions: [mentionedJid],
    edit: mensajeInicial.key
  });

  if (audioURL) {
    await conn.sendMessage(chatId, {
      audio: { url: audioURL },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: msg });
  }
};

handler.command = ['gay'];
handler.tags = ['diversión'];
handler.help = ['gay @usuario o responde'];
handler.register = true;
handler.group = true;

module.exports = handler;