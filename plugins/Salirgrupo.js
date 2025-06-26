const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(" ").trim();
  const ownerNumber = global.owner[0]?.[0] + "@s.whatsapp.net";

  if (sender !== ownerNumber) {
    return conn.sendMessage(chatId, {
      text: "🚫 Este comando solo puede ser usado por el *owner principal*.",
    }, { quoted: msg });
  }

  // Obtener lista de grupos activos donde el bot está
  const grupos = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.subject)
    .map(([jid, chat]) => ({ id: jid, name: chat.subject }));

  // Si no hay número → mostrar lista de grupos
  if (!text) {
    if (grupos.length === 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ El bot no está en ningún grupo actualmente.",
      }, { quoted: msg });
    }

    const lista = grupos.map((g, i) => `*${i + 1}.* ${g.name}`).join("\n");
    return conn.sendMessage(chatId, {
      text: `📋 *Lista de grupos donde está el bot:*\n\n${lista}`,
    }, { quoted: msg });
  }

  // Si se pasa número → salir del grupo correspondiente
  const numero = parseInt(text);
  if (isNaN(numero) || numero < 1 || numero > grupos.length) {
    return conn.sendMessage(chatId, {
      text: `❌ Número inválido. Usa un número entre 1 y ${grupos.length}.`,
    }, { quoted: msg });
  }

  const grupo = grupos[numero - 1];

  // Mensaje de salida en el grupo destino
  await conn.sendMessage(grupo.id, {
    text: '👋 El bot ha sido removido por el owner principal.',
  });

  // Salir del grupo
  await conn.groupLeave(grupo.id);

  // Confirmar al owner
  await conn.sendMessage(chatId, {
    text: `✅ El bot ha salido correctamente del grupo *${grupo.name}*.`,
  }, { quoted: msg });
};

handler.command = ['salirgrupo'];
module.exports = handler;