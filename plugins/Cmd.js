global.cmGroupCache = global.cmGroupCache || {};

let handler = async (msg, { conn, args }) => {
  // Lee el comando y posible número de página
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cmd')) return;

  // Página solicitada (por default, página 1)
  const page = parseInt(args[0], 10) || 1;
  const PAGE_SIZE = 10;

  let groups = [];
  try {
    groups = Object.values(await conn.groupFetchAllParticipating());
  } catch (e) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener la lista de grupos.' }, { quoted: msg });
  }

  const botNumber = (conn.user?.id || conn.user?.jid || conn.user).split(':')[0].replace(/\D/g, '') + '@s.whatsapp.net';

  let groupList = [];
  for (let group of groups) {
    let botParticipant = (group.participants || []).find(p =>
      (p.id === botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (botParticipant) {
      groupList.push({ id: group.id, name: group.subject });
    }
  }

  if (!groupList.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'El bot no es admin en ningún grupo.' }, { quoted: msg });
  }

  // PAGINACIÓN
  const totalPages = Math.ceil(groupList.length / PAGE_SIZE);
  if (page > totalPages || page < 1) {
    return conn.sendMessage(msg.key.remoteJid, { text: `Página inválida. Solo hay ${totalPages} páginas.`, quoted: msg });
  }

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const groupPage = groupList.slice(start, end);

  // Guarda solo la página ACTUAL en cache (para relación con .cm salir)
  const userKey = (msg.key.participant || msg.key.remoteJid);
  global.cmGroupCache[userKey] = groupPage;

  const resultado = groupPage.map((g, i) => `${start + i + 1}: ${g.name}\nID: ${g.id}`).join('\n\n');

  let texto = `*Grupos donde el bot es admin (Página ${page}/${totalPages})*\n\n${resultado}`;
  if (totalPages > 1) texto += `\n\nEscribe *.cmd <número de página>* para ver más.\n(Ejemplo: *.cmd 2* para la segunda página)`;

  return conn.sendMessage(msg.key.remoteJid, { text: texto }, { quoted: msg });
};

handler.command = ['cmd'];
module.exports = handler;