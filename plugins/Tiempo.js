const fs = require("fs");
const path = require("path");

const tiemposPath = path.resolve("./tiempos.json");

// Número único del owner (completo con código de país, sin espacios ni guiones)
const OWNER_NUMBER = "50489513153";

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatearDiaCompleto(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}

function calcularDiasRestantes(fechaFutura) {
  const hoy = new Date();
  return Math.ceil((fechaFutura - hoy) / (1000 * 60 * 60 * 24));
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, ""); // Número limpio
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = senderNum.endsWith(OWNER_NUMBER); // Detección por terminación exacta

  const metadata = isGroup ? await conn.groupMetadata(chatId) : null;
  const participant = metadata?.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

  const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const tiempos = fs.existsSync(tiemposPath) ? JSON.parse(fs.readFileSync(tiemposPath)) : {};

  // 🕒 .tiempo — solo owner
  if (command.startsWith(".tiempo")) {
    if (!isOwner) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo el owner puede usar este comando.*"
      }, { quoted: msg });
    }

    const dias = parseInt(args[0]);
    if (isNaN(dias) || dias <= 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Especifica un número válido de días. Ejemplo: *.tiempo 30*"
      }, { quoted: msg });
    }

    const fechaActual = Date.now();
    const fechaFin = fechaActual + dias * 24 * 60 * 60 * 1000;

    tiempos[chatId] = {
      inicio: fechaActual,
      fin: fechaFin
    };

    fs.writeFileSync(tiemposPath, JSON.stringify(tiempos, null, 2));

    return conn.sendMessage(chatId, {
      text: `➤ \`ORDENES RECIBIDAS\` ✅\n\n\`\`\`Finaliza en: ${dias} días.\`\`\`\n\`\`\`Fecha: ${formatearFecha(fechaFin)}\`\`\`\n\`\`\`Grupo: ${metadata?.subject || "Grupo desconocido"}\`\`\``
    }, { quoted: msg });
  }

  // 📆 .verfecha — admin y owner
  if (command.startsWith(".verfecha")) {
    if (!isOwner && !(isGroup && isAdmin)) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores y el owner pueden usar este comando.*"
      }, { quoted: msg });
    }

    if (!tiempos[chatId]) {
      return conn.sendMessage(chatId, {
        text: "❌ No se ha establecido ningún tiempo para este grupo."
      }, { quoted: msg });
    }

    const { fin } = tiempos[chatId];
    const diasRestantes = calcularDiasRestantes(fin);
    const fechaTexto = formatearDiaCompleto(fin);
    const horaTexto = formatearFecha(fin).split(", ")[1];

    return conn.sendMessage(chatId, {
      text: `📅 \`SHOWDATE\` 🔔\n\n\`\`\`Próximo ${fechaTexto}\`\`\`\n\`\`\`Hora exacta: ${horaTexto} (hora CDMX)\`\`\`\n\`\`\`Quedan, ${diasRestantes} días.\`\`\`\n\n> 𝖴𝗌𝖾 .𝗋𝖾𝗇𝗈𝗏𝖺𝗋`
    }, { quoted: msg });
  }

  // 🔁 .renovar — admin y owner
  if (command.startsWith(".renovar")) {
    if (!isOwner && !(isGroup && isAdmin)) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores y el owner pueden usar este comando.*"
      }, { quoted: msg });
    }

    const ownerName = "Cholito";

    // Botón primero
    await conn.sendMessage(chatId, {
      text: "💼 *CONTACTAR OWNER*",
      buttons: [
        { buttonId: ".renovar", buttonText: { displayText: "📲 RENOVAR ACCESO" }, type: 1 }
      ],
      footer: "",
      headerType: 1
    }, { quoted: msg });

    // Texto informativo
    await conn.sendMessage(chatId, {
      text: `🔒 *Tu acceso al sistema está por finalizar o ya ha expirado.*\n\nSi deseas continuar utilizando el bot y mantener todas sus funciones activas, contacta con el Owner para renovar tu acceso.\n\n🛠️ Soporte personalizado, activación rápida y atención directa.\n\n👤 *Contacto:* ${ownerName}\n📞 *WhatsApp:* wa.me/${OWNER_NUMBER}`
    }, { quoted: msg });

    // Contacto del Owner
    return conn.sendMessage(chatId, {
      contacts: [{
        displayName: ownerName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}\nEND:VCARD`
      }]
    }, { quoted: msg });
  }
};

handler.command = ["tiempo", "verfecha", "renovar"];
handler.tags = ["tools"];
handler.help = [".tiempo <días>", ".verfecha", ".renovar"];

module.exports = handler;
