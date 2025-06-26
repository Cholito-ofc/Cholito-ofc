const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  if (!isGroup) {
    return conn.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
  }

  // Obtener configuraciones del grupo
  const chat = global.db.data.chats[chatId] || {};

  // Lista de funciones y su estado
  const opciones = [
    { nombre: 'Bienvenida', key: 'welcome' },
    { nombre: 'Despedidas', key: 'despedida' },
    { nombre: 'Anti Enlaces', key: 'antiLink' },
    { nombre: 'Modo Público', key: 'modohorny' },
    { nombre: 'Restricciones', key: 'restrict' },
    { nombre: 'Antifake', key: 'antifake' },
    { nombre: 'Detectar Cambios', key: 'detect' },
    { nombre: 'Audios Automáticos', key: 'audios' },
    { nombre: 'Modo Chatbot', key: 'chatbot' },
    { nombre: 'Autosticker', key: 'autosticker' },
  ];

  let activadas = '';
  let desactivadas = '';

  for (const opcion of opciones) {
    const estado = chat[opcion.key];
    if (estado) {
      activadas += `✅ *${opcion.nombre}*\n`;
    } else {
      desactivadas += `❌ *${opcion.nombre}*\n`;
    }
  }

  const mensaje = `
📍 *Estado de funciones del grupo*

${activadas || '✅ Ninguna activada'}
${desactivadas || '❌ Ninguna desactivada'}

Usa los comandos para activar/desactivar, ejemplo:
• .welcome on
• .antilink off
`.trim();

  await conn.sendMessage(chatId, { text: mensaje }, { quoted: msg });
};

handler.command = ['onoff', 'estado', 'statusgrupo'];
module.exports = handler;