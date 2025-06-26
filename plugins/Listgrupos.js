const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // Solo permite al Owner
  if (!global.owner.some(([id]) => id === senderNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *owner* del bot puede usar este comando."
    }, { quoted: msg });
  }

  let fetched;
  try {
    fetched = await conn.groupFetchAllParticipating();
  } catch (e) {
    console.error('Error en groupFetchAllParticipating:', e);
    return conn.sendMessage(chatId, { text: '❌ Error al obtener grupos.' }, { quoted: msg });
  }

  const entries = fetched instanceof Map
    ? Array.from(fetched.entries())
    : Object.entries(fetched || {});

  const grupos = [];

  for (const [jid, meta] of entries) {
    if (!meta || !meta.subject) continue;
    if (!jid.endsWith('@g.us')) continue;

    grupos.push({
      name: meta.subject,
      id: jid
    });
  }

  if (grupos.length === 0) {
    global.gruposAdmin = [];
    return conn.sendMessage(chatId, { text: '🚫 No estoy en ningún grupo.' }, { quoted: msg });
  }

  // Enumerar los grupos
  grupos.forEach((g, idx) => {
    g.code = String(idx + 1);
  });

  global.gruposAdmin = grupos;

  // Construir mensaje
  let texto = '✨ *Grupos donde está el bot (elige uno para enviar aviso)*\n\n';
  const botones = [];

  grupos.slice(0, 10).forEach((g) => { // Limita a 10 botones (WhatsApp permite máx. 10)
    texto += `🔹 *${g.code}. ${g.name}*\n`;
    texto += `• JID: ${g.id}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;

    botones.push({
      buttonId: `.aviso ${g.code} Este es un aviso rápido.`,
      buttonText: { displayText: `Avisar al grupo ${g.code}` },
      type: 1
    });
  });

  texto += `\n🤖 *Total de grupos:* ${grupos.length}`;
  texto += `\n\nPuedes presionar un botón para enviar un aviso básico.`;

  return conn.sendMessage(chatId, {
    text: texto.trim(),
    buttons: botones,
    headerType: 1
  }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'gruposbot'];
module.exports = handler;