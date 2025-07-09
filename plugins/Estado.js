const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Permisos igual que en tu plugin
  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*"
    }, { quoted: msg });
  }

  // Leer activos.json
  const activosPath = path.resolve("./activos.json");
  if (!fs.existsSync(activosPath)) {
    return conn.sendMessage(chatId, {
      text: "❌ Archivo de configuraciones no encontrado."
    }, { quoted: msg });
  }
  const activosRaw = fs.readFileSync(activosPath, "utf-8");
  const activos = JSON.parse(activosRaw);

  // Función para determinar si la opción es configurable por grupo (objeto con grupos) o global (booleano)
  function esConfigurable(opcion) {
    const val = activos[opcion];
    return typeof val === "boolean" || (typeof val === "object" && val !== null);
  }

  // Función para saber si está activo para este grupo
  function estaActivo(opcion) {
    const valor = activos[opcion];
    if (typeof valor === "boolean") return valor === true;
    if (typeof valor === "object") return valor[chatId] === true;
    return false;
  }

  // Tomar solo opciones configurables
  const opcionesConfig = Object.keys(activos).filter(esConfigurable);

  if (opcionesConfig.length === 0) {
    return conn.sendMessage(chatId, {
      text: "⚠️ No hay opciones configurables en este grupo."
    }, { quoted: msg });
  }

  // Construir mensaje con todas las opciones activas o no
  let texto = "╭━〔 𝚂𝙸𝚂𝙺𝙴𝙳 𝙴𝚂𝚃𝙰𝙳𝙾 〕━⬣\n";

  opcionesConfig.forEach(opcion => {
    const activo = estaActivo(opcion);
    texto += `┃ ${opcion}: ${activo ? "✅" : "❌"}\n`;
  });

  texto += "╰━━━━━━━━━━━━━━━━⬣";

  await conn.sendMessage(chatId, { react: { text: "📊", key: msg.key } });
  await conn.sendMessage(chatId, { text: texto }, { quoted: msg });
};

handler.command = ["estado", "configstatus"];
handler.tags = ["info"];
handler.help = ["estado", "configstatus"];

module.exports = handler;