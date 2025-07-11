const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    await conn.sendMessage(chatId, {
      text: "🚫 Este comando solo está disponible en *grupos*. Actívalo donde se necesite.",
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
      text: "🛑 Solo *admins*, el *owner* o el *bot* pueden usar este comando.",
    }, { quoted: msg });
    return;
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, {
      text: `🎮 *Modo RPG Killua*\n\nUsa:\n*${prefix}rpgkillua on*  para activar\n*${prefix}rpgkillua off*  para desactivar`,
    }, { quoted: msg });
    return;
  }

  const activosPath = path.resolve("./activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.rpgazura) activos.rpgazura = {};

  if (args[0].toLowerCase() === "on") {
    activos.rpgazura[chatId] = true;
    await conn.sendMessage(chatId, {
      text: "\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈* 𝖱𝗉𝗀𝗄𝗂𝗅𝗅𝗎𝖺
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈 :* 𝖠𝖼𝗍𝗂𝗏𝖺𝖽𝗈
*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖠𝖼𝗍𝗂𝗏𝖺 𝗅𝗈𝗌 𝗃𝗎𝖾𝗀𝗈𝗌 𝗋𝗉𝗀
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*",
    }, { quoted: msg });
  } else {
    delete activos.rpgazura[chatId];
    await conn.sendMessage(chatId, {
      text: "\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈* 𝖱𝗉𝗀𝗄𝗂𝗅𝗅𝗎𝖺
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈 :* 𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈
*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺 𝗅𝗈𝗌 𝗃𝗎𝖾𝗀𝗈𝗌 𝗋𝗉𝗀
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*",
    }, { quoted: msg });
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key },
  });
};

handler.command = ["rpgkillua"];
module.exports = handler;
