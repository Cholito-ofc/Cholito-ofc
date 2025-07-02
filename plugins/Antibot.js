const fs = require('fs');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '../antibot-config.json');
const WARNINGS_PATH = path.join(__dirname, '../antibot-warnings.json');

let settings = fs.existsSync(SETTINGS_PATH) ? JSON.parse(fs.readFileSync(SETTINGS_PATH)) : {};
let warnings = fs.existsSync(WARNINGS_PATH) ? JSON.parse(fs.readFileSync(WARNINGS_PATH)) : {};

function guardarDatos() {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  fs.writeFileSync(WARNINGS_PATH, JSON.stringify(warnings, null, 2));
}

module.exports = {
  name: 'antibot',
  description: 'Activa o desactiva el sistema antibot en grupos',
  group: true,
  async before(msg, { conn, isBotAdmin }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (!settings[chatId]) return;

    const botsPermitidos = [conn.user.jid];
    if (sender === conn.user.jid || botsPermitidos.includes(sender)) return;

    const sospechosoDeBot = texto.includes('.') || texto.includes('/') || texto.length > 100 || texto.toLowerCase().includes('comando');
    if (!sospechosoDeBot) return;

    warnings[chatId] = warnings[chatId] || {};
    warnings[chatId][sender] = warnings[chatId][sender] || 0;
    warnings[chatId][sender]++;
    guardarDatos();

    const advertencias = warnings[chatId][sender];

    if (advertencias === 1) {
      await conn.sendMessage(chatId, {
        text: `⚠️ @${senderNum}, estás enviando mensajes automáticos.\nEste grupo tiene activado el *modo anti-bot*. Si sigues, serás eliminado.`,
        mentions: [sender]
      });
    } else if (advertencias >= 2) {
      if (!isBotAdmin) return;
      await conn.groupParticipantsUpdate(chatId, [sender], 'remove');
      await conn.sendMessage(chatId, {
        text: `🤖 @${senderNum} fue *expulsado automáticamente* por actividad automática.\nMotivo: *Anti-Bot Activado*`,
        mentions: [sender]
      });
      delete warnings[chatId][sender];
      guardarDatos();
    }
  },

  run: async (msg, { conn, args }) => {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNum = sender.split('@')[0];

    const groupMetadata = await conn.groupMetadata(chatId);
    const admins = groupMetadata.participants.filter(p => p.admin);
    const isAdmin = admins.some(a => a.id === sender);

    if (!msg.isGroup) {
      return conn.sendMessage(chatId, { text: '❗Este comando solo funciona en grupos.' });
    }

    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: '🚫 Solo un *administrador* puede usar este comando.' });
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
        text: '📌 Usa el comando:\n.antibot on — Activar\n.antibot off — Desactivar'
      });
    }
  }
};