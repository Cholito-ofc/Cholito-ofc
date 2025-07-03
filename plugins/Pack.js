const packUrls = [
  "https://cdn.russellxz.click/30302e59.jpeg",
  "https://cdn.russellxz.click/5b056ca3.jpeg",
  "https://cdn.russellxz.click/56b2e2b4.jpeg",
  "https://cdn.russellxz.click/556fa4bc.jpeg",
  // Puedes agregar más URLs aquí
];

let cachePack = {}; // Guarda mensajes activos { idMensaje: { chatId, sender } }
let usosPackUsuario = {}; // Contador reacciones por usuario

const handler = async (msg, { conn }) => {
  try {
    // Inicializa global.db si no existe para evitar errores
    if (!global.db) global.db = {};
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.chats) global.db.data.chats = {};

    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const chat = global.db.data.chats[chatId] || {};

    if (!chat.modohorny) {
      return await conn.sendMessage(chatId, {
        text: "🔞 El modo *NSFW* está desactivado en este grupo.",
      }, { quoted: msg });
    }

    // Reacción de "procesando"
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    // Elegir URL aleatoria
    const url = packUrls[Math.floor(Math.random() * packUrls.length)];

    // Enviar imagen
    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🔥 Reacciona a esta imagen para ver otro pack.",
    }, { quoted: msg });

    // Reacción de "listo"
    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    // Guardar mensaje para seguimiento de reacciones
    cachePack[sentMsg.key.id] = {
      chatId,
      sender,
    };

    // Inicializar contador si no existe
    usosPackUsuario[sender] = usosPackUsuario[sender] || 0;

  } catch (e) {
    console.error("❌ Error en comando .pack:", e);
    await msg.reply("❌ No se pudo obtener el pack.");
  }
};

// Escuchar las reacciones solo una vez
let listenerRegistrado = false;

function registerPackListener(conn) {
  if (listenerRegistrado) return;
  listenerRegistrado = true;

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message?.reactionMessage) return;

    const reaction = m.message.reactionMessage;
    const reactedMsgId = reaction.key?.id;
    const user = m.key.participant || m.key.remoteJid;

    if (!cachePack[reactedMsgId]) return;
    if (user !== cachePack[reactedMsgId].sender) return; // Solo el que usó el comando puede reaccionar

    if ((usosPackUsuario[user] || 0) >= 3) {
      return await conn.sendMessage(cachePack[reactedMsgId].chatId, {
        text: "❌ Ya viste suficiente por ahora. Espera 5 minutos para seguir viendo 🔥.",
        mentions: [user],
      });
    }

    const { chatId } = cachePack[reactedMsgId];
    const newUrl = packUrls[Math.floor(Math.random() * packUrls.length)];

    const newMsg = await conn.sendMessage(chatId, {
      image: { url: newUrl },
      caption: "🔥 Otro pack más... Reacciona de nuevo si quieres otro.",
    });

    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: newMsg.key,
      },
    });

    // Actualizar cache y contador
    cachePack[newMsg.key.id] = {
      chatId,
      sender: user,
    };
    delete cachePack[reactedMsgId];

    usosPackUsuario[user] = (usosPackUsuario[user] || 0) + 1;

    // Reset contador después de 5 minutos
    setTimeout(() => {
      usosPackUsuario[user] = 0;
    }, 5 * 60 * 1000);
  });
}

handler.command = ["pack"];
handler.tags = ["nsfw"];
handler.help = ["pack"];

module.exports = { handler, registerPackListener };