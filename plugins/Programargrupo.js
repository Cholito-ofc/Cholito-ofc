const fs = require("fs");
const path = require("path");
const horariosPath = path.resolve("./horarios_grupo.json");

const zonas = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Argentina/Buenos_Aires"
];

const zonasAlias = {
  "méxico": "America/Mexico_City",
  "mexico": "America/Mexico_City",
  "bogota": "America/Bogota",
  "lima": "America/Lima",
  "argentina": "America/Argentina/Buenos_Aires"
};

function convertirHora(horaStr) {
  const match = horaStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!match) return null;
  let [_, h, m, ap] = match;
  h = parseInt(h);
  m = m.padStart(2, "0");
  ap = ap.toLowerCase();
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${m}`;
}

function formatearHora12(hora24) {
  let [h, m] = hora24.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

function cargarHorarios() {
  if (!fs.existsSync(horariosPath)) return {};
  return JSON.parse(fs.readFileSync(horariosPath, "utf-8"));
}

function guardarHorarios(data) {
  fs.writeFileSync(horariosPath, JSON.stringify(data, null, 2));
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: "🚫 *Solo admins, owner o bot pueden usar este comando.*" }, { quoted: msg });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando en privado.*" }, { quoted: msg });
  }

  const rawText = args.join(" ").trim();
  const lowerText = rawText.toLowerCase();

  let zonaDetectada;
  for (let alias in zonasAlias) {
    if (lowerText.endsWith(" " + alias)) {
      zonaDetectada = zonasAlias[alias];
      break;
    }
  }

  let textoSinZona = zonaDetectada
    ? rawText.replace(new RegExp(`\\s*(${Object.keys(zonasAlias).join("|")})$`, "i"), "").trim()
    : rawText;

  let abrirMatch = textoSinZona.match(/abrir\s+(\d{1,2}:\d{2}\s*(am|pm)?)/i);
  let cerrarMatch = textoSinZona.match(/cerrar\s+(\d{1,2}:\d{2}\s*(am|pm)?)/i);

  if (!abrirMatch && !cerrarMatch) {
    return conn.sendMessage(chatId, {
      text: `🌅 *Programación de grupo*\n\n` +
        `*Uso correcto:*\n` +
        `» .programargrupo abrir 8:00 am cerrar 10:30 pm\n` +
        `» .programargrupo abrir 8:00 cerrar 10:30 pm\n` +
        `» .programargrupo cerrar 10:30 abrir 8:00 am México\n` +
        `» .programargrupo zona America/Mexico_City\n\n` +
        `*Ejemplos:*\n` +
        `• .programargrupo abrir 7:45 am\n` +
        `• .programargrupo cerrar 11:15 pm\n` +
        `• .programargrupo abrir 8:30 am cerrar 10:00 pm\n` +
        `• .programargrupo abrir 8:30 cerrar 10:00 pm México\n` +
        `• .programargrupo zona America/Bogota\n\n` +
        `⏰ *Puedes usar hora y minutos, y puedes poner am o pm solo al final.*\n` +
        `🌎 *Zonas soportadas:* México, Bogota, Lima, Argentina`,
      quoted: msg
    });
  }

  let data = cargarHorarios();
  if (!data[chatId]) data[chatId] = {};
  let msgBonito = "🕑 *Nuevos horarios programados:*\n";

  if (abrirMatch) {
    let horaStr = abrirMatch[1].trim();
    if (!horaStr.match(/am|pm/i) && cerrarMatch?.[2]) {
      horaStr += ` ${cerrarMatch[2]}`;
    }
    const hora24 = convertirHora(horaStr);
    if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para abrir.*\nEjemplo: 7:30 am", quoted: msg });
    data[chatId].abrir = hora24;
    msgBonito += `🌤️  Abrir grupo: *${formatearHora12(hora24)}* (${hora24})\n`;
  }

  if (cerrarMatch) {
    let horaStr = cerrarMatch[1].trim();
    if (!horaStr.match(/am|pm/i) && abrirMatch?.[2]) {
      horaStr += ` ${abrirMatch[2]}`;
    }
    const hora24 = convertirHora(horaStr);
    if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para cerrar.*\nEjemplo: 11:15 pm", quoted: msg });
    data[chatId].cerrar = hora24;
    msgBonito += `🌙  Cerrar grupo: *${formatearHora12(hora24)}* (${hora24})\n`;
  }

  if (zonaDetectada) data[chatId].zona = zonaDetectada;
  if (!data[chatId].zona) data[chatId].zona = "America/Mexico_City";

  guardarHorarios(data);

  msgBonito += `\n🌎 Zona horaria: *${data[chatId].zona}*`;
  msgBonito += "\n🔄 *El bot abrirá y cerrará el grupo automáticamente a esas horas!*";

  await conn.sendMessage(chatId, { text: msgBonito, quoted: msg });
};

handler.command = ["programargrupo"];
handler.tags = ["group"];
handler.help = [
  "programargrupo abrir HH:MM am/pm cerrar HH:MM am/pm",
  "programargrupo abrir HH:MM cerrar HH:MM am/pm México",
  "programargrupo zona America/Mexico_City"
];
module.exports = handler;