let handler = async (msg, { conn }) => {
  // Solo responde a .cmd (no importa mayús/minús ni espacios)
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cmd')) return;

  const sender = msg.key.participant || msg.key.remoteJid;

  // Obtener la lista de grupos donde está el bot
  let groups = [];
  try {
    const res = await conn.groupFetchAllParticipating();
    groups = Object.values(res);
  } catch (e) {
    // Si tu versión de Baileys no soporta groupFetchAllParticipating(), usa conn.chats alternativo:
    groups = Object.entries(conn.chats || {})
      .filter(([jid]) => jid.endsWith('@g.us'))
      .map(([jid, chat]) => ({ id: jid, subject: chat?.name || 'Grupo', participants: [] }));
  }

  let resultado = [];
  for (let group of groups) {
    // Si usaste groupFetchAllParticipating(), group ya tiene subject e participants
    // Si no, hay que pedir metadata:
    if (!group.participants || !group.subject) {
      try {
        let meta = await conn.groupMetadata(group.id || group.jid);
        group.subject = meta.subject;
        group.participants = meta.participants;
      } catch { continue; }
    }
    // Verifica si el que ejecutó el comando es admin
    let isAdmin = (group.participants || []).find(p =>
      (p.id === sender) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (isAdmin) {
      resultado.push(`${resultado.length + 1}: ${group.subject}\nID: ${group.id || group.jid}`);
    }
  }

  if (!resultado.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No eres administrador en ningún grupo donde esté el bot.' }, { quoted: msg });
  }

  const respuesta = resultado.join('\n\n');
  return conn.sendMessage(msg.key.remoteJid, { text: respuesta }, { quoted: msg });
};

handler.command = ['cmd'];
module.exports = handler;