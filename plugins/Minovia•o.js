const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const textRaw = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const command = (textRaw.match(/^[!./#]?\s*(\w+)/) || [])[1]?.toLowerCase();

  const comandos = ['minovia', 'minovio'];
  if (!comandos.includes(command)) return;

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
  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    return await conn.sendMessage(chatId, {
      text: `💥 *Error del universo*\n\nNo puedes reclamar como novio(a) a un *owner supremo*.`,
      mentions: [mentionedJid]
    }, { quoted: msg });
  }

  const frases = {
    minovia: [
      '𝙀𝙎𝙏𝘼 𝙀𝙎 𝙈𝙄 𝙉𝙊𝙑𝙄𝘼, *¿𝙀𝙎 𝙃𝙀𝙍𝙈𝙊𝙎𝘼 𝙑𝙀𝙍𝘿𝘼𝘿*? 😍\n\n@{user} 𝙀𝙍𝙀𝙎 𝙇𝘼 𝙈𝙀𝙅𝙊𝙍 𝙉𝙊𝙑𝙄𝘼 𝘿𝙀𝙇 𝙈𝙐𝙉𝘿𝙊, 𝙏𝙀 𝙌𝙐𝙄𝙀𝙍𝙊 𝘽𝙀𝘽𝙀.🫶🏻♥️'
    ],
    minovio: [
      '✨ *ÉL ES MI NOVIO* ✨\n\n@{user} 𝙀𝙎 𝙀𝙇 𝘾𝙃𝙄𝙆𝙊 𝙌𝙐𝙀 𝙈𝙀 𝙃𝘼𝙍𝘼 𝙎𝙀𝙍 𝙁𝙀𝙇𝙄𝙕 𝙎𝙄𝙀𝙈𝙋𝙍𝙀. 💖'
    ]
  };

  const frase = frases[command][Math.floor(Math.random() * frases[command].length)].replace('{user}', numero);

  let pfp;
  try {
    pfp = await conn.profilePictureUrl(mentionedJid, 'image');
  } catch {
    pfp = null;
  }

  const imagenDefault = 'https://cdn.russellxz.click/a4d463cd.jpeg';
  const imagenFinal = pfp || imagenDefault;

  await conn.sendMessage(chatId, {
    image: { url: imagenFinal },
    caption: frase,
    mentions: [mentionedJid]
  }, { quoted: msg });
};

handler.command = ['minovia', 'minovio'];
handler.help = ['minovia @usuario', 'minovio @usuario'];
handler.tags = ['amor', 'diversión'];
handler.group = true;
handler.register = true;

module.exports = handler;