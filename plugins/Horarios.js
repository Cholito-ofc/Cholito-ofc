const moment = require('moment-timezone');
require('moment/locale/es'); // Español

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.sender || msg.key.participant || msg.key.remoteJid;

  moment.locale('es'); // Activar español

  const zonas = {
    '🌎 América del Norte': [
      { bandera: '🇲🇽', nombre: 'México', zona: 'America/Mexico_City' },
      { bandera: '🇺🇸', nombre: 'USA (NY)', zona: 'America/New_York' },
      { bandera: '🇨🇺', nombre: 'Cuba', zona: 'America/Havana' },
      { bandera: '🇩🇴', nombre: 'Rep. Dominicana', zona: 'America/Santo_Domingo' }
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
      { bandera: '🇧🇷', nombre: 'Brasil', zona: 'America/Sao_Paulo' },
      { bandera: '🇧🇴', nombre: 'Bolivia', zona: 'America/La_Paz' },
      { bandera: '🇺🇾', nombre: 'Uruguay', zona: 'America/Montevideo' },
      { bandera: '🇵🇾', nombre: 'Paraguay', zona: 'America/Asuncion' },
      { bandera: '🇪🇨', nombre: 'Ecuador', zona: 'America/Guayaquil' }
    ],
    '🌍 Europa': [
      { bandera: '🇪🇸', nombre: 'España', zona: 'Europe/Madrid' },
      { bandera: '🇬🇧', nombre: 'Reino Unido', zona: 'Europe/London' },
      { bandera: '🇷🇺', nombre: 'Rusia', zona: 'Europe/Moscow' },
      { bandera: '🇫🇷', nombre: 'Francia', zona: 'Europe/Paris' },
      { bandera: '🇮🇹', nombre: 'Italia', zona: 'Europe/Rome' },
      { bandera: '🇩🇪', nombre: 'Alemania', zona: 'Europe/Berlin' },
      { bandera: '🇳🇱', nombre: 'Países Bajos', zona: 'Europe/Amsterdam' },
      { bandera: '🇵🇹', nombre: 'Portugal', zona: 'Europe/Lisbon' }
    ],
    '🌍 África': [
      { bandera: '🇿🇦', nombre: 'Sudáfrica', zona: 'Africa/Johannesburg' },
      { bandera: '🇪🇬', nombre: 'Egipto', zona: 'Africa/Cairo' },
      { bandera: '🇳🇬', nombre: 'Nigeria', zona: 'Africa/Lagos' },
      { bandera: '🇰🇪', nombre: 'Kenia', zona: 'Africa/Nairobi' },
      { bandera: '🇲🇦', nombre: 'Marruecos', zona: 'Africa/Casablanca' }
    ],
    '🌏 Asia': [
      { bandera: '🇮🇳', nombre: 'India', zona: 'Asia/Kolkata' },
      { bandera: '🇯🇵', nombre: 'Japón', zona: 'Asia/Tokyo' },
      { bandera: '🇰🇷', nombre: 'Corea del Sur', zona: 'Asia/Seoul' },
      { bandera: '🇹🇭', nombre: 'Tailandia', zona: 'Asia/Bangkok' },
      { bandera: '🇮🇩', nombre: 'Indonesia', zona: 'Asia/Jakarta' },
      { bandera: '🇨🇳', nombre: 'China', zona: 'Asia/Shanghai' },
      { bandera: '🇸🇬', nombre: 'Singapur', zona: 'Asia/Singapore' },
      { bandera: '🇵🇭', nombre: 'Filipinas', zona: 'Asia/Manila' }
    ],
    '🌊 Oceanía': [
      { bandera: '🇦🇺', nombre: 'Australia', zona: 'Australia/Sydney' },
      { bandera: '🇳🇿', nombre: 'Nueva Zelanda', zona: 'Pacific/Auckland' },
      { bandera: '🇫🇯', nombre: 'Fiyi', zona: 'Pacific/Fiji' },
      { bandera: '🇵🇬', nombre: 'Papúa N. G.', zona: 'Pacific/Port_Moresby' }
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
      const linea = `${lugar.bandera} ${lugar.nombre.padEnd(15)} ${hora}`;
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