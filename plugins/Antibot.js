const fs = require('fs');
const path = require('path');

// ⚙️ Rutas a los archivos de configuración
const SETTINGS_PATH = path.join(__dirname, '../antibot-config.json');
const WARNINGS_PATH = path.join(__dirname, '../antibot-warnings.json');

// 📦 Cargar configuración
let settings = fs.existsSync(SETTINGS_PATH) ? JSON.parse(fs.readFileSync(SETTINGS_PATH)) : {};
let warnings = fs.existsSync(WARNINGS_PATH) ? JSON.parse(fs.readFileSync(WARNINGS_PATH)) : {};

// 💾 Guardar cambios
function guardarDatos() {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  fs.writeFileSync(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
}

module.exports = {
  name: 'antibot',
  tags: ['group', 'security'],
  group: true,
  async before(m, { conn, isBotAdmin }) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

    if (!settings[chatId]) return;

    const permitido = [conn.user.jid];
    if (permitido.includes(sender) || sender === conn.user.jid) return;

    const sospechoso = body.includes('.') || body.includes('/') || body.length > 100 || body.toLowerCase().includes('comando');
    if (!sospechoso) return;

    warnings[chatId] = warnings[chatId] || {};
    warnings[chatId][sender] = (warnings[chatId][sender] || 0) + 1;
    guardarDatos();

    if (warnings[chatId][sender] === 1) {
      await conn.sendMessage(chatId, {
        text: `⚠️ @${senderNum}, estás enviando mensajes automáticos.\nEste grupo tiene activado el *modo anti-bot*. Si sigues, serás eliminado.`,
        mentions: [sender]
      });
    } else if (warnings[chatId][sender] >= 2) {
      if (!isBotAdmin) return;
      await conn.groupParticipantsUpdate(chatId, [sender], 'remove');
      await conn.sendMessage(chatId, {
        text: `🤖 @${senderNum} fue *expulsado automáticamente* por actividad automática.`,
        mentions: [sender]
      });
      delete warnings[chatId][sender];
      guardarDatos();
    }
  },

  run: async (m, { conn, args }) => {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    const groupMetadata = await conn.groupMetadata(chatId);
    const isAdmin = groupMetadata.participants
      .filter(p => p.admin)
      .some(p => p.id === sender);

    if (!m.isGroup) {
      return conn.sendMessage(chatId, { text: '❗Este comando solo funciona en grupos.' });
    }

    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: '🚫 Solo los administradores pueden usar este comando.' });
    }

    const accion = args[0]?.toLowerCase();
    if (accion === 'on') {
      settings[chatId] = true;
      guardarDatos();
      return conn.sendMessage(chatId, { text: '✅ *Anti-Bot activado* en este grupo.' });
    } else if (accion === 'off') {
      settings[chatId] = false;
      guardarDatos();
      return conn.sendMessage(chatId, { text: '❌ *Anti-Bot desactivado* en este grupo.' });
    } else {
      return conn.sendMessage(chatId, {
        text: '📌 Usa el comando así:\n.antibot on — Activar\n.antibot off — Desactivar'
      });
    }
  }
};