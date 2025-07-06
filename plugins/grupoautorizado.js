const fs = require('fs');
const path = require('path');

let handler = async function (msg, { conn }) {
  const m = msg;
  const isGroup = m.key.remoteJid.endsWith('@g.us');
  if (!isGroup) return false;

  try {
    const grupoPath = path.resolve('./grupo.json');
    const prefixPath = path.resolve('./prefixes.json');

    const rawID = conn.user?.id || '';
    const subbotID = rawID.split(':')[0] + '@s.whatsapp.net';

    const messageText =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      '';

    let dataPrefijos = {};
    if (fs.existsSync(prefixPath)) {
      dataPrefijos = JSON.parse(fs.readFileSync(prefixPath, 'utf-8'));
    }

    const customPrefix = dataPrefijos[subbotID];
    const allowedPrefixes = customPrefix ? [customPrefix] : ['.', '#'];
    const usedPrefix = allowedPrefixes.find(p => messageText.startsWith(p));
    if (!usedPrefix) return false; // No tiene prefijo válido

    const body = messageText.slice(usedPrefix.length).trim();
    const command = body.split(' ')[0].toLowerCase();

    const allowedCommands = ['addgrupo']; // Solo este se permite sin estar autorizado

    let dataGrupos = {};
    if (fs.existsSync(grupoPath)) {
      dataGrupos = JSON.parse(fs.readFileSync(grupoPath, 'utf-8'));
    }

    const gruposPermitidos = Array.isArray(dataGrupos[subbotID]) ? dataGrupos[subbotID] : [];

    if (!gruposPermitidos.includes(m.key.remoteJid) && !allowedCommands.includes(command)) {
      return true; // Bloquea el comando
    }

    return false; // Todo OK, no bloquear
  } catch (err) {
    console.error('❌ Error en verificación de grupo autorizado:', err);
    return false;
  }
};

handler.before = true;
module.exports = handler;