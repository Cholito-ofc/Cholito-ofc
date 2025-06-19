let handler = async (msg, { conn, args }) => {
  const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
  if (!body.toLowerCase().startsWith('.cm salir')) return;

  const userKey = (msg.key.participant || msg.key.remoteJid);
  const groupList = global.cmGroupCache[userKey];

  if (!groupList || !groupList.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'Primero usa el comando .cmd para ver la lista de grupos.', quoted: msg });
  }

  // Extrae el número del grupo del comando
  const num = parseInt(body.replace(/[^0-9]/g, ''), 10);

  if (!num || num < 1 || num > groupList.length) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'Número de grupo inválido. Usa el comando .cmd para ver la lista.', quoted: msg });
  }

  const grupo = groupList[num - 1];
  if (!grupo) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No se encontró el grupo.', quoted: msg });
  }

  // Mensaje de aviso
  await conn.sendMessage(grupo.id, { text: 'El admin solicita abandonar este grupo.' });
  return conn.sendMessage(msg.key.remoteJid, { text: `Aviso enviado al grupo: ${grupo.name}`, quoted: msg });
};

handler.command = ['cm'];
module.exports = handler;