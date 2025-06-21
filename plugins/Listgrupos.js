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
  const myIds = [
    conn.user.id,
    conn.user.id.split(':')[0] + '@s.whatsapp.net'
  ];

  for (const [jid, meta] of entries) {
    if (!meta || !meta.subject) continue;
    if (!jid.endsWith('@g.us')) continue;

    // Verifica si el bot es admin en este grupo
    const botParticipant = meta.participants?.find(p =>
      myIds.includes(p.id) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (!botParticipant) continue;

    grupos.push({
      name: meta.subject,
      id: jid
    });
  }

  if (grupos.length === 0) {
    global.gruposAdmin = [];
    return conn.sendMessage(chatId, { text: '🚫 No soy admin en ningún grupo.' }, { quoted: msg });
  }

  global.gruposAdmin = grupos;

  let texto = '✨ *Grupos donde el bot es admin*\n\n';
  grupos.forEach((g, idx) => {
    texto += `*${idx + 1}.* ${g.name}\n`;
    texto += `• JID: ${g.id}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  });
  texto += `\n👑 *Total de grupos como admin:* ${grupos.length}`;
  texto += `\n\n*Usa:* .aviso <número> <mensaje>`;
  texto += `\n*Ejemplo:* .aviso 1 Este es un aviso importante.`;

  return conn.sendMessage(chatId, { text: texto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'gruposbot'];
module.exports = handler;