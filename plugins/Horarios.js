const moment = require('moment-timezone');

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const zonas = [
    { nombre: '🇲🇽 México', zona: 'America/Mexico_City' },
    { nombre: '🇭🇳 Honduras', zona: 'America/Tegucigalpa' },
    { nombre: '🇬🇹 Guatemala', zona: 'America/Guatemala' },
    { nombre: '🇸🇻 El Salvador', zona: 'America/El_Salvador' },
    { nombre: '🇳🇮 Nicaragua', zona: 'America/Managua' },
    { nombre: '🇨🇷 Costa Rica', zona: 'America/Costa_Rica' },
    { nombre: '🇵🇦 Panamá', zona: 'America/Panama' },
    { nombre: '🇨🇴 Colombia', zona: 'America/Bogota' },
    { nombre: '🇻🇪 Venezuela', zona: 'America/Caracas' },
    { nombre: '🇵🇪 Perú', zona: 'America/Lima' },
    { nombre: '🇨🇱 Chile', zona: 'America/Santiago' },
    { nombre: '🇦🇷 Argentina', zona: 'America/Argentina/Buenos_Aires' },
    { nombre: '🇧🇷 Brasil', zona: 'America/Sao_Paulo' },
    { nombre: '🇺🇸 USA (NY)', zona: 'America/New_York' },
    { nombre: '🇪🇸 España', zona: 'Europe/Madrid' },
    { nombre: '🇯🇵 Japón', zona: 'Asia/Tokyo' },
    { nombre: '🇰🇷 Corea del Sur', zona: 'Asia/Seoul' },
    { nombre: '🇬🇧 Reino Unido', zona: 'Europe/London' },
    { nombre: '🇷🇺 Rusia (Moscú)', zona: 'Europe/Moscow' },
    { nombre: '🇮🇳 India', zona: 'Asia/Kolkata' }
  ];

  let texto = '┏━━━━━━━༺🌐༻━━━━━━━┓\n';
  texto += '          *HORARIO INTERNACIONAL*\n';
  texto += '┗━━━━━━━━━━━━━━━━━━━━┛\n\n';

  for (let lugar of zonas) {
    const hora = moment().tz(lugar.zona).format('hh:mm:ss A');
    texto += `📍 *${lugar.nombre}*\n🕒 Hora: *${hora}*\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫*\n`;
  }

  texto += `\n📆 *Fecha:* ${moment().format('dddd, DD MMMM YYYY')}`;

  await conn.sendMessage(chatId, {
    text: texto
  }, { quoted: msg });
};

handler.command = ['horario', 'hora', 'horainternacional'];
module.exports = handler;