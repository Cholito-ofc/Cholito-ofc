const handler = async (m, { conn }) => {
  // Obtener lista de owners válidos
  const list = Array.isArray(global.owner)
    ? global.owner.map(v => (typeof v === "object" ? v[0] : v))
    : [];

  // Validar si el que ejecuta es owner principal
  if (!list.includes(m.sender)) {
    return conn.reply(m.chat, "🚫 Este comando solo puede ser usado por el owner principal.", m);
  }

  // Confirmación antes de salir
  await conn.reply(m.chat, "👋 El bot está saliendo del grupo...", m);

  // Salir del grupo
  try {
    await conn.groupLeave(m.chat);
  } catch (e) {
    console.error("Error al salir del grupo:", e);
    conn.reply(m.chat, "❌ No se pudo salir del grupo. Verifica si el bot es admin.", m);
  }
};

handler.command = ['salirgrupo'];
handler.group = true;
handler.admin = false;
handler.botAdmin = true;

module.exports = handler;