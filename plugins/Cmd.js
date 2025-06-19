let handler = async (msg, { conn }) => {
  // Detecta el comando .cmd
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cmd')) return;

  let groups = [];
  try {
    groups = Object.values(await conn.groupFetchAllParticipating());
  } catch (e) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener la lista de grupos.' }, { quoted: msg });
  }

  // El ID del bot (puede ser user.id o conn.user.id, depende de tu versión)
  const botNumber = (conn.user?.id || conn.user?.jid || conn.user).split(':')[0].replace(/\D/g, '') + '@s.whatsapp.net';

  let resultado = [];
  for (let group of groups) {
    // Busca si el BOT es admin en ese grupo
    let botParticipant = (group.participants || []).find(p =>
      (p.id === botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (botParticipant) {
      resultado.push(`${resultado.length + 1}: ${group.subject}\nID: ${group.id}`);
    }
  }

  if (!resultado.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'El bot no es admin en ningún grupo.' }, { quoted: msg });
  }

  const respuesta = resultado.join('\n\n');
  return conn.sendMessage(msg.key.remoteJid, { text: respuesta }, { quoted: msg });
};

handler.command = ['cmd'];
module.exports = handler;