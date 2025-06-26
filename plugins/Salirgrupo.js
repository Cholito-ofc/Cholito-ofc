// salirgrupo.js

const handler = async (m, { conn, text, sender }) => {
  const ownerPrincipal = global.owner[0][0] + '@s.whatsapp.net';
  if (sender !== ownerPrincipal) {
    return m.reply('🚫 Solo el *owner principal* puede usar este comando.');
  }

  const grupos = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.subject)
    .map(([jid, chat]) => ({ id: jid, name: chat.subject }));

  // Si no se pasa número → mostrar lista de grupos
  if (!text) {
    if (grupos.length === 0) return m.reply('⚠️ No hay grupos activos.');
    const lista = grupos.map((g, i) => `*${i + 1}.* ${g.name}`).join('\n');
    return m.reply(`📋 *Lista de grupos donde está el bot:*\n\n${lista}`);
  }

  // Si se pasa número → salir del grupo correspondiente
  const numero = parseInt(text);
  if (isNaN(numero) || numero < 1 || numero > grupos.length) {
    return m.reply(`⚠️ Número inválido. Usa un número entre 1 y ${grupos.length}.`);
  }

  const grupo = grupos[numero - 1];

  await conn.sendMessage(grupo.id, {
    text: '👋 El bot ha sido removido por el owner principal.',
  });

  await conn.groupLeave(grupo.id);
  await m.reply(`✅ El bot salió del grupo *${grupo.name}*.`);
};

handler.help = ['salirgrupo [número]'];
handler.tags = ['owner'];
handler.command = /^salirgrupo$/i;
handler.owner = true;

export default handler;