const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

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

  grupos.forEach((g, idx) => {
    g.code = String(idx + 1);
  });

  global.gruposAdmin = grupos;

  let texto = '🚪 *Grupos en los que estoy (para salir):*\n\n';
  grupos.forEach((g) => {
    texto += `🔢 *${g.code}. ${g.name}*\n`;
    texto += `• JID: ${g.id}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  });
  texto += `\nUsa: *.salirgrupo <número>* para que el bot se retire.`;

  return conn.sendMessage(chatId, { text: texto.trim() }, { quoted: msg });
};

handler.command = ['listarsalir', 'salirgrupos'];
module.exports = handler;