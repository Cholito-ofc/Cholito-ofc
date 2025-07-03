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

  const toTypewriter = (text) => {
    const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const typewriter = '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿';
    return text.split('').map(c => {
      const i = normal.indexOf(c);
      return i >= 0 ? typewriter[i] : c;
    }).join('');
  };

  let mentionedJid;
  try {
    mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      msg.message?.contextInfo?.participant;
  } catch (e) {
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
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero);
    const sticker = stickersOwner[Math.floor(Math.random() * stickersOwner.length)];

    await conn.sendMessage(chatId, {
      text: frase,
      mentions: [mentionedJid]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      sticker: { url: sticker }
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
    await new Promise(r => setTimeout(r, 450));
    await conn.sendMessage(chatId, {
      text: `🔎 *Procesando...*\n${barra(i)} ${i}%`,
      edit: mensajeInicial.key
    });
  }

  await new Promise(r => setTimeout(r, 600));

  const mensajesBajo = [
    'JURAS QUE ERES HÉTERO PERO TE PONEN SHAKIRA Y TE DELATAS.',
    'ESA ACTITUD MACHITO TE DURA HASTA QUE SUENA RBD EN LA FIESTA.',
    'ERES MÁS HÉTERO QUE UNA PARED BLANCA… ¿O NO TANTO?'
  ];

  const mensajesMedio = [
    'TE HACÉS EL RUDO PERO ESE “QUIUBO” SUENA DEMASIADO SUAVE.',
    'TIENES AMIGOS “CON DERECHOS” PERO SIGUES DICIENDO QUE SON BROMAS.',
    'TE FALTAN DOS GIN TONIC Y UN PERREO PARA SOLTARLO TODO.'
  ];

  const mensajesAlto = [
    'TE BRILLAN LOS CHAKRAS, LOS ZAPATOS Y LAS PESTAÑAS.',
    'ERES EL CENTRO DEL ESCÁNDALO Y EL PRIMER EN BAILAR "SÁCALA A BAILAR".',
    'CON ESA ACTITUD, NI TE SALVES DEL ARCOÍRIS NI LO INTENTES.'
  ];

  const mensajesMuyAlto = [
    'REINA DEL FLOW, MAESTRO DEL GLAMOUR, DIOSA DE LA DIVERSIDAD.',
    'ERES MÁS GAY QUE UNA BOLSA DE PURPURINA EN CARNAVAL.',
    'CON ESA ENERGÍA, NI EL UNIVERSO TE PUEDE ESCONDER. ERES UN ÍCONO VIVIENTE.'
  ];

  let listaMensajes;
  if (porcentaje <= 20) listaMensajes = mensajesBajo;
  else if (porcentaje <= 50) listaMensajes = mensajesMedio;
  else if (porcentaje <= 80) listaMensajes = mensajesAlto;
  else listaMensajes = mensajesMuyAlto;

  const textoElegido = toTypewriter(listaMensajes[Math.floor(Math.random() * listaMensajes.length)]);

  const decorado =
`╭┈┈┈≫[ 🎯 *ESCÁNER GAY* ]≪┈┈┈┈╮

🔥 @${numero} es *${porcentaje}% Gay Confirmado* 🏳️‍🌈
${textoElegido}

╰┈┈┈┈≫ *𝑬𝒍 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒐 𝒏𝒖𝒏𝒄𝒂 𝒇𝒂𝒍𝒍𝒂*≪┈┈┈╯`;

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