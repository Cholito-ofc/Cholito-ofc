const fs = require("fs");
const path = require("path");

const authPath = path.resolve("./authgroups.json");

function loadAuthGroups() {
  return fs.existsSync(authPath) ? JSON.parse(fs.readFileSync(authPath)) : [];
}

function saveAuthGroups(data) {
  fs.writeFileSync(authPath, JSON.stringify(data, null, 2));
}

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isGroup) {
    return conn.sendMessage(chatId, { text: "📛 Este comando solo se puede usar en grupos." }, { quoted: msg });
  }

  if (!isOwner) {
    return conn.sendMessage(chatId, { text: "🚫 Solo el *owner* del bot puede usar este comando." }, { quoted: msg });
  }

  let authGroups = loadAuthGroups();

  if (msg.body?.startsWith("/autorizagrupo")) {
    if (authGroups.includes(chatId)) {
      return conn.sendMessage(chatId, { text: "✅ Este grupo ya está autorizado." }, { quoted: msg });
    }
    authGroups.push(chatId);
    saveAuthGroups(authGroups);
    return conn.sendMessage(chatId, { text: "🔓 *Grupo autorizado correctamente.*" }, { quoted: msg });
  }

  if (msg.body?.startsWith("/desautorizagrupo")) {
    if (!authGroups.includes(chatId)) {
      return conn.sendMessage(chatId, { text: "⚠️ Este grupo no estaba autorizado." }, { quoted: msg });
    }
    authGroups = authGroups.filter(id => id !== chatId);
    saveAuthGroups(authGroups);
    return conn.sendMessage(chatId, { text: "🔒 *Grupo desautorizado correctamente.*" }, { quoted: msg });
  }
};

handler.command = ["autorizagrupo", "desautorizagrupo"];
module.exports = handler;