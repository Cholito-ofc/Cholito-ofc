const fs = require('fs');
const path = './activos.json';

module.exports = {
  name: ['enable', 'disable'],
  alias: [],
  tags: ['owner', 'group'],
  command: ['enable', 'disable'],
  group: true,
  admin: true,
  botAdmin: false,

  run: async (msg, { conn, args, command }) => {
    try {
      const chatId = msg.key.remoteJid;
      const isEnable = command === 'enable';
      const data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};

      // Mostrar todas las opciones si no hay argumento
      if (!args[0]) {
        let texto = '⚙️ *CONFIGURACIÓN DEL GRUPO*\n\n';
        const claves = Object.keys(data);

        if (claves.length === 0) {
          texto += '❌ No hay funciones configuradas aún.';
        } else {
          for (const key of claves) {
            const estado = data[key]?.[chatId] ? '✅ ACTIVADO' : '❌ DESACTIVADO';
            texto += `🔧 ${capitalizar(key)}: ${estado}\n`;
          }
        }

        texto += `\n📌 Usa *.enable función* o *.disable función*`;
        return await conn.sendMessage(chatId, { text: texto }, { quoted: msg });
      }

      const funcion = args[0].toLowerCase();

      if (!data[funcion]) data[funcion] = {};

      if (isEnable) {
        data[funcion][chatId] = true;
      } else {
        data[funcion][chatId] = false;
      }

      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      const estadoFinal = isEnable ? '✅ ACTIVADO' : '❌ DESACTIVADO';

      await conn.sendMessage(chatId, {
        text: `🔧 *${capitalizar(funcion)}* ha sido ${estadoFinal} correctamente.`,
      }, { quoted: msg });

    } catch (e) {
      console.error('Error en enable/disable:', e);
      await conn.sendMessage(msg.key.remoteJid, {
        text: '❌ Ocurrió un error ejecutando el comando.',
      }, { quoted: msg });
    }
  }
};

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}