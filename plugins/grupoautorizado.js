const fs = require('fs');
const path = require('path');

module.exports = async function handler(msg, conn) {
  const m = msg;
  const isGroup = m.key.remoteJid.endsWith('@g.us');
  if (!isGroup) return;

  try {
    const grupoPath = path.resolve('./grupo.json');
    const prefixPath = path.resolve('./prefixes.json');

    const rawID = conn.user?.id || '';
    const subbotID = rawID.split(':')[0] + '@s.whatsapp.net';

    // Obtener el texto completo del mensaje
    const messageText =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      '';

    // Leer el prefijo personalizado
    let dataPrefijos = {};
    if (fs.existsSync(prefixPath)) {
      dataPrefijos = JSON.parse(fs.readFileSync(prefixPath, 'utf-8'));
    }

    const customPrefix = dataPrefijos[subbotID];
    const allowedPrefixes = customPrefix ? [customPrefix] : ['.', '#'];
    const usedPrefix = allowedPrefixes.find(p => messageText.startsWith(p));
    if (!usedPrefix) return;

    const body = messageText.slice(usedPrefix.length).trim();
    const command = body.split(' ')[0].toLowerCase();

    const allowedCommands = ['addgrupo'];

    let dataGrupos = {};
    if (fs.existsSync(grupoPath)) {
      dataGrupos = JSON.parse(fs.readFileSync(grupoPath, 'utf-8'));
    }

    const gruposPermitidos = Array.isArray(dataGrupos[subbotID]) ? dataGrupos[subbotID] : [];

    if (!gruposPermitidos.includes(m.key.remoteJid) && !allowedCommands.includes(command)) {
      return !0; // ⚠️ Previene la ejecución de otros plugins
    }

  } catch (err) {
    console.error('❌ Error en plugin de grupo autorizado:', err);
    return;
  }
};