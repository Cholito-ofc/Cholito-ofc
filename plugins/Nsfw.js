const fs = require("fs");
const path = require("path");

let cacheHot = {};
let usosPorUsuario = {};
let reactionListenerAgregado = false;

const handler = async (msg, { conn, command }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  const isOwner = global.owner.some(([id]) => id === senderNum);

  const activosPath = path.resolve("activos.json");
  let activos = fs.existsSync(activosPath)
    ? JSON.parse(fs.readFileSync(activosPath, "utf-8"))
    : {};

  if (!activos.modocaliente || !activos.modocaliente[chatId]) {
    return await conn.sendMessage(chatId, {
      text: "🚫 El *modo caliente* no está activado en este grupo.\n\nUsa: *modocaliente on*",
    }, { quoted: msg });
  }

  const pack1 = [
    'https://cdn.russellxz.click/c369ab4a.jpeg',
    'https://cdn.russellxz.click/61b2ba1a.jpeg',
    'https://cdn.russellxz.click/f1a47198.jpeg',
    'https://cdn.russellxz.click/19fcba1b.jpeg', 
    'https://cdn.russellxz.click/800156c7.jpeg',  'https://cdn.russellxz.click/469b833a.jpeg'
  ];

  const pack2 = [
    'https://telegra.ph/file/c0da7289bee2d97048feb.jpg',
    'https://cdn.russellxz.click/fa8d098d.jpeg',
    'https://cdn.russellxz.click/fa8d098d.jpeg'
  ];

  const pack3 = [
    'https://telegra.ph/file/bf303b19b9834f90e9617.jpg',
    'https://telegra.ph/file/36ef2b807251dfccd17c2.jpg',
    'https://telegra.ph/file/bcc34403d16de829ea5d2.jpg'
  ];

  const videoxxx = [
    'https://cdn.russellxz.click/5666da3b.mp4',
    'https://cdn.russellxz.click/dfda5547.mp4',
    'https://cdn.russellxz.click/e7d16640.mp4',
    'https://cdn.russellxz.click/54a44e17.mp4',
    'https://cdn.russellxz.click/a7525131.mp4', 
    'https://cdn.russellxz.click/6a068771.mp4',
    'https://cdn.russellxz.click/b1c5b7cd.mp4', 
    'https://cdn.russellxz.click/63bdb5a2.mp4', 
    'https://cdn.russellxz.click/796715a2.mp4', 'https://cdn.russellxz.click/4379f692.mp4'
  ];

  const videoxxxlesbi = [
    'https://telegra.ph/file/2dfb1ad0cab22951e30d1.mp4',
'https://cdn.russellxz.click/a6594eb8.mp4',    'https://telegra.ph/file/c430651857023968d3a76.mp4',
    'https://telegra.ph/file/1ba17f6230dd1ea2de48c.mp4'
  ];

  const dataMap = {
    pack1,
    pack2,
    pack3,
    videoxxx,
    videoxxxlesbi,
  };

  const isVideo = command.startsWith("video");
  const contentArray = dataMap[command];
  const url = contentArray[Math.floor(Math.random() * contentArray.length)];

  // Reacción: procesando
  await conn.sendMessage(chatId, {
    react: { text: "🕒", key: msg.key }
  });

  const sentMsg = await conn.sendMessage(chatId, {
    [isVideo ? "video" : "image"]: { url },
    caption: `🥵 Reacciona a este mensaje para ver ${isVideo ? "otro video" : "otra imagen"}.`,
  }, { quoted: msg });

  // Reacción: enviado
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: sentMsg.key }
  });

  cacheHot[sentMsg.key.id] = {
    chatId,
    contentArray,
    isVideo,
    sender,
    isOwner
  };

  if (!isOwner) {
    usosPorUsuario[sender] = usosPorUsuario[sender] || 0;
  }

  // Solo una vez se registra el listener
  if (!reactionListenerAgregado) {
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;
      const userNum = user.replace(/[^0-9]/g, "");
      const esOwner = global.owner.some(([id]) => id === userNum);

      const cached = cacheHot[reactedMsgId];
      if (!cached) return;
      if (user !== cached.sender) return;

      if (!esOwner && (usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(cached.chatId, {
          text: `⛔ Ya viste suficiente por ahora.\n🕐 Espera *5 minutos* para continuar.`,
          mentions: [user],
        });
      }

      const { contentArray, isVideo } = cached;
      const nextUrl = contentArray[Math.floor(Math.random() * contentArray.length)];

      const newMsg = await conn.sendMessage(cached.chatId, {
        [isVideo ? "video" : "image"]: { url: nextUrl },
        caption: `🔥 Otra más...`,
      });

      await conn.sendMessage(cached.chatId, {
        react: { text: "✅", key: newMsg.key }
      });

      cacheHot[newMsg.key.id] = {
        chatId: cached.chatId,
        contentArray,
        isVideo,
        sender: user,
        isOwner: esOwner
      };

      delete cacheHot[reactedMsgId];

      if (!esOwner) {
        usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;
        setTimeout(() => {
          usosPorUsuario[user] = 0;
        }, 5 * 60 * 1000);
      }
    });

    reactionListenerAgregado = true;
  }
};

handler.command = [
  "pack1",
  "pack2",
  "pack3",
  "videoxxx",
  "videoxxxlesbi"
];
handler.tags = ["nsfw"];
handler.help = ["pack1", "pack2", "pack3", "videoxxx", "videoxxxlesbi"];
module.exports = handler;