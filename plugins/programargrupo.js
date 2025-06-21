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

    // Permitir cambiar zona horaria: .programargrupo zona America/Mexico_City
    if (args[0] && args[0].toLowerCase() === "zona") {
        const zona = args[1];
        if (!zonas.includes(zona)) {
            return conn.sendMessage(chatId, {
                text: `❌ *Zona horaria no soportada.*\n*Soportadas:* ${zonas.map(z=>`\n• ${z}`).join("")}`,
                quoted: msg
            });
        }
        let data = cargarHorarios();
        if (!data[chatId]) data[chatId] = {};
        data[chatId].zona = zona;
        guardarHorarios(data);
        return conn.sendMessage(chatId, {
            text: `🌎 *Zona horaria del grupo configurada a:* _${zona}_`,
            quoted: msg
        });
    }

    // --- PERSONALIZADO: Permitir "abrir 8:00 cerrar 8:10 am México" ---
    const text = args.join(" ").trim().toLowerCase();

    // Detectar si hay una zona horaria al final tipo "méxico"
    let zonaDetectada;
    for (let alias in zonasAlias) {
        if (text.endsWith(alias)) {
            zonaDetectada = zonasAlias[alias];
            break;
        }
    }

    let comando = text;
    if (zonaDetectada) {
        comando = comando.replace(new RegExp(`\\s*${Object.keys(zonasAlias).join("|")}$`, "i"), "").trim();
    }

    // Ver si am/pm solo viene al final
    let ampmMatch = comando.match(/\b(am|pm)\b$/i);
    let ampm = ampmMatch ? ampmMatch[1].toLowerCase() : null;
    let abrir, cerrar;

    if (ampm) {
        // Buscar abrir/cerrar HH:MM y aplicar el am/pm final a ambos
        abrir = comando.match(/abrir\s+(\d{1,2}:\d{2})/i);
        cerrar = comando.match(/cerrar\s+(\d{1,2}:\d{2})/i);
        if (abrir) abrir[1] = abrir[1] + " " + ampm;
        if (cerrar) cerrar[1] = cerrar[1] + " " + ampm;
    } else {
        // Formato clásico: abrir 8:00 am cerrar 8:10 pm
        abrir = comando.match(/abrir\s+(\d{1,2}:\d{2}\s*(?:am|pm))/i);
        cerrar = comando.match(/cerrar\s+(\d{1,2}:\d{2}\s*(?:am|pm))/i);
    }

    if (!abrir && !cerrar) {
        return conn.sendMessage(chatId, {
            text: `🌅 *Programación de grupo*\n\n` +
                  `*Uso correcto:*\n` +
                  `» .programargrupo abrir 8:00 am cerrar 10:30 pm\n` +
                  `» .programargrupo abrir 8:00 cerrar 10:30 pm\n` +
                  `» .programargrupo abrir 8:00 cerrar 8:10 am México\n` +
                  `» .programargrupo zona America/Mexico_City\n\n` +
                  `*Ejemplos:*\n` +
                  `• .programargrupo abrir 7:45 am\n` +
                  `• .programargrupo cerrar 11:15 pm\n` +
                  `• .programargrupo abrir 8:30 am cerrar 10:00 pm\n` +
                  `• .programargrupo abrir 8:30 cerrar 10:00 pm México\n` +
                  `• .programargrupo zona America/Bogota\n\n` +
                  `⏰ *Puedes usar hora y minutos, y puedes poner am o pm solo al final.*\n` +
                  `🌎 *Zonas soportadas:* ${zonas.map(z=>`\n• ${z}`).join("")}`,
            quoted: msg
        });
    }

    let data = cargarHorarios();
    if (!data[chatId]) data[chatId] = {};
    let msgBonito = "🕑 *Nuevos horarios programados:*\n";

    if (abrir) {
        const hora24 = convertirHora(abrir[1].trim());
        if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para abrir.*\nEjemplo: 7:30 am", quoted: msg });
        data[chatId].abrir = hora24;
        msgBonito += `🌤️  Abrir grupo: *${abrir[1].toUpperCase()}* (${hora24})\n`;
    }
    if (cerrar) {
        const hora24 = convertirHora(cerrar[1].trim());
        if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para cerrar.*\nEjemplo: 11:15 pm", quoted: msg });
        data[chatId].cerrar = hora24;
        msgBonito += `🌙  Cerrar grupo: *${cerrar[1].toUpperCase()}* (${hora24})\n`;
    }

    if (zonaDetectada) {
        data[chatId].zona = zonaDetectada;
    }
    if (!data[chatId].zona) data[chatId].zona = "America/Mexico_City"; // Default México

    guardarHorarios(data);

    msgBonito += `\n🌎 Zona horaria: *${data[chatId].zona}*`;
    msgBonito += "\n🔄 *El bot abrirá y cerrará el grupo automáticamente a esas horas!*";
    await conn.sendMessage(chatId, { text: msgBonito, quoted: msg });
};

handler.command = ["programargrupo"];
handler.tags = ["group"];
handler.help = ["programargrupo abrir HH:MM am/pm cerrar HH:MM am/pm", "programargrupo abrir HH:MM cerrar HH:MM am/pm México", "programargrupo zona America/Mexico_City"];
module.exports = handler;