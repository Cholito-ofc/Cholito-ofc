const { Maker } = require('imagemaker.js');
const fs = require('fs');

const WAIT_MSG = '🔄 ᴇʟᴀʙᴏʀᴀɴᴅᴏ ʟᴏɢᴏ…';
const ERROR_MSG = '❌ ᴇʀʀᴏʀ, ᴘᴏʀ ғᴀᴠᴏʀ ʀᴇɪɴᴛᴇɴᴛᴀʀʟᴏ';
const BLOCKED_FILE = './bloqueados.json';

const effects = {
  corazon:       'https://en.ephoto360.com/text-heart-flashlight-188.html',
  christmas:     'https://en.ephoto360.com/christmas-effect-by-name-376.html',
  pareja:        'https://en.ephoto360.com/sunlight-shadow-text-204.html',
  glitch:        'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  sad:           'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
  gaming:        'https://en.ephoto360.com/make-team-logo-online-free-432.html',
  solitario:     'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
  dragonball:    'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
  neon:          'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
  gatito:        'https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html',
  chicagamer:    'https://en.ephoto360.com/create-cute-girl-gamer-mascot-logo-online-687.html',
  naruto:        'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html',
  futurista:     'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html',
  nube:          'https://en.ephoto360.com/cloud-text-effect-139.html',
  angel:         'https://en.ephoto360.com/angel-wing-effect-329.html',
  cielo:         'https://en.ephoto360.com/create-a-cloud-text-effect-in-the-sky-618.html',
  graffiti3d:    'https://en.ephoto360.com/text-graffiti-3d-208.html',
  matrix:        'https://en.ephoto360.com/matrix-text-effect-154.html',
  horror:        'https://en.ephoto360.com/blood-writing-text-online-77.html',
  alas:          'https://en.ephoto360.com/the-effect-of-galaxy-angel-wings-289.html',
  army:          'https://en.ephoto360.com/free-gaming-logo-maker-for-fps-game-team-546.html',
  pubg:          'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html',
  pubgfem:       'https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html',
  lol:           'https://en.ephoto360.com/make-your-own-league-of-legends-wallpaper-full-hd-442.html',
  amongus:       'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
  videopubg:     'https://en.ephoto360.com/lightning-pubg-video-logo-maker-online-615.html',
  videotiger:    'https://en.ephoto360.com/create-digital-tiger-logo-video-effect-723.html',
  videointro:    'https://en.ephoto360.com/free-logo-intro-video-maker-online-558.html',
  videogaming:   'https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html',
  guerrero:      'https://en.ephoto360.com/create-project-yasuo-logo-384.html',
  portadaplayer: 'https://en.ephoto360.com/create-the-cover-game-playerunknown-s-battlegrounds-401.html',
  portadaff:     'https://en.ephoto360.com/create-free-fire-facebook-cover-online-567.html',
  portadapubg:   'https://en.ephoto360.com/create-facebook-game-pubg-cover-photo-407.html',
  portadacounter:'https://en.ephoto360.com/create-youtube-banner-game-cs-go-online-403.html',
};

function cargarBloqueados() {
  try {
    if (fs.existsSync(BLOCKED_FILE)) {
      return JSON.parse(fs.readFileSync(BLOCKED_FILE, 'utf-8'));
    }
    fs.writeFileSync(BLOCKED_FILE, JSON.stringify([], null, 2));
    return [];
  } catch (e) {
    console.error('❌ Error al leer bloqueados.json:', e.message);
    return [];
  }
}

const handler = async (msg, { conn, args, command }) => {
  const bloqueados = cargarBloqueados();
  if (bloqueados.includes(msg.sender)) return;

  if (!args.length) {
    return conn.sendMessage(msg.chat, { text: '✏️ ɪɴɢʀᴇsᴀ ᴜɴ ᴛᴇxᴛᴏ' }, { quoted: msg });
  }

  const text = args.join(' ').split('|')[0].trim();
  const url = effects[command];
  if (!url) return;

  try {
    await conn.sendMessage(msg.chat, { text: WAIT_MSG }, { quoted: msg });
    const res = await new Maker().Ephoto360(url, [text]);
    await conn.sendMessage(msg.chat, {
      image: { url: res.imageUrl },
      caption: `✅ ʟᴏɢᴏ ᴄʀᴇᴀᴅᴏ: *${text}*`
    }, { quoted: msg });
  } catch (e) {
    await conn.sendMessage(msg.chat, { text: ERROR_MSG }, { quoted: msg });
  }
};

handler.command = new RegExp(`^(${Object.keys(effects).join('|')})$`, 'i');
handler.tags = ['logos'];
handler.help = Object.keys(effects);

module.exports = handler;