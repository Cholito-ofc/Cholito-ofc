// Cmd.js

global.cmGroupCache = global.cmGroupCache || {};

// Aquí tu código para el comando .cmd y .cm salir
let handler = async (msg, { conn }) => {
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cmd')) return;

  let groups = [];
  try {
    groups = Object.values(await conn.groupFetchAllParticipating());
  } catch (e) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No se pudo obtener la lista de grupos.' }, { quoted: msg });
  }

  // Detectar el JID del bot
  const botNumber = (conn.user?.id || conn.user?.jid || conn.user).split(':')[0].replace(/\D/g, '') + '@s.whatsapp.net';

  let resultado = [];
  let groupList = [];
  for (let group of groups) {
    let botParticipant = (group.participants || []).find(p =>
      (p.id === botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    if (botParticipant) {
      resultado.push(`${resultado.length + 1}: ${group.subject}\nID: ${group.id}`);
      groupList.push({ id: group.id, name: group.subject });
    }
  }

  // Guarda la lista para el usuario actual (por participante)
  const userKey = (msg.key.participant || msg.key.remoteJid);
  global.cmGroupCache[userKey] = groupList;

  if (!resultado.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'El bot no es admin en ningún grupo.' }, { quoted: msg });
  }

  const respuesta = resultado.join('\n\n');
  return conn.sendMessage(msg.key.remoteJid, { text: respuesta }, { quoted: msg });
};

handler.command = ['cmd'];
module.exports = handler;