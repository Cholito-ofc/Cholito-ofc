const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  let fetched;
  try {
    fetched = await conn.groupFetchAllParticipating();
  } catch (e) {
    console.error('Error en groupFetchAllParticipating:', e);
    return conn.sendMessage(chatId, { text: '❌ Error al obtener grupos.' }, { quoted: msg });
  }

  const entries = Object.entries(fetched || {});
  const myIds = [
    conn.user.id,
    conn.user.id.split(':')[0] + '@s.whatsapp.net'
  ];

  const grupos = [];

  for (const [jid, meta] of entries) {
    if (!meta || !meta.subject) continue;
    if (!jid.endsWith('@g.us')) continue;

    let metaFull;
    try {
      metaFull = await conn.groupMetadata(jid); // Aquí garantizas tener la lista de participantes SIEMPRE
    } catch (e) {
      // Si falla obtener metadata, pasa al siguiente grupo
      continue;
    }

    const soyAdmin = metaFull.participants.some(
      p => myIds.includes(p.id) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (!soyAdmin) continue;

    grupos.push({
      name: metaFull.subject,
      id: jid
    });
  }

  if (grupos.length === 0) {
    global.gruposAdmin = [];
    return conn.sendMessage(chatId, { text: '🚫 No soy admin en ningún grupo.' }, { quoted: msg });
  }

  global.gruposAdmin = grupos;

  let texto = '✨ *Grupos donde el bot es admin*\n\n';
  grupos.forEach((g, i) => {
    texto += `*${i + 1}.* ${g.name}\n`;
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