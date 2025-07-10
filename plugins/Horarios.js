const moment = require('moment-timezone');
require('moment/locale/es'); // Para español

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.sender || msg.key.participant || msg.key.remoteJid;

  moment.locale('es'); // Establecer español

  const zonas = {
    '🌎 América del Norte': [
      { bandera: '🇲🇽', nombre: 'México', zona: 'America/Mexico_City' },
      { bandera: '🇺🇸', nombre: 'USA (NY)', zona: 'America/New_York' }
    ],
    '🌎 Centroamérica': [
      { bandera: '🇭🇳', nombre: 'Honduras', zona: 'America/Tegucigalpa' },
      { bandera: '🇬🇹', nombre: 'Guatemala', zona: 'America/Guatemala' },
      { bandera: '🇸🇻', nombre: 'El Salvador', zona: 'America/El_Salvador' },
      { bandera: '🇳🇮', nombre: 'Nicaragua', zona: 'America/Managua' },
      { bandera: '🇨🇷', nombre: 'Costa Rica', zona: 'America/Costa_Rica' },
      { bandera: '🇵🇦', nombre: 'Panamá', zona: 'America/Panama' }
    ],
    '🌎 Sudamérica': [
      { bandera: '🇨🇴', nombre: 'Colombia', zona: 'America/Bogota' },
      { bandera: '🇵🇪', nombre: 'Perú', zona: 'America/Lima' },
      { bandera: '🇻🇪', nombre: 'Venezuela', zona: 'America/Caracas' },
      { bandera: '🇨🇱', nombre: 'Chile', zona: 'America/Santiago' },
      { bandera: '🇦🇷', nombre: 'Argentina', zona: 'America/Argentina/Buenos_Aires' },
      { bandera: '🇧🇷', nombre: 'Brasil', zona: 'America/Sao_Paulo' }
    ],
    '🌍 Europa': [
      { bandera: '🇪🇸', nombre: 'España', zona: 'Europe/Madrid' },
      { bandera: '🇬🇧', nombre: 'Reino Unido', zona: 'Europe/London' },
      { bandera: '🇷🇺', nombre: 'Rusia', zona: 'Europe/Moscow' }
    ],
    '🌏 Asia': [
      { bandera: '🇮🇳', nombre: 'India', zona: 'Asia/Kolkata' },
      { bandera: '🇯🇵', nombre: 'Japón', zona: 'Asia/Tokyo' },
      { bandera: '🇰🇷', nombre: 'Corea del Sur', zona: 'Asia/Seoul' }
    ]
  };

  const fecha = moment().format('dddd, D [de] MMMM [de] YYYY');

  let texto = '┏━━❖ 🌐 *HORARIO MUNDIAL* ❖━━┓\n';
  texto += `\`\`\`📆 ${fecha.charAt(0).toUpperCase() + fecha.slice(1)}\`\`\`\n`;
  texto += '┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  for (const [region, paises] of Object.entries(zonas)) {
    texto += `📍 *${region}*\n`;
    for (let lugar of paises) {
      const hora = moment().tz(lugar.zona).format('hh:mm A');
      const linea = `${lugar.bandera} ${lugar.nombre.padEnd(13)} ${hora}`;
      texto += `\`\`\`${linea}\`\`\`\n`;
    }
    texto += '\n';
  }

  texto += '✨ Generado por: *KilluaBot*';

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
    text: texto.trim()
  }, { quoted: fkontak });
};

handler.command = ['horario', 'hora', 'horainternacional'];
module.exports = handler;