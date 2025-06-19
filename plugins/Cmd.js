let handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // Lee el texto del mensaje para detectar el comando .cmd
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cmd')) return;

  // Obtener todos los grupos donde está el bot
  let groups = [];
  try {
    groups = Object.values(await conn.groupFetchAllParticipating());
  } catch (e) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener la lista de grupos.' }, { quoted: msg });
  }

  let resultado = [];
  for (let group of groups) {
    // Buscar si el usuario que ejecuta el comando es admin
    let isAdmin = (group.participants || []).find(p =>
      (p.id === sender) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (isAdmin) {
      resultado.push(`${resultado.length + 1}: ${group.subject}\nID: ${group.id}`);
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