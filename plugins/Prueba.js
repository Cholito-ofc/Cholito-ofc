const fs = require('fs');

global.pruebasActivas = global.pruebasActivas || {}; // persistente en runtime

const comandosPermitidosEnPrueba = ['menu', 'play', 'ping']; // Puedes agregar más

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // Solo permite al owner
  if (!global.owner.some(([id]) => id === senderNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *owner* del bot puede usar este comando."
    }, { quoted: msg });
  }

  const minutos = parseInt(args[0]);
  if (!minutos || isNaN(minutos) || minutos <= 0) {
    return conn.sendMessage(chatId, {
      text: "⏱️ Debes especificar un tiempo válido en minutos.\n\n*Ejemplo:* .prueba 20"
    }, { quoted: msg });
  }

  if (global.pruebasActivas[chatId]) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Ya hay una prueba activa en este grupo."
    }, { quoted: msg });
  }

  const tiempoExpira = Date.now() + minutos * 60 * 1000;

  global.pruebasActivas[chatId] = {
    expira: tiempoExpira,
    activadoPor: senderNum,
    comandosPermitidos: comandosPermitidosEnPrueba
  };

  await conn.sendMessage(chatId, {
    text: `✅ *Prueba activada por ${minutos} minuto(s).* El bot funcionará normalmente hasta que finalice el tiempo.`
  }, { quoted: msg });

  setTimeout(async () => {
    delete global.pruebasActivas[chatId];
    await conn.sendMessage(chatId, {
      text: `⏳ @${senderNum} ha finalizado el periodo de prueba del bot en este grupo.`,
      mentions: [`${senderNum}@s.whatsapp.net`]
    });
  }, minutos * 60 * 1000);
};

handler.command = ['prueba'];
handler.group = true;
module.exports = handler;

// ───────────── BLOQUEADOR DE COMANDOS FUERA DE PRUEBA ───────────── //

const blockIfNotInPrueba = async (msg, { command }) => {
  const chatId = msg.key.remoteJid;

  // Ignorar chats privados
  if (!msg.key.participant) return !0;

  const prueba = global.pruebasActivas[chatId];
  if (!prueba) return !1; // bloquear comandos

  const ahora = Date.now();

  // Si expiró y no fue limpiado aún
  if (prueba.expira < ahora) {
    delete global.pruebasActivas[chatId];
    return !1;
  }

  // Si el comando está permitido
  if (command && prueba.comandosPermitidos.includes(command)) return !0;

  // Bloquea otros comandos
  return !1;
};

module.exports.before = blockIfNotInPrueba;