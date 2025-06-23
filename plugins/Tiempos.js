// plugins/tiempos.js
const fs = require("fs");
const path = require("path");

const tiemposPath = path.resolve("./tiempos.json");

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatearDiaCompleto(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}

function calcularDiasRestantes(fechaFutura) {
  const hoy = new Date();
  const dias = Math.ceil((fechaFutura - hoy) / (1000 * 60 * 60 * 24));
  return dias;
}

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
      text: `➤ *ORDENES RECIBIDAS* ✅\n\n\`\`\`Finaliza en: ${dias} días.\`\`\`\n\`\`\`Fecha: ${formatearFecha(fechaFin)}\`\`\`\n\`\`\`Grupo: ${metadata?.subject || "Grupo desconocido"}\`\`\``
    }, { quoted: msg });
  }

  if (command.startsWith(".verfecha")) {
    if (!tiempos[chatId]) {
      return conn.sendMessage(chatId, { text: "❌ No se ha establecido ningún tiempo para este grupo." }, { quoted: msg });
    }

    const { fin } = tiempos[chatId];
    const diasRestantes = calcularDiasRestantes(fin);
    const fechaTexto = formatearDiaCompleto(fin);

    return conn.sendMessage(chatId, {
      text: `📅 *SHOWDATE* 🔔\n\n\`\`\`Próximo ${fechaTexto}\`\`\`\n\`\`\`Quedan, ${diasRestantes} días.\`\`\`\n\n> 𝖴𝗌𝖾 .𝗋𝖾𝗇𝗈𝗏𝖺𝗋`
    }, { quoted: msg });
  }

  if (command.startsWith(".renovar")) {
    const owner = global.owner[0]; // primer owner en global.owner
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