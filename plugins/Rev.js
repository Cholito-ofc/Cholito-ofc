// plugins/rev.js
const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  // Solo owner, bot o admin pueden usar en grupo
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

  // Leer archivo de logs (ajusta el nombre si usas otro archivo)
  const logPath = path.resolve("./error.log");
  if (!fs.existsSync(logPath)) {
    return conn.sendMessage(chatId, {
      text:
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "   🟢  𝑺𝑰𝑵 𝑬𝑹𝑹𝑶𝑹𝑬𝑺  🟢\n" +
        "━━━━━━━━━━━━━━━━━━━━\n\n" +
        "✨ El bot está funcionando perfectamente\n" +
        "No se han detectado errores recientes.\n",
      quoted: msg
    });
  }

  // Lee los últimos 20 errores (o menos)
  const lines = fs.readFileSync(logPath, "utf-8")
    .trim()
    .split("\n")
    .slice(-20); // Últimas 20 líneas

  let out = "";
  if (lines.length) {
    out =
      "╔══════════════════════════════╗\n" +
      "   ⚠️  𝙀𝙍𝙍𝙊𝙍𝙀𝙎 𝙍𝙀𝘾𝙄𝙀𝙉𝙏𝙀𝙎  ⚠️\n" +
      "╚══════════════════════════════╝\n\n" +
      "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
      "┃ N°  |      Mensaje de Error      \n" +
      "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n" +
      lines.map((l, i) => `┃ ${String(i+1).padStart(2,"0")} | ${l}`).join("\n") +
      "\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
      "🔎 *Revisa y corrige estos errores para un mejor funcionamiento.*";
  } else {
    out =
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "   🟢  𝑺𝑰𝑵 𝑬𝑹𝑹𝑶𝑹𝑬𝑺  🟢\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "✨ El bot está funcionando perfectamente\n" +
      "No se han detectado errores recientes.\n";
  }

  // WhatsApp tiene límite, recorta si es necesario
  const maxChars = 4096;
  return conn.sendMessage(chatId, {
    text: out.length > maxChars ? out.slice(-maxChars) : out,
    quoted: msg
  });
};

handler.command = ["rev"];
handler.tags = ["owner", "tools"];
handler.help = ["rev"];
module.exports = handler;