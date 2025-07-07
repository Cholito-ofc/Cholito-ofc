const moment = require('moment-timezone');

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.sender || msg.key.participant || msg.key.remoteJid;

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

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  await conn.sendMessage(chatId, {
    text: texto
  }, { quoted: fkontak });
};

handler.command = ['horario', 'hora', 'horainternacional'];
module.exports = handler;