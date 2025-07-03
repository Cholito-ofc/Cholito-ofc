const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Soporte a minúsculas, espacios y mayúsculas
  const fullText = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  const lowerText = fullText.toLowerCase();
  const comando = lowerText.split(/\s+/)[0].replace(/^[!./#\s]+/, '');

  const comandosValidos = [
    'puta', 'puto', 'peruano', 'peruana',
    'negro', 'negra', 'manca', 'manco',
    'fea', 'feo', 'enano', 'enana',
    'cachudo', 'cachuda', 'pajero', 'pajera',
    'rata', 'adoptado', 'adoptada'
  ];

  if (!comandosValidos.includes(comando)) return;

  // Detectar a quién se está mencionando
  let mentionedJid = null;
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

  // Si NO respondió ni mencionó a nadie, mostrar ayuda
  if (!mentionedJid || mentionedJid === msg.key.participant || mentionedJid === msg.key.remoteJid) {
    return await conn.sendMessage(chatId, {
      text: `❗ *Uso incorrecto del comando*

Debes *responder al mensaje* de alguien o *etiquetar a un usuario* para escanear.

📌 *Ejemplos correctos:*
• .${comando} @usuario
• .${comando} (respondiendo al mensaje de alguien)`,
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  const frasesOwner = [
    '🛡️ *Protección Suprema Activada*\n@{user} es el alfa, el omega y el padre del comando. Intocable.',
    '👑 *Error de Sistema*\nIntentaste escanear al Creador. Abortando misión.',
    '🚫 Este usuario tiene inmunidad total ante el escáner.\nNo se toca al jefe.',
    '🔒 Modo Dios activado para @{user}. Mejor no intentes otra vez.',
    '⚠️ Escanear al Owner está prohibido por ley universal. Respeta jerarquías.'
  ];

  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero);
    return await conn.sendMessage(chatId, {
      text: frase,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }

  const frasesPorComando = {
    puta: ['𐀔 Naciste para cobrar sin amor.', '𐀔 Tu vida es un Only sin cuenta.', '𐀔 Ni en la esquina perdonas.'],
    puto: ['𐀔 Te sientas más que los muebles del INSS.', '𐀔 Te tiembla hasta el WiFi.', '𐀔 Eres leyenda urbana.'],
    peruano: ['𐀔 Tu conexión es más inestable que tu economía.', '𐀔 Cada vez que hablas, un ceviche llora.'],
    peruana: ['𐀔 Tus audios deberían ir a patrimonio cultural.', '𐀔 Tu voz activa terremotos.'],
    negro: ['𐀔 Eres más oscuro que mis ganas de vivir.', '𐀔 Ni la linterna del bot te encuentra.'],
    negra: ['𐀔 Apagas focos con solo pasar cerca.', '𐀔 Tu silueta asusta hasta en modo día.'],
    manca: ['𐀔 Fallas más que mi ex.', '𐀔 Tu KD es un insulto a la puntería.'],
    manco: ['𐀔 Tus manos deberían venir con parche.', '𐀔 Te matan antes de cargar.'],
    fea: ['𐀔 El espejo te evita.', '𐀔 Tu cara rompe más que los estados del bot.'],
    feo: ['𐀔 Ni el WiFi te quiere conectar.', '𐀔 Fuiste borrado del diccionario de estética.'],
    enana: ['𐀔 Eres mini pero molesta en tamaño real.', '𐀔 Te confunden con un sticker.'],
    enano: ['𐀔 Saltas y aún así no das miedo.', '𐀔 Eres la versión demo de un jugador.'],
    cachudo: ['𐀔 Eres el rey del cornómetro.', '𐀔 La infidelidad te sigue como la sombra.'],
    cachuda: ['𐀔 Te ponen los cuernos hasta en Roblox.', '𐀔 El grupo entero lo sabía menos tú.'],
    pajero: ['𐀔 Ya saludas con la mano izquierda.', '𐀔 Tu historial da miedo al FBI.'],
    pajera: ['𐀔 Nadie te quiere, pero tú te amas.', '𐀔 Tu vibrador necesita vacaciones.'],
    rata: ['𐀔 Te escondes cuando es tu turno de pagar.', '𐀔 Más codo que luchador sin brazo.'],
    adoptado: ['𐀔 Eres el DLC de la familia.', '𐀔 Llegaste sin tutorial.'],
    adoptada: ['𐀔 Fuiste agregada como sticker.', '𐀔 Tu existencia fue sorpresa para todos.']
  };

  const cierres = [
    '➢ Los científicos lo confirman.',
    '➢ El universo no se equivoca.',
    '➢ Esto es irrefutable.',
    '➢ Ya ni la NASA lo puede negar.',
    '➢ Registro validado en la base del multiverso.'
  ];

  const remate = frasesPorComando[comando][Math.floor(Math.random() * frasesPorComando[comando].length)];
  const cierre = cierres[Math.floor(Math.random() * cierres.length)];
  const porcentaje = Math.floor(Math.random() * 101);

  const textoFinal = `💫 *ESCÁNER COMPLETO*

*🔥 𝙻𝙾𝚂 𝙲𝙰́𝙻𝙲𝚄𝙻𝙾𝚂 𝙷𝙰𝙽 𝙰𝚁𝙾𝙹𝙰𝙳𝙾 𝚀𝚄𝙴* @${numero} *𝙴𝚂 『 ${porcentaje}% 』* *${comando.toUpperCase()}*

> ${remate}

${cierre}`;

  await conn.sendMessage(chatId, {
    text: textoFinal,
    mentions: [mentionedJid]
  }, { quoted: msg });
};

handler.command = [
  'puta', 'puto', 'peruano', 'peruana',
  'negro', 'negra', 'manca', 'manco',
  'fea', 'feo', 'enano', 'enana',
  'cachudo', 'cachuda', 'pajero', 'pajera',
  'rata', 'adoptado', 'adoptada'
];

handler.tags = ['diversión'];
handler.help = handler.command.map(c => `${c} @usuario o responde`);
handler.group = true;
handler.register = true;

module.exports = handler;