const handler = async (m, { conn }) => {
  const list = Array.isArray(global.owner)
    ? global.owner.map(v => (typeof v === "object" ? v[0] : v))
    : [];

  if (!list.includes(m.sender)) {
    return m.reply("🚫 Este comando solo puede ser usado por el owner principal.");
  }

  await m.reply("👋 El bot está saliendo del grupo...");
  try {
    await conn.groupLeave(m.chat);
  } catch (e) {
    console.error("Error al salir del grupo:", e);
    m.reply("❌ No se pudo salir del grupo. Verifica si el bot es admin.");
  }
};

handler.command = ['salirgrupo'];
handler.group = true;
handler.admin = false;
handler.botAdmin = true;

module.exports = handler;