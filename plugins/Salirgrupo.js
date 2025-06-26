const handler = async (m, { conn }) => {
  const list = Array.isArray(global.owner)
    ? global.owner.map(v => (typeof v === "object" ? v[0] : v))
    : [];

  if (!list.includes(m.sender)) {
    return conn.sendMessage(m.chat, { text: "🚫 Este comando solo puede ser usado por el owner principal." }, { quoted: m });
  }

  await conn.sendMessage(m.chat, { text: "👋 El bot está saliendo del grupo..." }, { quoted: m });

  try {
    await conn.groupLeave(m.chat);
  } catch (e) {
    console.error("Error al salir del grupo:", e);
    await conn.sendMessage(m.chat, { text: "❌ No se pudo salir del grupo. Verifica si el bot es admin." }, { quoted: m });
  }
};

handler.command = ['salirgrupo'];
handler.group = true;
handler.admin = false;
handler.botAdmin = true;

module.exports = handler;