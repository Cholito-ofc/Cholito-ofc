const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;

  // Obtener usuario mencionado
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
  const porcentaje = Math.floor(Math.random() * 101); // 0 a 100%
  const barra = (valor) => {
    const total = 10;
    const llenos = Math.round((valor / 100) * total);
    return `[${'█'.repeat(llenos)}${'░'.repeat(total - llenos)}]`;
  };

  // Fase 1: Mensaje "Calculando..."
  const mensajeInicial = await conn.sendMessage(chatId, {
    text: `🧠 Calculando porcentaje gay de @${numero}...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  // Fase 2: barra animada
  for (let i = 0; i <= porcentaje; i += 20) {
    await new Promise(resolve => setTimeout(resolve, 500));
    await conn.sendMessage(chatId, {
      text: `📊 Progreso...\n${barra(i)} ${i}%`,
      edit: mensajeInicial.key
    });
  }

  // Fase 3: Resultado final con estilo único
  await new Promise(resolve => setTimeout(resolve, 600));
  let mensajeFinal = '';

  if (porcentaje <= 30) {
    mensajeFinal = `🔹 Los cálculos muestran que @${numero} es apenas un ${porcentaje}% Gay 🌈\n💬 Nada grave, solo te gusta experimentar un poquito.`;
  } else if (porcentaje <= 70) {
    mensajeFinal = `🔸 Atención, atención...\n@${numero} tiene un ${porcentaje}% de Gayómetro activado 🌈\n🧪 Lo llevas en la sangre, pero con estilo.`;
  } else {
    mensajeFinal = `🔴 ¡Confirmado!\n@${numero} tiene un *${porcentaje}% de gay* 😱🏳️‍🌈\n🎉 ¡El arcoíris te representa, orgullo total!`;
  }

  await conn.sendMessage(chatId, {
    text: `${mensajeFinal}\n\n✨ El universo no se equivoca.`,
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