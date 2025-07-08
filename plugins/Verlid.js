const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const text = msg.body || msg.message?.conversation || '';
  const command = text.split(' ')[0].slice(1).toLowerCase(); // extrae el comando sin punto

  if (!isGroup) {
    return await conn.sendMessage(chatId, {
      text: '❌ Este comando solo puede usarse en grupos.'
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(chatId, {
      react: { text: '🔍', key: msg.key }
    });

    if (command === 'verlid') {
      const metadata = await conn.groupMetadata(chatId);
      const participantes = metadata.participants || [];

      const conLib = [];
      const sinLib = [];

      for (const p of participantes) {
        const jid = p.id || '';
        if (jid.endsWith('@s.whatsapp.net')) {
          const numero = jid.split('@')[0];
          conLib.push(`➤ +${numero}`);
        } else if (jid.endsWith('@lid')) {
          sinLib.push(`➤ ${jid}`);
        }
      }

      const mensaje = `
╭━〔 *📊 𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖵𝖨𝖲𝖨𝖡𝖨𝖫𝖨𝖣𝖠𝖣* 〕━╮
┃ 👥 *𝖬𝗂𝖾𝗆𝖻𝗋𝗈𝗌 𝗍𝗈𝗍𝖺𝗅𝖾𝗌:* ${participantes.length}
┃ 
┃ ✅ *𝖵𝗂𝗌𝗂𝖻𝗅𝖾𝗌 (+𝖭𝗎́𝗆𝖾𝗋𝗈):* ${conLib.length}
┃ ${conLib.length ? conLib.join('\n┃ ') : '┃ ➤ 𝖭𝗂𝗇𝗀𝗎𝗇𝗈'}
┃ 
┃ ❌ *𝖮𝖼𝗎𝗅𝗍𝗈𝗌 (𝖨𝖣 - 𝖫𝖨𝖣):* ${sinLib.length}
┃ ${sinLib.length ? sinLib.join('\n┃ ') : '┃ ➤ 𝖭𝗂𝗇𝗀𝗎𝗇𝗈'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

📌 *Nota:* 𝖶𝗁𝖺𝗍𝗌𝖺𝗉𝗉 𝗈𝖼𝗎𝗅𝗍𝖺 𝖺𝗅𝗀𝗎𝗇𝗈𝗌 𝗇𝗎́𝗆𝖾𝗋𝗈𝗌 𝗉𝗈𝗋 𝖯𝗋𝗂𝗏𝖺𝖼𝗂𝖽𝖺𝖽 𝗎𝗌𝖺́𝗇𝖽𝗈 𝖾́𝗅 𝖿𝗈𝗋𝗆𝖺𝗍𝗈 *@lid*.

> 𝖯𝖺𝗋𝖺 𝗆𝖺́𝗌 𝗂𝗇𝖿𝗈𝗋𝗆𝖺𝖼𝗂𝗈́𝗇 𝗎𝗌𝖺 𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈  .𝗂𝗇𝖿𝗈𝗅𝗂𝖽
      `.trim();

      return await conn.sendMessage(chatId, { text: mensaje }, { quoted: msg });
    }

    if (command === 'infolid') {
      const textoInfo = `
📌 𝗥𝗲𝘀𝘂𝗺𝗲𝗻 𝘀𝗼𝗯𝗿𝗲 𝗲𝗹 𝗽𝗿𝗼𝗯𝗹𝗲𝗺𝗮 𝗱𝗲 𝗟𝗜𝗗 𝗲𝗻 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽

Desde hace un tiempo, 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 ha comenzado a ocultar algunos números de teléfono de los miembros de grupos, usando un sistema llamado *LID* (\`@lid\`).

🔐 ¿𝗤𝘂𝗲́ 𝗲𝘀 𝗟𝗜𝗗?
Es un formato que reemplaza el número real por una 𝗶𝗱𝗲𝗻𝘁𝗶𝗱𝗮𝗱 𝗮𝗻𝗼́𝗻𝗶𝗺𝗮 (ej: \`1234567890@lid\`). Esto protege la privacidad, pero 𝗮𝗳𝗲𝗰𝘁𝗮 𝗲𝗹 𝗳𝘂𝗻𝗰𝗶𝗼𝗻𝗮𝗺𝗶𝗲𝗻𝘁𝗼 𝗱𝗲 𝗹𝗼𝘀 𝗯𝗼𝘁𝘀.

🚫 ¿𝗤𝘂𝗲́ 𝗲𝗳𝗲𝗰𝘁𝗼𝘀 𝘁𝗶𝗲𝗻𝗲 𝗲𝗻 𝗲𝗹 𝗯𝗼𝘁?
- No puede expulsar, mencionar, advertir ni registrar usuarios con \`@lid\`.
- Algunos comandos fallan o no detectan al usuario correctamente.

🛠️ ¿𝗤𝘂𝗲́ 𝗽𝘂𝗲𝗱𝗲𝘀 𝗵𝗮𝗰𝗲𝗿?
- Ejecuta el comando *.verlid* para ver cuántos están ocultos.
- Pide a los miembros revisar su privacidad (Ajustes de cuenta).
- El bot sigue funcionando con los que tengan su número visible.

💡 𝗘𝘀𝘁𝗲 𝗽𝗿𝗼𝗯𝗹𝗲𝗺𝗮 𝗲𝘀 𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽, 𝗻𝗼 𝗱𝗲𝗹 𝗯𝗼𝘁.  
➤ \`𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗩𝗢\`  ❗

> 𝗞𝗶𝗹𝗹𝘂𝗮𝗕𝗼𝘁 𝘆𝗮 𝘁𝗶𝗲𝗻𝗲 𝘀𝗼𝗹𝘂𝗰𝗶𝗼𝗻𝗮𝗱𝗼 𝗹𝗼𝘀 𝗽𝗿𝗼𝗯𝗹𝗲𝗺𝗮𝘀 𝗱𝗲 @𝗹𝗶𝗱 𝗽𝗲𝗿𝗼 𝗽𝘀 𝗮𝗾𝘂𝗶́ 𝗾𝘂𝗲𝗱𝗼́ 𝗹𝗮 𝗮𝗰𝗹𝗮𝗿𝗮𝗰𝗶𝗼𝗻 𝗽𝗼𝗿 𝗰𝗼𝗻𝘁𝗮𝘀𝘁𝗲𝘀 𝗮𝗰𝘁𝘂𝗮𝗹𝗶𝘇𝗮𝗰𝗶𝗼́𝗻𝗲𝘀 𝗱𝗲 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝘆 𝘃𝘂𝗲𝗹𝘃𝗲 𝗮 𝗱𝗮𝗻̃𝗮𝗿 𝗹𝗼𝘀 𝗯𝗼𝘁𝘀, 𝗲𝘀𝗽𝗲𝗿𝗮𝗺𝗼𝘀 𝗻𝗼 𝗽𝗮𝘀𝗲 𝗲𝘀𝗼.
      `.trim();

      return await conn.sendMessage(chatId, { text: textoInfo }, { quoted: msg });
    }

  } catch (err) {
    console.error("❌ Error en el comando:", err);
    await conn.sendMessage(chatId, {
      text: '❌ Ocurrió un error al procesar el comando.'
    }, { quoted: msg });
  }
};

handler.command = ['verlid', 'infolid'];
module.exports = handler;