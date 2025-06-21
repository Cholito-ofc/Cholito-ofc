const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
const horariosPath = path.resolve("./horarios_grupo.json");

// Obtiene la hora actual en formato HH:MM para una zona horaria específica
function horaGrupo(zona) {
    try {
        const now = DateTime.now().setZone(zona);
        return `${now.hour.toString().padStart(2, "0")}:${now.minute.toString().padStart(2, "0")}`;
    } catch (e) {
        // Si la zona falla, usa UTC
        const now = DateTime.now().setZone("UTC");
        return `${now.hour.toString().padStart(2, "0")}:${now.minute.toString().padStart(2, "0")}`;
    }
}

// Cambia el estado del grupo a abierto o cerrado y envía mensaje
async function cambiarEstadoGrupo(conn, chatId, abrirGrupo) {
    try {
        await conn.groupSettingUpdate(chatId, abrirGrupo ? "not_announcement" : "announcement");
        await conn.sendMessage(chatId, {
            text: abrirGrupo
                ? "🔓 *El grupo ha sido ABIERTO automáticamente por horario programado!*"
                : "🔒 *El grupo ha sido CERRADO automáticamente por horario programado!*"
        });
    } catch (e) {
        // Si el bot no es admin o hay otro error, simplemente ignora
        // console.error(`Error cambiando estado del grupo ${chatId}:`, e);
    }
}

// Loop principal: revisa cada minuto si debe abrir o cerrar
function iniciarAutoHorario(conn) {
    setInterval(async () => {
        let horarios = {};
        try {
            if (fs.existsSync(horariosPath)) {
                horarios = JSON.parse(fs.readFileSync(horariosPath, "utf-8"));
            }
        } catch { return; }

        for (const chatId in horarios) {
            let { abrir, cerrar, zona } = horarios[chatId] || {};
            if (!zona) zona = "America/Mexico_City"; // Zona por defecto

            const actual = horaGrupo(zona);

            if (abrir && abrir === actual)
                await cambiarEstadoGrupo(conn, chatId, true);
            if (cerrar && cerrar === actual)
                await cambiarEstadoGrupo(conn, chatId, false);
        }
    }, 60 * 1000); // Cada minuto
}

module.exports = { iniciarAutoHorario };