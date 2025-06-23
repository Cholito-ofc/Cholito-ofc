const fs = require("fs");
const path = require("path");

const emojiPath = path.resolve("./emoji.json");

// Utilidad para obtener bandera según código de país
function getFlagFromNumber(number) {
  const countryFlags = {
    "504": "🇭🇳", "502": "🇬🇹", "503": "🇸🇻", "505": "🇳🇮", "506": "🇨🇷",
    "507": "🇵🇦", "51": "🇵🇪", "52": "🇲🇽", "54": "🇦🇷", "55": "🇧🇷",
    "56": "🇨🇱", "57": "🇨🇴", "58": "🇻🇪", "591": "🇧🇴", "593": "🇪🇨",
    "595": "🇵🇾", "34": "🇪🇸", "1": "🇺🇸"
  };
  const match = Object.keys(countryFlags).find(code => number.startsWith(code));
  return countryFlags[match] || "🌐";
}

// 🟢 .toemoji comando
if (msg.body?.startsWith(".toemoji")) {
  const chatId = msg.key.remoteJid;
  const args = msg.body.trim().split(" ").slice(1);
  const newEmoji = args[0];

  if (!newEmoji || newEmoji.length > 2) {
    await sock.sendMessage(chatId, {
      text: "⚠️ Especifica un emoji válido. Ejemplo: `.toemoji 🔥`"
    }, { quoted: msg });
    return;
  }

  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
  emojiData[chatId] = newEmoji;
  fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));

  await sock.sendMessage(chatId, {
    text: `✅ Emoji actualizado a: ${newEmoji}`
  }, { quoted: msg });
  return;
}

// 🔄 .resetemoji comando
if (msg.body?.startsWith(".resetemoji")) {
  const chatId = msg.key.remoteJid;
  const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};

  if (emojiData[chatId]) {
    delete emojiData[chatId];
    fs.writeFileSync(emojiPath, JSON.stringify(emojiData, null, 2));
    await sock.sendMessage(chatId, {
      text: "✅ Emoji restaurado a ➤"
    }, { quoted: msg });
  } else {
    await sock.sendMessage(chatId, {
      text: "ℹ️ Este grupo ya usa el emoji por defecto."
    }, { quoted: msg });
  }
  return;
}

// 🔊 .tagall / .invocar / .todos comando
switch (command) {
  case 'tagall':
  case 'invocar':
  case 'tod': {
    try {
      const chatId = msg.key.remoteJid;
      const sender = (msg.key.participant || msg.key.remoteJid).replace(/[^0-9]/g, "");
      const isGroup = chatId.endsWith("@g.us");
      const isBotMessage = msg.key.fromMe;

      await sock.sendMessage(chatId, { react: { text: "🔊", key: msg.key } });

      if (!isGroup) {
        await sock.sendMessage(chatId, { text: "⚠️ *Este comando solo se puede usar en grupos.*" }, { quoted: msg });
        return;
      }

      const metadata = await sock.groupMetadata(chatId);
      const participant = metadata.participants.find(p => p.id.includes(sender));
      const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

      if (!isAdmin && sender !== "50489513153" && !isBotMessage) {
        await sock.sendMessage(chatId, {
          text: "❌ *Este comando solo puede usarlo un administrador o el dueño del bot.*"
        }, { quoted: msg });
        return;
      }

      const emojiData = fs.existsSync(emojiPath) ? JSON.parse(fs.readFileSync(emojiPath)) : {};
      const usedEmoji = emojiData[chatId] || "➤";

      const participants = metadata.participants;
      const mentionList = participants.map(p => {
        const num = p.id.split("@")[0];
        const flag = getFlagFromNumber(num);
        return `${flag} ${usedEmoji} @${num}`;
      }).join("\n");

      const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      const args = messageText.trim().split(" ").slice(1);
      const extraMsg = args.join(" ");

      let finalMsg = `╔『 🔊 INVOCACIÓN MASIVA 』╗\n`;
      finalMsg += `╟🔹 *KILLUA 2.0 BOT PRESENTE*\n`;
      finalMsg += `╟👤 *Invocado por:* @${sender}\n`;
      if (extraMsg.length > 0) {
        finalMsg += `╟💬 *Mensaje:* ${extraMsg}\n`;
      }
      finalMsg += `╚═══════════════╝\n\n`;
      finalMsg += `📲 *Etiquetando a todos los miembros...*\n\n`;
      finalMsg += mentionList;

      const mentionIds = participants.map(p => p.id);

      await sock.sendMessage(chatId, {
        image: { url: "https://cdn.russellxz.click/c207ff27.jpeg" },
        caption: finalMsg,
        mentions: mentionIds
      }, { quoted: msg });

    } catch (error) {
      console.error("❌ Error en el comando tagall:", error);
      await sock.sendMessage(chatId, {
        text: "❌ *Ocurrió un error al ejecutar el comando tagall.*"
      }, { quoted: msg });
    }
    break;
  }
}