const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    await conn.sendMessage(chatId, {
      text: `
╭┈〔 ⚠️ *SOLO PARA GRUPOS* 〕┈╮
┊ Este comando solo puede usarse dentro de *grupos*.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
      `.trim()
    }, { quoted: msg });
    return;
  }

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";
  const isOwner = global.owner.some(([id]) => id === senderClean);
  const isFromMe = msg.key.fromMe;

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: `
╭┈〔 ⛔ *ACCESO DENEGADO* 〕┈╮
┊ Solo los *administradores*, el *owner*
┊ o el *bot* pueden ejecutar este comando.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
      `.trim()
    }, { quoted: msg });
    return;
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, {
      text: `
╭┈〔 ⚙️ *USO INCORRECTO* 〕┈╮
┊ Activa o desactiva las *despedidas*:
┊
┊ 🟢 ${global.prefix}despedidas on
┊ 🔴 ${global.prefix}despedidas off
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
      `.trim()
    }, { quoted: msg });
    return;
  }

  const activosPath = path.resolve("activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.despedidas) activos.despedidas = {};

  let mensaje = "";

  if (args[0].toLowerCase() === "on") {
    activos.despedidas[chatId] = true;
    mensaje = `
╭┈〔 ✅ *DESPEDIDAS ACTIVADAS* 〕┈╮
┊ Ahora se enviarán *mensajes de despedida*
┊ cuando un usuario abandone el grupo.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
    `.trim();
  } else {
    delete activos.despedidas[chatId];
    mensaje = `
╭┈〔 🛑 *DESPEDIDAS DESACTIVADAS* 〕┈╮
┊ Los mensajes de *despedida* fueron
┊ desactivados en este grupo.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫
    `.trim();
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  await conn.sendMessage(chatId, {
    text: mensaje
  }, { quoted: msg });

  // Reacción ✅
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["despedidas"];
module.exports = handler;