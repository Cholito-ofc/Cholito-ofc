const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  // 📌 Frases aleatorias para proteger al owner
  const frasesOwner = [
    '⚠️ *Con el dueño no se juega.*\n👑 ¡@{user} está blindado contra el gayómetro!',
    '🛡️ *Error 403:* Prohibido escanear a @{user}. Nivel de poder demasiado alto.',
    '⛔ *Sistema bloqueado.*\n@{user} es inmune a esta clase de ataques 😂',
    '🧠 *Ni lo intentes...*\n@{user} hackea el gayómetro con solo mirarlo.',
    '🚨 *Protección activada.*\n@{user} es el fundador, respeten su arcoíris 🔥'
  ];

  // Stickers aleatorios (puedes agregar más)
  const stickersOwner = [
    'https://cdn.russellxz.click/9087aa1c.webp',
    'https://cdn.russellxz.click/85a16aa5.webp',
    'https://cdn.russellxz.click/270edf17.webp',
    'https://cdn.russellxz.click/afd908e6.webp'
  ];

  // Obtener JID mencionado
  let mentionedJid;
  try {
    mentionedJid =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.contextInfo?.mentionedJid?.[0];
  } catch (e) {
    mentionedJid = null;
  }

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, {
      text: '🔍 *Etiqueta a alguien para calcular su porcentaje gay.*',
    }, { quoted: msg });
  }

  const numero = mentionedJid.split('@')[0];

  // 🧩 Verificar si están etiquetando al owner
  const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero);
  if (isTaggedOwner) {
    // Elegir frase y sticker aleatoriamente
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

  // === Lógica normal del comando ===
  const porcentaje = Math.floor(Math.random() * 101);
  const barra = (valor) => {
    const total = 10;
    const llenos = Math.round((valor / 100) * total);
    return `[${'█'.repeat(llenos)}${'░'.repeat(total - llenos)}]`;
  };

  const mensajeInicial = await conn.sendMessage(chatId, {
    text: `⏳ *Escaneando a @${numero}...*\n🌈 Calculando nivel gay...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  for (let i = 0; i <= porcentaje; i += 20) {
    await new Promise(resolve => setTimeout(resolve, 450));
    await conn.sendMessage(chatId, {
      text: `📡 *Analizando...*\n${barra(i)} ${i}%`,
      edit: mensajeInicial.key
    });
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  let decorado = `╭━━〔 *📊 RESULTADO FINAL* 〕━━⬣\n`;

  let mensajeFinal = '';
  if (porcentaje <= 20) {
    mensajeFinal = `💙 Los cálculos han arrojado que @${numero} es *${porcentaje}% Gay* 🧬\n◽ Nivel bajo... ¡Tú eres hetero con plot twist! 😂`;
  } else if (porcentaje <= 50) {
    mensajeFinal = `🧡 El escáner indica que @${numero} es *${porcentaje}% Gay* 🌈\n◽ Hay energía sospechosa... ¿Amix con derechos? 👀`;
  } else if (porcentaje <= 80) {
    mensajeFinal = `💖 ¡Advertencia!\n@${numero} tiene *${porcentaje}% de Gay* 🌈\n◽ La gayensia fluye con fuerza en ti... ¡Y se nota! 💅`;
  } else {
    mensajeFinal = `❤️‍🔥 ¡CONFIRMADO!\n@${numero} es *${porcentaje}% ultra mega Gay* 🏳️‍🌈\n◽ Eres el sol brillante del arcoíris, con brillo, flow y escándalo 🔥👑`;
  }

  decorado += `┃\n${mensajeFinal}\n┃\n╰━━━━━━⊰ *𝑬𝒍 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒐 𝒏𝒐 𝒎𝒊𝒆𝒏𝒕𝒆* ⊱━━━━⬣`;

  await conn.sendMessage(chatId, {
    text: decorado,
    mentions: [mentionedJid],
    edit: mensajeInicial.key
  });
};

handler.command = ['gay'];
handler.tags = ['diversión'];
handler.help = ['gay @usuario'];
handler.register = true;
handler.group = true;

module.exports = handler;