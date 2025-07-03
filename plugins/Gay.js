// comando: gay.js
const handler = async (msg, { conn, text, args }) => {
  const chatId = msg.key.remoteJid;
  const fromUser = msg.key.participant || msg.key.remoteJid;
  const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mentionedJid) {
    return await conn.sendMessage(chatId, { text: '🔍 Etiqueta a alguien para calcular su porcentaje gay.' }, { quoted: msg });
  }

  const nombre = (await conn.getName(mentionedJid)) || 'Usuario';
  const porcentaje = Math.floor(Math.random() * 101); // 0 a 100%
  const barra = (valor) => {
    const total = 10;
    const llenos = Math.round((valor / 100) * total);
    return `[${'█'.repeat(llenos)}${'░'.repeat(total - llenos)}]`;
  };

  const mensajeInicial = await conn.sendMessage(chatId, { text: `🌈 Calculando porcentaje gay de @${mentionedJid.split("@")[0]}...`, mentions: [mentionedJid] }, { quoted: msg });

  // Simula barra de carga con animación progresiva
  for (let i = 0; i <= porcentaje; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 500));
    await conn.sendMessage(chatId, {
      text: `🌈 Calculando...\n${barra(i)} ${i}%`,
      edit: mensajeInicial.key
    });
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  await conn.sendMessage(chatId, {
    text: `🏳️‍🌈 Resultado final:\n${barra(porcentaje)} ${porcentaje}%\n\n@${mentionedJid.split("@")[0]} tiene un ${porcentaje}% de gay 😅`,
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