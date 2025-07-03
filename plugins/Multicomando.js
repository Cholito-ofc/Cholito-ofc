const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Detectar comando usado
  const comando = msg.body?.split(' ')[0]?.slice(1)?.toLowerCase();

  // Obtener JID del usuario mencionado o respondido
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
      text: '🔍 *Etiqueta o responde al mensaje de alguien para usar este comando.*',
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];
  const porcentaje = Math.floor(Math.random() * 101);

  // Protección owner
  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    return await conn.sendMessage(chatId, {
      text: `🛡️ @${numero} está protegido por el sistema supremo. Ni lo intentes.`,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }

  const frases = {
    puta: [
      '✦ Naciste para cobrar sin amor.',
      '✦ Ni en la esquina perdonas.',
      '✦ Tu vida es un Only sin cuenta.',
      '✦ El suelo te extraña cuando no estás encima.',
    ],
    puto: [
      '✦ Te sientas más que los muebles del INSS.',
      '✦ No te respetan ni en el FIFA.',
      '✦ Eres leyenda urbana en la zona roja.',
      '✦ Te tiembla hasta el WiFi de tantos bajones.',
    ],
    peruano: [
      '✦ Tu conexión es más inestable que tu economía.',
      '✦ Si fueras internet, serías Bitel.',
      '✦ Cada vez que hablas, un ceviche llora.',
      '✦ Ni Machu Picchu te reconoce como local.',
    ],
    peruana: [
      '✦ Tus audios deberían ir a patrimonio cultural.',
      '✦ Cada sticker tuyo vale un sol.',
      '✦ Eres el motivo de cada bug en el grupo.',
      '✦ Tu voz activa terremotos.',
    ],
    negro: [
      '✦ Eres más oscuro que mis ganas de vivir.',
      '✦ Ni la linterna del bot te encuentra.',
      '✦ Te camuflas en la sombra de la sombra.',
      '✦ Apareces en fotos con filtro negativo.',
    ],
    negra: [
      '✦ Apagas focos con solo pasar cerca.',
      '✦ Tu silueta asusta hasta en modo día.',
      '✦ El eclipse te pidió que te apartaras.',
      '✦ Brillas por tu opacidad.',
    ],
    manca: [
      '✦ Fallas más que mi ex en fidelidad.',
      '✦ No le das ni a una piñata amarrada.',
      '✦ Tu KD es un insulto a la puntería.',
      '✦ Disparas dudas, no balas.',
    ],
    manco: [
      '✦ Eres la razón por la que existen los bots.',
      '✦ Tus manos deberían venir con parche.',
      '✦ Te matan antes de cargar la partida.',
      '✦ Tu precisión ofende a los ciegos.',
    ],
    fea: [
      '✦ El espejo te evita.',
      '✦ Fuiste rechazada hasta por el filtro de belleza.',
      '✦ Eres el motivo por el que existe el modo oscuro.',
      '✦ Tu cara rompe más que los estados del bot.',
    ],
    feo: [
      '✦ Cuando naciste, el doctor se disculpó.',
      '✦ Eres el susto antes de dormir.',
      '✦ Ni el WiFi te quiere conectar.',
      '✦ Fuiste borrado del diccionario de estética.',
    ],
    enana: [
      '✦ Necesitas escalera hasta para los audios largos.',
      '✦ En el VS ni te ven llegar.',
      '✦ Te confunden con un sticker.',
      '✦ Eres mini pero molesta en tamaño real.',
    ],
    enano: [
      '✦ Saltas y aún así no das miedo.',
      '✦ Eres la versión demo de un jugador.',
      '✦ Te cargan más que a una laptop vieja.',
      '✦ Si fueras más bajo, serías emoji.',
    ],
  };

  if (!Object.keys(frases).includes(comando)) return;

  const remate = frases[comando][Math.floor(Math.random() * frases[comando].length)];
  const cierreOpciones = [
    '➤ Los científicos lo confirman.',
    '➤ El universo no se equivoca.',
    '➤ Esto es irrefutable.',
    '➤ Ya ni la NASA lo puede negar.',
    '➤ El registro ha sido enviado al servidor supremo.',
  ];
  const cierre = cierreOpciones[Math.floor(Math.random() * cierreOpciones.length)];

  const resultado = `🎯 *ESCANEO COMPLETO*

@${numero} es *${porcentaje}% ${comando.toUpperCase()}*

${remate}

${cierre}`;

  await conn.sendMessage(chatId, {
    text: resultado,
    mentions: [mentionedJid]
  }, { quoted: msg });
};

handler.command = [
  'puta', 'puto', 'peruano', 'peruana',
  'negro', 'negra', 'manca', 'manco',
  'fea', 'feo', 'enano', 'enana'
];
handler.tags = ['diversión'];
handler.help = handler.command.map(c => `${c} @usuario o responde`);
handler.group = true;
handler.register = true;

module.exports = handler;