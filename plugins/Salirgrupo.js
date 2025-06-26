const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(" ").trim();

  // Limpiar formato para comparar el número
  const raw = sender.replace(/(@s\.whatsapp\.net|@lid)/g, '');
  const ownersPermitidos = ['31375424024748', '50489513153'];

  if (!ownersPermitidos.includes(raw)) {
    return conn.sendMessage(chatId, {
      text: "🚫 Este comando solo puede ser usado por el *owner principal autorizado*.",
    }, { quoted: msg });
  }

  const grupos = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.subject)
    .map(([jid, chat]) => ({ id: jid, name: chat.subject }));

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

  const numero = parseInt(text);
  if (isNaN(numero) || numero < 1 || numero > grupos.length) {
    return conn.sendMessage(chatId, {
      text: `❌ Número inválido. Usa un número entre 1 y ${grupos.length}.`,
    }, { quoted: msg });
  }

  const grupo = grupos[numero - 1];

  await conn.sendMessage(grupo.id, {
    text: '👋 El bot ha sido removido por el owner principal.',
  });

  await conn.groupLeave(grupo.id);

  await conn.sendMessage(chatId, {
    text: `✅ El bot ha salido correctamente del grupo *${grupo.name}*.`,
  }, { quoted: msg });
};

handler.command = ['salirgrupo'];
module.exports = handler;