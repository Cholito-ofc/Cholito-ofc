const fs = require("fs");
const path = require("path");

const welcomeDBPath = path.resolve("./welcome_groups.json");
let welcomeGroups = fs.existsSync(welcomeDBPath)
  ? JSON.parse(fs.readFileSync(welcomeDBPath, "utf-8"))
  : {};

function saveWelcomeDB() {
  fs.writeFileSync(welcomeDBPath, JSON.stringify(welcomeGroups, null, 2));
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  if (!isGroup) return; // Solo grupos

  const action = (args[0] || "").toLowerCase();
  if (!["on", "off", "teston", "testoff"].includes(action)) {
    return conn.sendMessage(chatId, {
      text: "🟢 *Uso correcto:* welcome on/off\n🧪 *Test Bot:* welcome teston/testoff",
      quoted: msg
    });
  }

  // Solo admins pueden activar/desactivar
  const metadata = await conn.groupMetadata(chatId);
  const senderId = msg.key.participant || msg.key.remoteJid;
  const participant = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
  if (!isAdmin) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo los administradores pueden activar/desactivar el welcome o el test Bot.*",
      quoted: msg
    });
  }

  if (action === "on") {
    welcomeGroups[chatId] = welcomeGroups[chatId] || {};
    welcomeGroups[chatId].welcome = true;
    saveWelcomeDB();
    return conn.sendMessage(chatId, {
      text: "✅ *Welcome activado!*",
      quoted: msg
    });
  }
  if (action === "off") {
    welcomeGroups[chatId] = welcomeGroups[chatId] || {};
    welcomeGroups[chatId].welcome = false;
    saveWelcomeDB();
    return conn.sendMessage(chatId, {
      text: "❌ *Welcome desactivado!*",
      quoted: msg
    });
  }
  if (action === "teston") {
    welcomeGroups[chatId] = welcomeGroups[chatId] || {};
    welcomeGroups[chatId].testBot = true;
    saveWelcomeDB();
    return conn.sendMessage(chatId, {
      text: "✅ *Test Bot activado!*",
      quoted: msg
    });
  }
  if (action === "testoff") {
    welcomeGroups[chatId] = welcomeGroups[chatId] || {};
    welcomeGroups[chatId].testBot = false;
    saveWelcomeDB();
    return conn.sendMessage(chatId, {
      text: "❌ *Test Bot desactivado!*",
      quoted: msg
    });
  }
};

handler.command = ["welcom"];
handler.tags = ["group"];
handler.help = ["welcome on/off/teston/testoff"];

// CORRECCIÓN AQUÍ: Manejo correcto del evento group-participants.update de Baileys
handler.participantsUpdate = async (update, { conn }) => {
  const { id, participants, action } = update;
  if (action !== "add") return; // Solo cuando alguien entra

  if (!welcomeGroups[id]?.welcome) return;

  const metadata = await conn.groupMetadata(id);
  const groupName = metadata.subject;
  const groupDesc = metadata.desc || "Sin descripción.";

  for (const user of participants) {
    const username = "@" + user.split("@")[0];

    let welcomeMsg = `👋 ¡Bienvenid@ ${username}!\n*Grupo:* ${groupName}\n*Descripción:* ${groupDesc}`;
    if (welcomeGroups[id]?.testBot) welcomeMsg += `\n🧪 *Test Bot activo en este grupo.*`;

    await conn.sendMessage(id, {
      text: welcomeMsg,
      mentions: [user]
    });
  }
};

module.exports = handler;