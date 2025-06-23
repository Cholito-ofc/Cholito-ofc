// plugins/tiempos.js
const fs = require("fs");
const path = require("path");

const tiemposPath = path.resolve("./tiempos.json");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  const metadata = isGroup ? await conn.groupMetadata(chatId) : null;
  const participant = metadata?.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  const permisos = isGroup ? (isAdmin || isOwner || isFromMe) : (isOwner || isFromMe);

  if (!permisos) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
    }, { quoted: msg });
  }

  const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

  // Cargar archivo de tiempos
  const tiempos = fs.existsSync(tiemposPath) ? JSON.parse(fs.readFileSync(tiemposPath)) : {};

  if (command.startsWith(".tiempos")) {
    const dias = parseInt(args[0]);
    if (isNaN(dias) || dias <= 0) {
      return conn.sendMessage(chatId, { text: "⚠️ Especifica un número válido de días. Ejemplo: *.tiempos 30*" }, { quoted: msg });
    }

    const fechaActual = Date.now();
    const fechaFin = fechaActual + dias * 24 * 60 * 60 * 1000;

    tiempos[chatId] = {
      inicio: fechaActual,
      fin: fechaFin
    };

    fs.writeFileSync(tiemposPath, JSON.stringify(tiempos, null, 2));

    return conn.sendMessage(chatId, {
      text: `✅ *Tiempo establecido por ${dias} días*\n📅 *Desde:* ${new Date(fechaActual).toLocaleString()}\n📅 *Hasta:* ${new Date(fechaFin).toLocaleString()}`
    }, { quoted: msg });
  }

  if (command.startsWith(".verfecha")) {
    if (!tiempos[chatId]) {
      return conn.sendMessage(chatId, { text: "❌ No se ha establecido ningún tiempo para este grupo." }, { quoted: msg });
    }

    const { inicio, fin } = tiempos[chatId];

    return conn.sendMessage(chatId, {
      text: `📌 *Tiempo configurado:*\n🕒 *Inicio:* ${new Date(inicio).toLocaleString()}\n⏳ *Expira:* ${new Date(fin).toLocaleString()}`
    }, { quoted: msg });
  }

  if (command.startsWith(".renovar")) {
    const owner = global.owner[0]; // Usa el primer owner registrado
    return conn.sendMessage(chatId, {
      contacts: [{
        displayName: "Owner",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Owner\nTEL;type=CELL;type=VOICE;waid=${owner[0]}:${owner[0]}\nEND:VCARD`
      }]
    }, { quoted: msg });
  }
};

handler.command = ["tiempos", "verfecha", "renovar"];
handler.tags = ["tools"];
handler.help = [
  ".tiempos <días>",
  ".verfecha",
  ".renovar"
];

module.exports = handler;