const moment = require('moment-timezone');

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.sender || msg.key.participant || msg.key.remoteJid;

  const zonas = {
    '🌎 América del Norte': [
      { nombre: 'México', zona: 'America/Mexico_City' },
      { nombre: 'USA (NY)', zona: 'America/New_York' }
    ],
    '🌎 Centroamérica': [
      { nombre: 'Honduras', zona: 'America/Tegucigalpa' },
      { nombre: 'Guatemala', zona: 'America/Guatemala' },
      { nombre: 'El Salvador', zona: 'America/El_Salvador' },
      { nombre: 'Nicaragua', zona: 'America/Managua' },
      { nombre: 'Costa Rica', zona: 'America/Costa_Rica' },
      { nombre: 'Panamá', zona: 'America/Panama' }
    ],
    '🌎 Sudamérica': [
      { nombre: 'Colombia', zona: 'America/Bogota' },
      { nombre: 'Perú', zona: 'America/Lima' },
      { nombre: 'Venezuela', zona: 'America/Caracas' },
      { nombre: 'Chile', zona: 'America/Santiago' },
      { nombre: 'Argentina', zona: 'America/Argentina/Buenos_Aires' },
      { nombre: 'Brasil', zona: 'America/Sao_Paulo' }
    ],
    '🌍 Europa': [
      { nombre: 'España', zona: 'Europe/Madrid' },
      { nombre: 'Reino Unido', zona: 'Europe/London' },
      { nombre: 'Rusia', zona: 'Europe/Moscow' }
    ],
    '🌏 Asia': [
      { nombre: 'India', zona: 'Asia/Kolkata' },
      { nombre: 'Japón', zona: 'Asia/Tokyo' },
      { nombre: 'Corea del Sur', zona: 'Asia/Seoul' }
    ]
  };

  let texto = '┏━━❖ 🌐 *HORARIO MUNDIAL* ❖━━┓\n';
  texto += `📆 *Fecha:* ${moment().format('dddd, DD MMMM YYYY')}\n`;
  texto += '┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n';

  for (const [region, paises] of Object.entries(zonas)) {
    texto += `📍 *${region}*\n`;
    for (let lugar of paises) {
      const hora = moment().tz(lugar.zona).format('hh:mm A');
      const linea = `${lugar.nombre.padEnd(15)} ${hora}`;
      texto += `\`\`\`${linea}\`\`\`\n`;
    }
    texto += '\n';
  }

  // ✅ Firma personalizada del bot
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