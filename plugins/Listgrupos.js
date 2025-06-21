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

  if (grupos.length > 900) {
    return conn.sendMessage(chatId, { text: '❌ Demasiados grupos (>900) para asignar códigos únicos de 3 dígitos.' }, { quoted: msg });
  }

  grupos.forEach((g, idx) => {
    const num = 100 + idx;
    g.code = String(num);
  });

  global.gruposAdmin = grupos;

  let texto = '✨ *Grupos donde está el bot (código único 3 dígitos)*\n\n';
  grupos.forEach((g) => {
    texto += `🔹 *${g.name}*\n`;
    texto += `• Código: *${g.code}*\n`;
    texto += `• Miembros: ${g.count}\n`;
    texto += `• JID: ${g.id}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  });
  texto += `\n🤖 *Total de grupos:* ${grupos.length}`;
  texto += `\n\nUsa: .aviso <código> <mensaje>\nEjemplo: .aviso ${grupos[0].code} Este es un aviso importante.`;

  return conn.sendMessage(chatId, { text: texto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'gruposbot'];
module.exports = handler;