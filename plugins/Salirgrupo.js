const handler = async (m, { conn }) => {
  // Obtener la lista de owners válidos
  const list = Array.isArray(global.owner)
    ? global.owner.map(v => (typeof v === "object" ? v[0] : v))
    : [];

  // Validar si quien ejecuta el comando es owner principal
  if (!list.includes(m.sender)) {
    return m.reply("🚫 Este comando solo puede ser usado por el owner principal.");
  }

  // Confirmación opcional antes de salir del grupo
  await m.reply("👋 El bot está saliendo del grupo...");

  // Salir del grupo
  try {
    await conn.groupLeave(m.chat);
  } catch (e) {
    console.error("Error al salir del grupo:", e);
    m.reply("❌ No se pudo salir del grupo. Verifica si el bot es admin.");
  }
};

handler.command = ['salirgrupo'];  // Comando que activa este handler
handler.group = true;              // Solo se puede usar en grupos
handler.admin = false;            // No requiere que el usuario sea admin
handler.botAdmin = true;          // El bot debe ser admin para poder salirse

export default handler;