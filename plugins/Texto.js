const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const flagMap = [ /* ... igual que antes ... */ ];
const colores = { /* ... igual que antes ... */ };

function numberWithFlag(num) {
  const clean = num.replace(/[^0-9]/g, '');
  for (const [code, flag] of flagMap) {
    if (clean.startsWith(code)) return `${num} ${flag}`;
  }
  return num;
}

const quotedPush = q => (q?.pushName || q?.sender?.pushName || '');

async function niceName(jid, conn, chatId, qPush, fallback = '') {
  // igual que tu versión actual
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMsg = context?.quotedMessage;

  let targetJid = msg.key.participant || msg.key.remoteJid;
  let fallbackPN = msg.pushName || '';
  let quotedName = '';
  let quotedText = '';

  if (quotedMsg && context?.participant) {
    targetJid = context.participant;
    quotedText = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
    quotedName = quotedPush(quotedMsg);
    fallbackPN = '';
  }

  const contentFull = (args.join(' ').trim() || '').trim();
  const firstWord = contentFull.split(' ')[0].toLowerCase();
  const gradColors = colores[firstWord] || colores['azul'];

  let content = '';
  if (colores[firstWord]) {
    content = contentFull.split(' ').slice(1).join(' ').trim() || quotedText || '';
  } else {
    content = contentFull || quotedText || '';
  }

  if (!content || content.length === 0) {
    return conn.sendMessage(chatId, {
      text: `✏️ Usa el comando así:\n\n*.texto [color opcional] tu mensaje*\n\nEjemplos:\n- .texto azul Hola grupo\n- .texto Buenos días a todos\n\nColores disponibles:\nazul, rojo, verde, rosa, morado, negro, naranja, gris, celeste`
    }, { quoted: msg });
  }

  const displayName = await niceName(targetJid, conn, chatId, quotedName, fallbackPN);
  let avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
  try { avatarUrl = await conn.profilePictureUrl(targetJid, 'image'); } catch {}

  await conn.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });

  const canvas = createCanvas(1080, 1080);
  const draw = canvas.getContext('2d');

  // Fondo degradado
  const grad = draw.createLinearGradient(0, 0, 0, 1080);
  grad.addColorStop(0, gradColors[0]);
  grad.addColorStop(1, gradColors[1]);
  draw.fillStyle = grad;
  draw.fillRect(0, 0, 1080, 1080);

  // Avatar circular con sombra y borde
  const avatar = await loadImage(avatarUrl);
  const avatarX = 80, avatarY = 80, avatarSize = 180;
  draw.save();
  draw.beginPath();
  draw.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  draw.shadowColor = "rgba(0,0,0,0.3)";
  draw.shadowBlur = 10;
  draw.fillStyle = "#fff";
  draw.fill();
  draw.clip();
  draw.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  draw.restore();

  // Nombre del usuario
  draw.font = 'bold 42px Sans-serif';
  draw.fillStyle = '#ffffff';
  draw.shadowColor = 'black';
  draw.shadowBlur = 3;
  draw.fillText(displayName, avatarX + avatarSize + 40, avatarY + 110);

  // Texto del mensaje
  draw.shadowBlur = 0;
  draw.font = 'bold 60px Sans-serif';
  draw.fillStyle = '#ffffff';
  draw.textAlign = 'center';

  const maxWidth = 900;
  const words = content.split(' ');
  let line = '', lines = [];
  for (const word of words) {
    const testLine = line + word + ' ';
    if (draw.measureText(testLine).width > maxWidth) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const startY = 600 - (lines.length * 40);
  lines.forEach((l, i) => {
    draw.fillText(l, 540, startY + (i * 80));
  });

  // Logo KilluaBot
  const logo = await loadImage('https://cdn.russellxz.click/a806b10a.png');
  draw.drawImage(logo, 900, 900, 140, 140);

  // Exportar
  const fileName = `./tmp/texto-${Date.now()}.png`;
  const out = fs.createWriteStream(fileName);
  const stream = canvas.createPNGStream();
  stream.pipe(out);

  out.on('finish', async () => {
    await conn.sendMessage(chatId, {
      image: { url: fileName },
      caption: `🖼 Generado por KilluaBot ⚡`
    }, { quoted: msg });
    fs.unlinkSync(fileName);
  });
};

handler.command = ['texto'];
module.exports = handler;