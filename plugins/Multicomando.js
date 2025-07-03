const handler = async (msg, { conn }) => { const chatId = msg.key.remoteJid;

const text = (msg.text || msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase(); const comando = text.trim().split(/\s+/)[0].replace(/^[.!/#]/, '').toLowerCase();

const comandosValidos = [ 'puta', 'puto', 'peruano', 'peruana', 'negro', 'negra', 'manca', 'manco', 'fea', 'feo', 'enano', 'enana', 'cachudo', 'cachuda', 'pajero', 'pajera', 'rata', 'adoptado', 'adoptada' ];

if (!comandosValidos.includes(comando)) return;

let mentionedJid = null; try { if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) { mentionedJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]; } else if (msg.message?.contextInfo?.mentionedJid?.length) { mentionedJid = msg.message.contextInfo.mentionedJid[0]; } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) { mentionedJid = msg.message.extendedTextMessage.contextInfo.participant; } else if (msg.message?.contextInfo?.participant) { mentionedJid = msg.message.contextInfo.participant; } else if (msg.key.participant && msg.key.participant !== conn.user?.id) { mentionedJid = msg.key.participant; } } catch { mentionedJid = null; }

if (!mentionedJid) { return await conn.sendMessage(chatId, { text: '❗ Debes etiquetar o responder a alguien para usar este comando.', }, { quoted: msg }); }

const numero = mentionedJid.split('@')[0];

const frasesOwner = [ '🛡️ Protección Suprema Activada\n@{user} es el alfa, el omega y el padre del comando. Intocable.', '👑 Error de Sistema\nIntentaste escanear al Creador. Abortando misión.', '🚫 Este usuario tiene inmunidad total ante el escáner.\nNo se toca al jefe.', '🔒 Modo Dios activado para @{user}. Mejor no intentes otra vez.', '⚠️ Escanear al Owner está prohibido por ley universal. Respeta jerarquías.' ];

const isTaggedOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === numero); if (isTaggedOwner) { const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('{user}', numero); return await conn.sendMessage(chatId, { text: frase, mentions: [mentionedJid] }, { quoted: msg }); }

const frasesPorComando = { puta: [ '𐀔 Naciste para cobrar sin amor.', '𐀔 Ni en la esquina perdonas.', '𐀔 Tu vida es un Only sin cuenta.', '𐀔 El suelo te extraña cuando no estás encima.' ], puto: [ '𐀔 Te sientas más que los muebles del INSS.', '𐀔 No te respetan ni en el FIFA.', '𐀔 Eres leyenda urbana en la zona roja.', '𐀔 Te tiembla hasta el WiFi de tantos bajones.' ], peruano: [ '𐀔 Tu conexión es más inestable que tu economía.', '𐀔 Si fueras internet, serías Bitel.', '𐀔 Cada vez que hablas, un ceviche llora.', '𐀔 Ni Machu Picchu te reconoce como local.' ], peruana: [ '𐀔 Tus audios deberían ir a patrimonio cultural.', '𐀔 Cada sticker tuyo vale un sol.', '𐀔 Eres el motivo de cada bug en el grupo.', '𐀔 Tu voz activa terremotos.' ], negro: [ '𐀔 Eres más oscuro que mis ganas de vivir.', '𐀔 Ni la linterna del bot te encuentra.', '𐀔 Te camuflas en la sombra de la sombra.', '𐀔 Apareces en fotos con filtro negativo.' ], negra: [ '𐀔 Apagas focos con solo pasar cerca.', '𐀔 Tu silueta asusta hasta en modo día.', '𐀔 El eclipse te pidió que te apartaras.', '𐀔 Brillas por tu opacidad.' ], manca: [ '𐀔 Fallas más que mi ex en fidelidad.', '𐀔 No le das ni a una piñata amarrada.', '𐀔 Tu KD es un insulto a la puntería.', '𐀔 Disparas dudas, no balas.' ], manco: [ '𐀔 Eres la razón por la que existen los bots.', '𐀔 Tus manos deberían venir con parche.', '𐀔 Te matan antes de cargar la partida.', '𐀔 Tu precisión ofende a los ciegos.' ], fea: [ '𐀔 El espejo te evita.', '𐀔 Fuiste rechazada hasta por el filtro de belleza.', '𐀔 Eres el motivo por el que existe el modo oscuro.', '𐀔 Tu cara rompe más que los estados del bot.' ], feo: [ '𐀔 Cuando naciste, el doctor se disculpó.', '𐀔 Eres el susto antes de dormir.', '𐀔 Ni el WiFi te quiere conectar.', '𐀔 Fuiste borrado del diccionario de estética.' ], enana: [ '𐀔 Necesitas escalera hasta para los audios largos.', '𐀔 En el VS ni te ven llegar.', '𐀔 Te confunden con un sticker.', '𐀔 Eres mini pero molesta en tamaño real.' ], enano: [ '𐀔 Saltas y aún así no das miedo.', '𐀔 Eres la versión demo de un jugador.', '𐀔 Te cargan más que a una laptop vieja.', '𐀔 Si fueras más bajo, serías emoji.' ], cachudo: [ '𐀔 Tu frente ya no cabe en las selfies.', '𐀔 Eres el rey del cornómetro.', '𐀔 Te engañan hasta en los sueños.', '𐀔 La infidelidad te sigue como la sombra.' ], cachuda: [ '𐀔 Tu pareja tiene más vueltas que un trompo.', '𐀔 Te ponen los cuernos hasta en Roblox.', '𐀔 Ni tu suegra lo oculta ya.', '𐀔 El grupo entero lo sabía menos tú.' ], pajero: [ '𐀔 Tus datos se gastan en soledad.', '𐀔 Eres el MVP del incognito.', '𐀔 Ya saludas con la mano izquierda.', '𐀔 Tu historial da miedo al FBI.' ], pajera: [ '𐀔 Tu vibrador necesita vacaciones.', '𐀔 Netflix y tú misma.', '𐀔 Nadie te quiere, pero tú te amas.', '𐀔 Te sabes todos los scripts de Brazzers.' ], rata: [ '𐀔 No prestas ni los buenos días.', '𐀔 Te escondes cuando es tu turno de pagar.', '𐀔 Eres la causa de la inflación.', '𐀔 Más codo que luchador sin brazo.' ], adoptado: [ '𐀔 Eres el DLC de la familia.', '𐀔 Ni el perro te reconoce.', '𐀔 Llegaste sin tutorial.', '𐀔 Eres un parche emocional.' ], adoptada: [ '𐀔 Tus raíces son misterio nacional.', '𐀔 Fuiste agregada como sticker a la familia.', '𐀔 Ni la abuela te menciona en las fotos.', '𐀔 Tu existencia fue sorpresa para todos.' ] };

const cierres = [ '➢ Los científicos lo confirman.', '➢ El universo no se equivoca.', '➢ Esto es irrefutable.', '➢ Ya ni la NASA lo puede negar.', '➢ Registro validado en la base del multiverso.' ];

const remate = frasesPorComando[comando][Math.floor(Math.random() * frasesPorComando[comando].length)]; const cierre = cierres[Math.floor(Math.random() * cierres.length)]; const porcentaje = Math.floor(Math.random() * 101);

const textoFinal = `💫 ESCÁNER COMPLETO

🔥 𝙻𝙾𝚂 𝙲𝙰́𝙻𝙲𝚄𝙻𝙾𝚂 𝙷𝙰𝙽 𝙰𝚁𝙾𝙹𝙰𝙳𝙾 𝚀𝚄𝙴 @${numero} 𝙴𝚂 『 ${porcentaje}% 』 ${comando.toUpperCase()}

> ${remate}



${cierre}`;

await conn.sendMessage(chatId, { text: textoFinal, mentions: [mentionedJid] }, { quoted: msg }); };

handler.command = [
  'puta', 'puto', 'peruano', 'peruana',
  'negro', 'negra', 'manca', 'manco',
  'fea', 'feo', 'enano', 'enana',
  'cachudo', 'cachuda', 'pajero', 'pajera',
  'rata', 'adoptado', 'adoptada',
];

handler.tags = ['diversión'];
handler.help = handler.command.map(c => `${c} @usuario o responde`);
handler.group = true;
handler.register = true;

module.exports = handler;
