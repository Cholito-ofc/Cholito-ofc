const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  // 🔰 Frases para protección al Owner
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

  const audioURL = 'https://cdn.russellxz.click/96beb11b.mp3'; // 🎧 Tu audio personalizado

  // Función para convertir texto a monospace estilizado
  function toMonoSpace(text) {
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const mono = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";
    return text.split('').map(c => {
      const idx = normal.indexOf(c);
      return idx !== -1 ? mono[idx] : c;
    }).join('');
  }

  // 🧠 Obtener JID mencionado o desde mensaje respondido
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
  } catch (e) {
    mentionedJid = null;
  }

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, {
      text: '🔍 *Etiqueta o responde a alguien para escanear su porcentaje gay.*',
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  // 🔒 Protección al owner
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

  // 🎯 Escaneo normal
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

  // 📝 Mensajes personalizados por rango con varios textos para cada uno

  const mensajesBajo = [
    `😎 CASI INVISIBLE, PERO EL ESTILO Y LA ACTITUD HABLAN POR TI.\nSIGUES EN MODO SECRETO, PERO NO TE CONFÍES, EL ARCOÍRIS TE SIGUE.`,
    `🔵 ERES EL MAESTRO DEL DISFRAZ, SUTIL Y ELEGANTE.\nEL MUNDO NO TE VE, PERO TU BRILLO ESTÁ AHÍ.`,
    `💧 UN TOQUE DE COLOR QUE APENAS SE DEJA VER.\nEL SECRETO MEJOR GUARDADO DEL ARCOÍRIS.`
  ];

  const mensajesMedio = [
    `⚠️ EL ARCOÍRIS ASOMA, ENTRE RISAS Y MIRADAS.\nERES UNA MEZCLA PERFECTA DE MISTERIO Y BRILLO, Y NADIE PUEDE QUITARTE ESA CHISPA QUE TE HACE ÚNICO/A.`,
    `🟡 UNA ENERGÍA QUE NO PASA DESAPERCIBIDA.\nTE GUSTA JUGAR ENTRE SOMBRAS Y LUCES.`,
    `🌟 EL EQUILIBRIO PERFECTO ENTRE EL MISTERIO Y LA LUZ.\nDEJAS UNA HUELLA QUE NADIE OLVIDA.`
  ];

  const mensajesAlto = [
    `🔥 EL BRILLO ES IRREFUTABLE, EL ESTILO INIGUALABLE.\nNO PUEDES ESCONDER ESA ENERGÍA QUE IRRADIAS, Y TODOS SABEN QUE ERES LA ALMA DE LA FIESTA Y EL ARCOÍRIS.`,
    `💃 EL FLOW Y LA ACTITUD QUE MARCAN LA DIFERENCIA.\nTU PRESENCIA ILUMINA CUALQUIER LUGAR.`,
    `🌈 EL ORGULLO QUE LLEVAS DENTRO SE SIENTE EN EL AMBIENTE.\nNADIE SE RESISTE A TU CARISMA Y ENCANTO.`
  ];

  const mensajesMuyAlto = [
    `💥 REINA ABSOLUTA DEL ORGULLO, EL GLAMOUR Y LA DIVERSIDAD.\nTU LUZ ES TAN FUERTE QUE ILUMINA TODO A TU ALREDEDOR, Y NADIE PUEDE NEGAR QUE ERES EL CORAZÓN DEL ARCOÍRIS.`,
    `🔥 EL FARO QUE GUÍA EL CAMINO DEL ORGULLO.\nUN REFERENTE DE VALENTÍA, LUZ Y ALEGRÍA.`,
    `👑 EL SÍMBOLO VIVO DEL BRILLO Y LA DIVERSIDAD.\nTU ENERGÍA TRANSFORMA TODO A TU PASO.`
  ];

  let mensajeFinalList = [];
  if (porcentaje <= 20) mensajeFinalList = mensajesBajo;
  else if (porcentaje <= 50) mensajeFinalList = mensajesMedio;
  else if (porcentaje <= 80) mensajeFinalList = mensajesAlto;
  else mensajeFinalList = mensajesMuyAlto;

  // Seleccionar mensaje aleatorio del rango
  const mensajeFinal = mensajeFinalList[Math.floor(Math.random() * mensajeFinalList.length)];

  // Emojis de porcentaje según rango, sin rojo fuerte
  const emojiPorcentaje = porcentaje <= 20 ? '🔥' :
    porcentaje <= 50 ? '🌈' :
      porcentaje <= 80 ? '💅' : '🔥';

  // Construir mensaje final con estilo monospace y línea extra
  const textoFinal = 
    `${toMonoSpace(`${emojiPorcentaje} @${numero} es ${porcentaje}% Gay Confirmado 🏳️‍🌈`)}\n\n` +
    `${toMonoSpace(mensajeFinal)}\n\n` +
    `${toMonoSpace('El universo lo confirma')}`;

  await conn.sendMessage(chatId, {
    text: textoFinal,
    mentions: [mentionedJid],
    edit: mensajeInicial.key
  });

  // 🔊 Audio al final
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