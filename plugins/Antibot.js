const fs = require('fs');
const path = require('path');

// 🛠 Archivos donde se guardan las configuraciones
const SETTINGS_PATH = path.join(__dirname, '../antibot-config.json');
const WARNINGS_PATH = path.join(__dirname, '../antibot-warnings.json');

// 🧠 Cargar datos persistentes
let settings = fs.existsSync(SETTINGS_PATH) ? JSON.parse(fs.readFileSync(SETTINGS_PATH)) : {};
let warnings = fs.existsSync(WARNINGS_PATH) ? JSON.parse(fs.readFileSync(WARNINGS_PATH)) : {};

// 💾 Guardar cambios
function guardarDatos() {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  fs.writeFileSync(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
}

module.exports = {
  name: 'antibot',
  description: 'Sistema antibot para expulsar bots que mandan comandos',
  group: true,

  // 📌 Revisión automática antes de cada mensaje
  async before(m, { conn, isBotAdmin }) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const texto = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

    if (!settings[chatId]) return; // si no está activado

    const esBotPermitido = [conn.user.jid].includes(sender);
    if (esBotPermitido) return;

    const pareceBot = texto.includes('.') || texto.includes('/') || texto.length > 100 || texto.toLowerCase().includes('comando');
    if (!pareceBot) return;

    warnings[chatId] = warnings[chatId] || {};
    warnings[chatId][sender] = (warnings[chatId][sender] || 0) + 1;
    guardarDatos();

    if (warnings[chatId][sender] === 1) {
      await conn.sendMessage(chatId, {
        text: `⚠️ @${senderNum}, estás enviando mensajes automáticos. Este grupo tiene activado el *modo antibot*. Si lo sigues haciendo serás eliminado.`,
        mentions: [sender]
      });
    } else if (warnings[chatId][sender] >= 2) {
      if (!isBotAdmin) return;
      await conn.groupParticipantsUpdate(chatId, [sender], 'remove');
      await conn.sendMessage(chatId, {
        text: `🤖 @${senderNum} fue *expulsado automáticamente* por actividad de bot (antibot activado).`,
        mentions: [sender]
      });
      delete warnings[chatId][sender];
      guardarDatos();
    }
  },

  // 📦 Comando .antibot on/off
  run: async (m, { conn, args }) => {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;

    const metadata = await conn.groupMetadata(chatId);
    const isAdmin = metadata.participants.find(p => p.id === sender && /admin|superadmin/.test(p.admin));

    if (!m.isGroup) {
      return conn.sendMessage(chatId, { text: '❗Este comando solo funciona en grupos.' });
    }

    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: '🚫 Solo los administradores pueden activar o desactivar el antibot.' });
    }

    const accion = args[0]?.toLowerCase();

    if (accion === 'on') {
      settings[chatId] = true;
      guardarDatos();
      return conn.sendMessage(chatId, { text: '✅ *Antibot activado* correctamente en este grupo.' });
    } else if (accion === 'off') {
      settings[chatId] = false;
      guardarDatos();
      return conn.sendMessage(chatId, { text: '❌ *Antibot desactivado* en este grupo.' });
    } else {
      return conn.sendMessage(chatId, {
        text: '✳️ Usa:\n.antibot on — Activar\n.antibot off — Desactivar'
      });
    }
  }
};