const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "grupos_autorizados.json");

// Asegura que el archivo JSON exista
const ensureFile = () => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
};

// Verifica si un grupo está autorizado
const isGrupoAutorizado = (groupID) => {
  ensureFile();
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data.includes(groupID);
  } catch {
    return false;
  }
};

// Agrega el grupo al archivo
const autorizarGrupo = (groupID) => {
  ensureFile();
  let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data.includes(groupID)) {
    data.push(groupID);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
};

// Elimina el grupo del archivo
const desautorizarGrupo = (groupID) => {
  ensureFile();
  let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (data.includes(groupID)) {
    data = data.filter(id => id !== groupID);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  }
  return false;
};

// Handler único
const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  const texto = msg.body?.toLowerCase() || msg.message?.conversation?.toLowerCase() || "";

  // Si es grupo y NO está autorizado
  if (isGroup && !isGrupoAutorizado(chatId)) {
    // Solo permitir el comando /autorizargrupo
    if (!texto.startsWith("/autorizargrupo")) {
      await conn.sendMessage(chatId, {
        text: "⛔ *Bot no autorizado en este grupo.*\n\nUn *administrador* puede usar:\n\n*/autorizargrupo*"
      }, { quoted: msg });
      return;
    }
  }

  // ----------------------------
  // Comando: /autorizargrupo
  // ----------------------------
  if (isGroup && texto.startsWith("/autorizargrupo")) {
    let metadata;
    try {
      metadata = await conn.groupMetadata(chatId);
    } catch {
      return await conn.sendMessage(chatId, {
        text: "❌ No se pudo obtener información del grupo."
      }, { quoted: msg });
    }

    const isAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === "admin" || p.admin === "superadmin"));

    if (!isAdmin) {
      return await conn.sendMessage(chatId, {
        text: "🚫 Solo los *administradores* del grupo pueden autorizar el bot."
      }, { quoted: msg });
    }

    if (autorizarGrupo(chatId)) {
      return await conn.sendMessage(chatId, {
        text: "✅ *Grupo autorizado correctamente.* El bot ahora está activo aquí."
      }, { quoted: msg });
    } else {
      return await conn.sendMessage(chatId, {
        text: "ℹ️ Este grupo ya estaba autorizado."
      }, { quoted: msg });
    }
  }

  // ----------------------------
  // Comando: /desautorizargrupo
  // ----------------------------
  if (isGroup && texto.startsWith("/desautorizargrupo")) {
    let metadata;
    try {
      metadata = await conn.groupMetadata(chatId);
    } catch {
      return await conn.sendMessage(chatId, {
        text: "❌ No se pudo obtener información del grupo."
      }, { quoted: msg });
    }

    const isAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === "admin" || p.admin === "superadmin"));

    if (!isAdmin) {
      return await conn.sendMessage(chatId, {
        text: "🚫 Solo los *administradores* del grupo pueden desautorizar al bot."
      }, { quoted: msg });
    }

    if (desautorizarGrupo(chatId)) {
      return await conn.sendMessage(chatId, {
        text: "✅ *Grupo desautorizado correctamente.* El bot dejará de responder aquí."
      }, { quoted: msg });
    } else {
      return await conn.sendMessage(chatId, {
        text: "ℹ️ Este grupo ya estaba desautorizado o no estaba registrado."
      }, { quoted: msg });
    }
  }

  // Si llega aquí, el grupo está autorizado
  // Puedes seguir procesando comandos aquí
};

handler.command = ['autorizargrupo', 'desautorizargrupo'];
module.exports = handler;