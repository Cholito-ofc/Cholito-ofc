let handler = async (m, { conn, args, usedPrefix, command}) => {
  const ownerNumber = '523222056785@s.whatsapp.net';

  if (!args[0]) {
    return m.reply(`⚠️ Escribe qué comando falla o deseas reportar.\n\n💡 Ejemplo:\n*${usedPrefix + command} menu no funciona*`);
}

  const reporte = args.join(' ');
  const numeroReal = m.sender.split('@')[0];
  const texto = `
📮 *NUEVO REPORTE DE USUARIO* 📮

📱 Número: wa.me/${numeroReal}
💬 Comando reportado: ${reporte}
🕒 Hora: ${new Date().toLocaleString()}

🔧  Killual Bot recibió este reporte.
`;
  await conn.sendMessage(ownerNumber, {
    text: texto,
    mentions: [m.sender]
};
  return m.reply('✅ Tu reporte fue enviado correctamente al creador del bot.\n¡Gracias por tu ayuda! 🔧');
};

handler.help = ['reporte <comando>'];
handler.tags = ['info'];
handler.command = ['bug', 'reporte', 'reportar'];
export default handler;