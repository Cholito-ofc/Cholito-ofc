const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

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

    let miembros = 0;
    if (Array.isArray(meta.participants)) {
      miembros = meta.participants.length;
    } else {
      try {
        const gm = await conn.groupMetadata(jid);
        miembros = Array.isArray(gm.participants) ? gm.participants.length : 0;
      } catch {
        miembros = 0;
      }
    }

    grupos.push({
      name: meta.subject,
      id: jid,
      count: miembros
    });
  }

  if (grupos.length === 0) {
    global.gruposAdmin = [];
    return conn.sendMessage(chatId, { text: '🚫 No estoy en ningún grupo.' }, { quoted: msg });
  }

  global.gruposAdmin = grupos;

  let texto = '✨ *Grupos donde está el bot*\n\n';
  grupos.forEach((g, idx) => {
    texto += `*${idx + 1}.* ${g.name}\n`;
    texto += `• Miembros: ${g.count}\n`;
    texto += `• JID: ${g.id}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  });
  texto += `\n🤖 *Total de grupos:* ${grupos.length}`;
  texto += `\n\nUsa: .aviso <número> <mensaje>\nEjemplo: .aviso 1 Este es un aviso importante.`;

  return conn.sendMessage(chatId, { text: texto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'gruposbot'];
module.exports = handler;