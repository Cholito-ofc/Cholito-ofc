const handler = async (msg, { conn }) => { const chatId = msg.key.remoteJid; const fromUser = msg.key.participant || msg.key.remoteJid;

// Frases de protección al Owner const frasesOwner = [ '🛡️ Protección Suprema Activada\n@{user} es el creador, el alfa y el omega de este bot. No se toca.', '👑 Error de Sistema: Intento fallido de escaneo\n@{user} tiene inmunidad absoluta ante el gayómetro.', '⚠️ Advertencia Crítica\nEscanear a @{user} puede causar una explosión del servidor. Operación cancelada.', '🚨 ALERTA: OBJETIVO RESTRINGIDO\n@{user} tiene un sello celestial. Intocable por simples mortales.', '🔒 Modo Dios Activado\nNo puedes medir lo que está más allá del arcoíris. @{user} está fuera del sistema.' ];

const stickersOwner = [ 'https://cdn.russellxz.click/9087aa1c.webp', 'https://cdn.russellxz.click/85a16aa5.webp', 'https://cdn.russellxz.click/270edf17.webp', 'https://cdn.russellxz.click/afd908e6.webp' ];

const audioURL = 'https://cdn.russellxz.click/96beb11b.mp3';

let mentionedJid; try { if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) { mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]; } else if (msg.message?.contextInfo?.mentionedJid?.length) { mentionedJid = msg.message.contextInfo.mentionedJid[0]; } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) { mentionedJid = msg.message.extendedTextMessage.contextInfo.participant; } else if (msg.message?.contextInfo?.participant) { mentionedJid = msg.message.contextInfo.participant; } } catch (e) { mentionedJid = null; }

if (!mentionedJid) { return await conn.sendMessage(chatId, { text: '🔍 Etiqueta o responde a alguien para escanear su porcentaje gay.', }, { quoted: msg }); }

const numero = mentionedJid.split('@')[0];

const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero); if (isTaggedOwner) { const fraseElegida = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero); const stickerElegido = stickersOwner[Math.floor(Math.random() * stickersOwner.length)];

await conn.sendMessage(chatId, {
  text: fraseElegida,
  mentions: [mentionedJid]
}, { quoted: msg });

await conn.sendMessage(chatId, {
  sticker: { url: stickerElegido }
}, { quoted: msg });

return;

}

const porcentaje = Math.floor(Math.random() * 101); const barra = (valor) => { const total = 10; const llenos = Math.round((valor / 100) * total); return [${'█'.repeat(llenos)}${'░'.repeat(total - llenos)}]; };

const mensajeInicial = await conn.sendMessage(chatId, { text: 📡 *Escaneando a @${numero}...*\n🔬 Analizando el arcoíris interior..., mentions: [mentionedJid] }, { quoted: msg });

for (let i = 0; i <= porcentaje; i += 20) { await new Promise(resolve => setTimeout(resolve, 450)); await conn.sendMessage(chatId, { text: 🔎 *Procesando...*\n${barra(i)} ${i}%, edit: mensajeInicial.key }); }

await new Promise(resolve => setTimeout(resolve, 600));

let decorado = ╭━━🎯 *ESCÁNER GAY* ━━⬣\n┃\n; const frases = { bajo: [ '𝙹𝚄𝚁𝙰𝚂 𝚀𝚄𝙴 𝙴𝚁𝙴𝚂 𝙷É𝚃𝙴𝚁𝙾, 𝙿𝙴𝚁𝙾 𝚂𝙴 𝚃𝙴 𝙲𝙰𝙴 𝙻𝙰 𝙲𝙰𝚁𝙰 𝙲𝚄𝙰𝙽𝙳𝙾 𝚂𝚄𝙴𝙽𝙰 𝙳𝚄𝙰 𝙻𝙸𝙿𝙰.', '𝚃𝚄 𝚅𝙸𝙱𝚁𝙰 𝙷𝙴𝚃𝙴𝚁𝙾 𝙴𝚂 𝚄𝙽𝙰 𝙼𝙴𝙽𝚃𝙸𝚁𝙰 𝙴𝙽 𝚂𝚄 𝙿𝙴𝙶𝙰𝙳𝙾𝚁𝙰 𝙴𝙽𝙴𝚁𝙶Í𝙰 𝙶𝙰𝚈.' ], medio: [ '𝚃𝚄 𝙷𝙸𝙽𝙲𝙷𝙰 𝙵𝙰𝚅𝙾𝚁𝙸𝚃𝙰 𝙴𝚂 𝚂𝙰𝙽 𝙱𝙴𝙱𝙴𝙽𝙳𝙾 𝚈 𝚃𝚄 𝙿𝚁𝙾𝙿𝙴𝙽𝙲𝙸Ó𝙽 𝙶𝙰𝚈 𝙻𝙾 𝚁𝙴𝙵𝙻𝙴𝙹𝙰.', '𝚃𝙴 𝙷𝙰𝙲𝙴𝚂 𝙴𝙻 𝙳𝚄𝚁𝙾, 𝙿𝙴𝚁𝙾 𝚃𝚄 𝚂𝙴𝚁𝙸𝙴 𝙵𝙰𝚅𝙾𝚁𝙸𝚃𝙰 𝙴𝚂 𝙴𝙻𝙸𝚃𝙴. 𝙴𝚇𝙿𝙻𝙸𝙲𝙰 𝙴𝚂𝙾.' ], alto: [ '𝚃𝚄 𝙴𝙽𝙴𝚁𝙶Í𝙰 𝙴𝚂 𝙼𝙰́𝚂 𝙶𝙰𝚈 𝚀𝚄𝙴 𝚄𝙽 𝙿𝙰𝙲𝙴𝙳𝙴𝙼𝙸𝙰 𝙳𝙴 𝙵𝙻𝙾𝚁𝙴𝚂 𝙲𝙾𝙽 𝙵𝙸𝙻𝚃𝚁𝙾 𝙱𝙴𝙻𝙻𝙰.', '𝙳𝙴𝙹𝙰 𝙳𝙴 𝙵𝙸𝙽𝙶𝙸𝚁 𝙴𝚂𝙰 𝙰𝙲𝚃𝙸𝚃𝚄𝙳 𝙼𝙰𝙻𝙾𝚃𝙰, 𝙻𝙴 𝚃𝙴𝙽𝙴𝚂 𝙼𝙰́𝚂 𝙶𝙰𝙽𝙰𝚂 𝙰 𝙴𝙻 𝙰𝙼𝙸𝙶𝙾 𝚀𝚄𝙴 𝙰 𝚄𝙽𝙰 𝙽𝙾𝚅𝙸𝙰.' ], extremo: [ '𝙴𝚂𝚃𝙴 𝚂𝙲𝙰𝙽𝙴𝙾 𝙽𝙾 𝚁𝙴𝚀𝚄𝙸𝙴𝚁𝙴 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾: 𝚃𝚄 𝚂𝙴𝚁 𝙸𝚁𝚁𝙰𝙳𝙸𝙰 𝙿𝚁𝙸𝙳𝙴 𝙲𝙾𝙼𝙾 𝚄𝙽 𝚂𝙾𝙻 𝙲𝙾𝙽 𝙴𝙵𝙴𝙲𝚃𝙾𝚂 𝙳𝙴 𝙽𝙴𝙾́𝙽.', '𝚁𝙴𝙸𝙽𝙰 𝙳𝙴𝙻 𝙵𝙻𝙾𝚆, 𝙳𝚄𝙴Ñ𝙰 𝙳𝙴 𝙻𝙰 𝙿𝚄𝚁𝙿𝚄𝚁𝙸𝙽𝙰, 𝙼𝙰𝚁𝙲𝙰 𝚃𝚄 𝙿𝙰𝚂𝙾 𝙿𝚁𝙾𝙿𝙸𝙾 𝙴𝙽 𝙴𝙻 𝙰𝚁𝙲𝙾Í𝚁𝙸𝚂.' ] };

let mensajeFinal; if (porcentaje <= 20) { mensajeFinal = frases.bajo[Math.floor(Math.random() * frases.bajo.length)]; } else if (porcentaje <= 50) { mensajeFinal = frases.medio[Math.floor(Math.random() * frases.medio.length)]; } else if (porcentaje <= 80) { mensajeFinal = frases.alto[Math.floor(Math.random() * frases.alto.length)]; } else { mensajeFinal = frases.extremo[Math.floor(Math.random() * frases.extremo.length)]; }

decorado += ┃ @${numero} tiene *${porcentaje}% Gay Confirmado*\n; decorado += ┃ ${mensajeFinal}\n; decorado += ╰━━━━⊰ *𝑬𝒍 𝒖𝒏𝒊𝒗𝒆𝒓𝒔𝒐 𝒏𝒖𝒏𝒄𝒂 𝒇𝒂𝒍𝒍𝒂* ⊱━━⬣;

await conn.sendMessage(chatId, { text: decorado, mentions: [mentionedJid] }, { quoted: msg });

if (audioURL) { await conn.sendMessage(chatId, { audio: { url: audioURL }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg }); } };

handler.command = ['gay']; handler.tags = ['diversión']; handler.help = ['gay @usuario o responde']; handler.register = true; handler.group = true;

module.exports = handler;

