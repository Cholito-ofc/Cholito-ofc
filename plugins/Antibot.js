const fs = require('fs');

// ⚙️ Base de datos en memoria
let db = {
  warnings: {}, // advertencias por grupo
  settings: {}  // estado ON/OFF por grupo
};

module.exports = {
  name: 'antibot',
  tags: ['group', 'security'],
  description: 'Activa o desactiva el sistema antibot, y expulsa bots si envían mensajes automáticos.',
  group: true,
  async before(msg, { conn, isAdmin, isBotAdmin }) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    // Si antibot está desactivado, no hacer nada
    if (!db.settings[chatId]) return;

    // Ignorar si el mensaje es del propio bot o de bots permitidos
    const botsPermitidos = [conn.user.jid];
    if (sender === conn.user.jid || botsPermitidos.includes(sender)) return;

    // Detectar si parece mensaje automático
    const sospechosoDeBot = texto.includes('Comando') || texto.includes('.') || texto.includes('/') || texto.includes('usaste') || texto.length > 100;
    if (!sospechosoDeBot) return;

    // Inicializar advertencias
    db.warnings[chatId] = db.warnings[chatId] || {};
    db.warnings[chatId][sender] = db.warnings[chatId][sender] || 0;
    db.warnings[chatId][sender]++;

    const advertencias = db.warnings[chatId][sender];

    if (advertencias === 1) {
      await conn.sendMessage(chatId, {
        text: `⚠️ @${senderNum}, este grupo tiene *modo anti-bot* activado.\nEstás enviando mensajes automáticos. Si continúas, serás expulsado.`,
        mentions: [sender]
      });
    } else if (advertencias >= 2) {
      if (!isBotAdmin) return;
      await conn.groupParticipantsUpdate(chatId, [sender], 'remove');
      await conn.sendMessage(chatId, {
        text: `🤖 @${senderNum} fue *expulsado automáticamente* por actividad automática (Anti-Bot).`,
        mentions: [sender]
      });
      delete db.warnings[chatId][sender]; // Reiniciar advertencias
    }
  },

  async run(msg, { conn, args, isAdmin }) {
    const chatId = msg.key.remoteJid;

    if (!msg.isGroup) {
      return conn.sendMessage(chatId, { text: '❗Este comando solo funciona en grupos.' });
    }

    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: '🚫 Solo los administradores pueden activar o desactivar el antibot.' });
    }

    const accion = args[0]?.toLowerCase();
    if (accion === 'on') {
      db.settings[chatId] = true;
      conn.sendMessage(chatId, { text: '✅ El *sistema antibot* ha sido activado en este grupo.' });
    } else if (accion === 'off') {
      db.settings[chatId] = false;
      conn.sendMessage(chatId, { text: '❌ El *sistema antibot* ha sido desactivado en este grupo.' });
    } else {
      conn.sendMessage(chatId, { text: '📌 Usa el comando así:\n*.antibot on* — Activar\n*.antibot off* — Desactivar' });
    }
  }
};