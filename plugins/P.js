const os = require("os");

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const start = performance.now();

  await conn.sendMessage(chatId, {
    react: { text: '📡', key: msg.key }
  });

  const temp = await conn.sendMessage(chatId, { text: '⏳ Consultando estado del bot...' }, { quoted: msg });

  const latency = (performance.now() - start).toFixed(2);
  const memoryUsage = process.memoryUsage();
  const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const usedMemMB = (memoryUsage.rss / 1024 / 1024).toFixed(0);
  const uptime = formatUptime(process.uptime());
  const cpuModel = os.cpus()[0].model;

  const info = `
╭━━━〔 *𝙴𝚂𝚃𝙰𝙳𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃* 〕━━⬣
┃
┃ 🏓 *Velocidad:* ${latency} ms
┃ 📦 *RAM usada:* ${usedMemMB} MB / ${totalMemGB} GB
┃ ⏱️ *Uptime:* ${uptime}
┃ 🧠 *CPU:* ${cpuModel.split('@')[0].trim()}
┃
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

  await conn.sendMessage(chatId, {
    edit: temp.key,
    text: info
  });
};

handler.command = ['p', 'uptime'];
module.exports = handler;