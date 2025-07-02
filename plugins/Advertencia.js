const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'advertencia',
  alias: ['warn'],
  category: 'grupo',
  desc: 'Da advertencias a un usuario. A la tercera advertencia es expulsado automáticamente.',
  admin: true,
  group: true,
  async run(msg, { conn, args }) {
    const chatId = msg.key.remoteJid;
    const from = msg.key.participant || msg.key.remoteJid;

    // Validar si se respondió a alguien
    if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo) {
      return conn.sendMessage(chatId, { text: '❌ Responde al mensaje del usuario que deseas advertir.' }, { quoted: msg });
    }

    const target = msg.message.extendedTextMessage.contextInfo.participant;

    if (!target || target.endsWith('@g.us')) {
      return conn.sendMessage(chatId, { text: '❌ No puedo advertir a ese usuario.' }, { quoted: msg });
    }

    // Cargar archivo de advertencias
    const warnsFile = path.join(__dirname, '../database/warns.json');
    let warns = fs.existsSync(warnsFile) ? JSON.parse(fs.readFileSync(warnsFile)) : {};

    // Inicializar advertencias si no existen
    if (!warns[chatId]) warns[chatId] = {};
    if (!warns[chatId][target]) warns[chatId][target] = 0;

    // Aumentar advertencia
    warns[chatId][target] += 1;
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));

    const total = warns[chatId][target];

    if (total >= 3) {
      await conn.sendMessage(chatId, {
        text: `⚠️ *Usuario con 3 advertencias.* Será eliminado.\n\n│ 👤 Usuario: @${target.split("@")[0]}`,
        mentions: [target]
      }, { quoted: msg });

      await conn.groupParticipantsUpdate(chatId, [target], 'remove');
      warns[chatId][target] = 0; // Reiniciar contador después de expulsión
      fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
    } else {
      await conn.sendMessage(chatId, {
        text: `🚫 *Advertencia aplicada.*\n\n│ 👤 Usuario: @${target.split("@")[0]}\n│ 📌 Advertencias: ${total}/3`,
        mentions: [target]
      }, { quoted: msg });
    }
  }
};