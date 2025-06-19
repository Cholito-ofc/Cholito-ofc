let handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // Solo responde al comando .cmd (puedes cambiarlo según tu prefijo)
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  if (!body.trim().startsWith('.cmd')) return;

  // Obtener todos los chats tipo grupo donde está el bot
  const allGroups = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us'));

  let resultado = [];
  for (const [jid, chat] of allGroups) {
    try {
      // Obtener metadata de cada grupo
      let meta = await conn.groupMetadata(jid);
      // Buscar si el usuario actual es admin en ese grupo
      let esAdmin = meta.participants.find(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      if (esAdmin) {
        resultado.push(`${resultado.length + 1}: ${meta.subject}\nID: ${jid}`);
      }
    } catch (e) {
      // Puede fallar si el bot fue eliminado de un grupo o no tiene permisos
      continue;
    }
  }

  if (resultado.length === 0) {
    return conn.sendMessage(msg.key.remoteJid, { text: 'No eres administrador en ningún grupo donde esté el bot.' }, { quoted: msg });
  }

  const respuesta = resultado.join('\n\n');
  return conn.sendMessage(msg.key.remoteJid, { text: respuesta }, { quoted: msg });
};

handler.command = ['cmd'];
module.exports = handler;