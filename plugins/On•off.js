const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: '❌ Este comando solo se puede usar en grupos.'
    }, { quoted: msg });
  }

  const chat = global.db.data.chats[chatId] || {};

  // Lista de funciones a mostrar
  const funciones = [
    { key: 'welcome', nombre: 'Bienvenida' },
    { key: 'despedida', nombre: 'Despedidas' },
    { key: 'antilink', nombre: 'Anti Enlaces' },
    { key: 'restrict', nombre: 'Restricciones' },
    { key: 'detect', nombre: 'Detectar Cambios' },
    { key: 'audios', nombre: 'Audios Automáticos' },
    { key: 'chatbot', nombre: 'Modo Chatbot' },
    { key: 'autosticker', nombre: 'Autosticker' },
    { key: 'antifake', nombre: 'Antifake' },
    { key: 'modohorny', nombre: 'Modo Público' }
  ];

  let activadas = '', desactivadas = '';

  funciones.forEach(({ key, nombre }) => {
    if (chat[key]) {
      activadas += `✅ *${nombre}*\n`;
    } else {
      desactivadas += `❌ *${nombre}*\n`;
    }
  });

  const texto = `
📍 *Estado de funciones del grupo*

${activadas || '✅ Ninguna activada'}
${desactivadas || '❌ Ninguna desactivada'}

📌 Usa *.on <función>* o *.off <función>* para activar o desactivar.
📌 Ejemplo: *.on welcome* o *.off antilink*
`.trim();

  await conn.sendMessage(chatId, { text: texto }, { quoted: msg });
};

handler.command = ['onoff', 'estado', 'config'];
module.exports = handler;