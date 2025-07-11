const handler = async (m, { conn }) => { let chat = global.db.data.chats[m.chat]; try { let text = m.text.toLowerCase();

if (chat.audios) {
  switch (text) {
    case 'tarado':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/CoOd.mp3', 'tarado.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'teamo':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://cdn.russellxz.click/4a69e7be.mp3', 'teamo.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'tka':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/jakw.mp3', 'tka.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'hey':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/AaBt.mp3', 'hey.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'freefire':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/Dwqp.mp3', 'freefire.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'feriado':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/mFCT.mp3', 'feriado.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'aguanta':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/Qmz.mp3', 'aguanta.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'niconico':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/YdVq.mp3', 'niconico.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'buen dia grupo':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/GoKq.mp3', 'buen_dia_grupo.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'calla fan de bts':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/oqNf.mp3', 'calla_fan_bts.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'cambiate a movistar':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/RxJC.mp3', 'cambiate_movistar.mp3', null, m, true, { type: 'audioMessage' });
      break;

    case 'omg':
      await conn.sendPresenceUpdate('recording', m.chat);
      await conn.sendFile(m.chat, 'https://qu.ax/PfuN.mp3', 'omg.mp3', null, m, true, { type: 'audioMessage' });
      break;

    // ... Agregar todos los demás audios igual (puedo continuarlo si querés)

    default:
      // No hacer nada si no coincide
      break;
  }
}

} catch (err) { console.error(err); m.reply('❌ Ocurrió un error al enviar el audio.'); } };

handler.customPrefix = /^(tarado|teamo|tka|hey|freefire|feriado|aguanta|niconico|buen dia grupo|calla fan de bts|cambiate a movistar|omg)$/i;

