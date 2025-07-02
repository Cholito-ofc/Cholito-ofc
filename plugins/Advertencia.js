const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'advertencia',
  alias: ['warn'],
  category: 'grupo',
  desc: 'Da advertencias a un usuario.',
  admin: true,
  group: true,
  async run(msg, { conn }) {
    const chatId = msg.key.remoteJid;

    if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo) {
      return conn.sendMessage(chatId, { text: '❌ Responde al mensaje del usuario que deseas advertir.' }, { quoted: msg });
    }

    const target = msg.message.extendedTextMessage.contextInfo.participant;
    const warnsFile = path.join(__dirname, '../database/warns.json');

    let warns = fs.existsSync(warnsFile) ? JSON.parse(fs.readFileSync(warnsFile)) : {};
    if (!warns[chatId]) warns[chatId] = {};
    if (!warns[chatId][target]) warns[chatId][target] = 0;

    warns[chatId][target] += 1;
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));

    const total = warns[chatId][target];

    await conn.sendMessage(chatId, {
      text: `🚫 *Advertencia aplicada.*\n\n│ 👤 Usuario: @${target.split("@")[0]}\n│ 📌 Advertencias: ${total}/3`,
      mentions: [target]
    }, { quoted: msg });
  }
};