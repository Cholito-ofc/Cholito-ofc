const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  const frasesOwner = [
    '🛡️ *Protección Suprema Activada*\n@{user} es el alfa, el omega y el padre del comando. Intocable.',
    '👑 *Error de Sistema*\nIntentaste escanear al Creador. Abortando misión.',
    '🚫 Este usuario tiene inmunidad total ante el gayómetro.\nNo se toca al jefe.',
    '🔒 Modo Dios activado para @{user}. Mejor no intentes otra vez.',
    '⚠️ Escanear al Owner está prohibido por ley universal. Respeta jerarquías.'
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

  const frasesFinales = [
    '✰ Lo tuyo, lo tuyo es que eres gay.',
    '✰ Y eso no lo arregla ni rezando.',
    '✰ Ya ni el closet te quiere dentro.',
    '✰ No lo niegues, se te nota desde el saludo.',
    '✰ Eres más gay que el filtro de corazones.',
    '✰ Confirmado por la NASA y tu ex.',
    '✰ Te escaneamos... y explotó el gayómetro.',
    '✰ Modo diva activado sin retorno.',
    '✰ Si fueras más gay, serías una bandera con patas.',
    '✰ Esto ya no es sospecha, es evidencia científica.',
    // Puedes agregar más frases aquí para mayor variedad
  ];

  const frasesCierre = [
    '➤ Los científicos lo confirman.',
    '➤ El universo no se equivoca.',
    '➤ Datos verificados por la comunidad.',
    '➤ Esto es ciencia, no opinión.',
    '➤ Registro oficial en el archivo del arcoíris.',
    // Puedes agregar más cierres aquí si quieres
  ];

  const remate = frasesFinales[Math.floor(Math.random() * frasesFinales.length)];
  const cierre = frasesCierre[Math.floor(Math.random() * frasesCierre.length)];

  const resultado =
`💫 *CALCULADORA*

🖤 Los cálculos han arrojado que @${numero} es *${porcentaje}%* Gay 🏳️‍🌈
> ${remate}

${cierre}`;

  await conn.sendMessage(chatId, {
    text: resultado,
    mentions: [mentionedJid]
  }, { quoted: msg });

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