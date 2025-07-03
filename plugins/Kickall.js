const handler = async (msg, { conn, participants, isBotAdmin, isAdmin, isOwner }) => {
  const chatId = msg.key.remoteJid;

  // Verificar si es grupo
  if (!chatId.endsWith('@g.us')) return await conn.sendMessage(chatId, {
    text: '❌ *Este comando solo puede usarse en grupos.*'
  }, { quoted: msg });

  // Verificar permisos
  if (!isBotAdmin) return await conn.sendMessage(chatId, {
    text: '❌ *Necesito ser administrador para ejecutar esta acción.*'
  }, { quoted: msg });

  if (!(isOwner || isAdmin)) return await conn.sendMessage(chatId, {
    text: '❌ *Solo los administradores pueden usar este comando.*'
  }, { quoted: msg });

  // Obtener ID del bot
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // Filtrar miembros a expulsar (no admins, no el bot)
  const kickList = participants
    .filter(p => !p.admin && p.id !== botNumber)
    .map(p => p.id);

  if (kickList.length === 0) {
    return await conn.sendMessage(chatId, {
      text: '⚠️ *No hay miembros que se puedan expulsar.*'
    }, { quoted: msg });
  }

  // Enviar mensaje de advertencia
  const confirmMsg = await conn.sendMessage(chatId, {
    text: `⚠️ *Estás por expulsar a ${kickList.length} miembro(s).*  
✅ Reacciona con *✅* para confirmar.  
❌ Reacciona con *❌* para cancelar.`,
    mentions: [msg.sender]
  }, { quoted: msg });

  // Reaccionar con ✅
  await conn.sendMessage(chatId, {
    react: { text: '✅', key: confirmMsg.key }
  });

  // Reaccionar con ❌
  await conn.sendMessage(chatId, {
    react: { text: '❌', key: confirmMsg.key }
  });

  // Esperar confirmación (máximo 15 segundos)
  const reactionCollector = async () => {
    return new Promise((resolve) => {
      const listener = async (reactionMsg) => {
        if (
          reactionMsg.key.id === confirmMsg.key.id &&
          reactionMsg.sender === msg.sender
        ) {
          const emoji = reactionMsg.message?.reaction?.text;
          if (emoji === '✅') {
            conn.ev.off('messages.reaction', listener);
            resolve(true);
          } else if (emoji === '❌') {
            conn.ev.off('messages.reaction', listener);
            resolve(false);
          }
        }
      };

      conn.ev.on('messages.reaction', listener);

      // Auto cancelar en 15s
      setTimeout(() => {
        conn.ev.off('messages.reaction', listener);
        resolve(false);
      }, 15000);
    });
  };

  const confirmado = await reactionCollector();

  if (!confirmado) {
    await conn.sendMessage(chatId, {
      text: '❌ *Acción cancelada.*'
    }, { quoted: msg });
    return;
  }

  await conn.sendMessage(chatId, {
    text: `🧨 *Expulsando ${kickList.length} miembro(s)...*`
  });

  // Expulsar uno por uno
  for (let id of kickList) {
    try {
      await conn.groupParticipantsUpdate(chatId, [id], 'remove');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`❌ Error al expulsar ${id}:`, err);
    }
  }

  await conn.sendMessage(chatId, {
    text: '✅ *Expulsión completa.*'
  });

};

handler.command = ['kickall', 'banall'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;