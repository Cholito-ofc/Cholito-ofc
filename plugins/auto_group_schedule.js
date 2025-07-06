const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");

const horariosPath = path.resolve("./horarios_grupo.json");

// 🕒 Obtener hora actual en formato HH:MM
function horaGrupo(zona) {
    try {
        const now = DateTime.now().setZone(zona);
        return `${now.hour.toString().padStart(2, "0")}:${now.minute.toString().padStart(2, "0")}`;
    } catch {
        const now = DateTime.now().setZone("UTC");
        return `${now.hour.toString().padStart(2, "0")}:${now.minute.toString().padStart(2, "0")}`;
    }
}

// 🧮 Calcular diferencia de tiempo entre ahora y destino (formato HH:MM)
function tiempoRestante(actual, destino) {
    const [hA, mA] = actual.split(":").map(Number);
    const [hD, mD] = destino.split(":").map(Number);

    let minutosA = hA * 60 + mA;
    let minutosD = hD * 60 + mD;

    let diff = minutosD - minutosA;
    if (diff <= 0) diff += 1440; // sumar 24h si ya pasó la hora

    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;

    if (horas && minutos) return `${horas}h ${minutos}m`;
    if (horas) return `${horas}h`;
    return `${minutos}m`;
}

// 🔐 Cambiar estado del grupo (abrir o cerrar)
async function cambiarEstadoGrupo(conn, chatId, abrirGrupo, siguienteCambio, zona) {
    try {
        await conn.groupSettingUpdate(chatId, abrirGrupo ? "not_announcement" : "announcement");

        const actual = horaGrupo(zona);
        const tiempo = tiempoRestante(actual, siguienteCambio);

        const mensaje = abrirGrupo
            ? `╭─⏰ *HORARIO AUTOMÁTICO* ⏰
│
├ 🔓 *El grupo ha sido ABIERTO automáticamente*
│
├ ✅ *ORDEN EJECUTADA* ✅
│
\`\`\`⏳ Se volverá a cerrar en: ${tiempo}\`\`\`
╰────────────────────╯`
            : `╭─⏰ *HORARIO AUTOMÁTICO* ⏰
│
├ 🔒 *El grupo ha sido CERRADO automáticamente*
│
├ ✅ *ORDEN EJECUTADA* ✅
│
\`\`\`⏳ Se volverá a abrir en: ${tiempo}\`\`\`
╰────────────────────╯`;

        await conn.sendMessage(chatId, { text: mensaje });

    } catch (e) {
        // console.warn(`⚠️ Error al cambiar estado del grupo:`, e);
    }
}

// ⏳ Bucle principal
function iniciarAutoHorario(conn) {
    setInterval(async () => {
        let horarios = {};

        try {
            if (fs.existsSync(horariosPath)) {
                const data = fs.readFileSync(horariosPath, "utf-8");
                horarios = JSON.parse(data);
            }
        } catch (error) {
            console.error("❌ Error leyendo archivo de horarios:", error);
            return;
        }

        for (const chatId in horarios) {
            let { abrir, cerrar, zona } = horarios[chatId] || {};
            if (!zona) zona = "America/Mexico_City";

            const actual = horaGrupo(zona);

            if (abrir && abrir === actual) {
                await cambiarEstadoGrupo(conn, chatId, true, cerrar, zona);
            }

            if (cerrar && cerrar === actual) {
                await cambiarEstadoGrupo(conn, chatId, false, abrir, zona);
            }
        }
    }, 60 * 1000); // Cada minuto
}

module.exports = { iniciarAutoHorario };
