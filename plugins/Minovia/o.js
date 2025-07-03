const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const textRaw = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const command = (textRaw.match(/^[!./#]?\s*(\w+)/) || [])[1]?.toLowerCase();

  const comandos = ['minovia', 'minovio'];
  if (!comandos.includes(command)) return;

  // Obtener el usuario mencionado o respondido
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

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, {
      text: `❗ *Uso incorrecto del comando.*\n\nDebes *etiquetar* o *responder* al mensaje de la persona que deseas presumir como tu ${command === 'minovia' ? 'novia' : 'novio'}.\n\n📌 *Ejemplos correctos:*\n> .${command} @usuario\n> .${command} (respondiendo al mensaje de alguien)`
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  // Protección del owner
  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    return await conn.sendMessage(chatId, {
      text: `💥 *Error del universo*\n\nNo puedes reclamar como novio(a) a un *owner supremo*.\nEstá fuera de tu liga.`,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }

  // Frases por comando
  const frases = {
    minovia: [
      '💖 *Miren, ella es mi novia.*',
      '✨ *Ella me roba suspiros todos los días.*',
      '🥰 *La más hermosa, mi razón de sonreír.*',
      '👸 *La reina de mi mundo está aquí.*',
    ],
    minovio: [
      '😍 *Miren, él es mi novio.*',
      '💘 *Él me da paz y amor cada día.*',
      '💞 *Mi compañero favorito, siempre él.*',
      '🤴 *El rey de mi corazón está presente.*',
    ]
  };

  const frase = frases[command][Math.floor(Math.random() * frases[command].length)];

  // Foto de perfil o imagen predeterminada
  let pfp;
  try {
    pfp = await conn.profilePictureUrl(mentionedJid, 'image');
  } catch {
    pfp = null;
  }

  const imagenDefault = 'https://cdn.russellxz.click/e6512a74.jpeg';
  const imagenFinal = pfp || imagenDefault;

  await conn.sendMessage(chatId, {
    image: { url: imagenFinal },
    caption: `${frase}\n\n@${numero}`,
    mentions: [mentionedJid]
  }, { quoted: msg });
};

handler.command = ['minovia', 'minovio'];
handler.help = ['minovia @usuario', 'minovio @usuario'];
handler.tags = ['amor', 'diversión'];
handler.group = true;
handler.register = true;

module.exports = handler;