const fetch = require('node-fetch');

const ALIASES = {
  // Inglés / español a código de moneda ISO
  dolar: 'USD',
  dólares: 'USD',
  usd: 'USD',
  euro: 'EUR',
  euros: 'EUR',
  eur: 'EUR',
  libra: 'GBP',
  libras: 'GBP',
  gbp: 'GBP',
  yen: 'JPY',
  yenes: 'JPY',
  jpy: 'JPY',
  pesos: 'MXN', // por defecto
  'pesos mexicanos': 'MXN',
  'pesos argentinos': 'ARS',
  'pesos colombianos': 'COP',
  'pesos chilenos': 'CLP',
  mxn: 'MXN',
  ars: 'ARS',
  cop: 'COP',
  clp: 'CLP',
  brl: 'BRL',
  reales: 'BRL',
  inr: 'INR',
  rupias: 'INR',
  rupees: 'INR',
  cny: 'CNY',
  yuanes: 'CNY',
  yuan: 'CNY',
  cad: 'CAD',
  canadienses: 'CAD',
  aud: 'AUD',
  australianos: 'AUD',
};

function getCurrencyCode(word = '') {
  word = word.toLowerCase().trim();
  return ALIASES[word] || word.toUpperCase();
}

const handler = async (m, { conn }) => {
  const chatId = m.chat;
  const text = m.text;

  // Ejemplos válidos:
  // .monedas 10 USD COP
  // .monedas 10 dólares a pesos colombianos
  // .monedas 100 euro en yenes

  const match = text.match(/(\d+([.,]\d+)?)\s*(\w+)\s*(a|en)?\s*(.+)/i);
  if (!match) {
    return conn.sendMessage(chatId, {
      text: '❗ Uso: .monedas <cantidad> <moneda_origen> <a|en> <moneda_destino>\nEj: `.monedas 10 dólares en pesos colombianos`'
    });
  }

  const amount = parseFloat(match[1].replace(',', '.'));
  const fromRaw = match[3];
  const toRaw = match[5];

  const from = getCurrencyCode(fromRaw);
  const to = getCurrencyCode(toRaw);

  try {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await res.json();

    if (!data.success) throw new Error('Conversión fallida');

    const result = Number(data.result).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const updated = new Date(data.date).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const reply =
      `💱 *${amount}* ${from.toUpperCase()} ≈ *${result}* ${to.toUpperCase()}\n` +
      `📅 Actualizado: *${updated}*\n` +
      `✨ Generado por: *KilluaBot*`;

    await conn.sendMessage(chatId, { text: reply });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(chatId, {
      text: '❗ No pude obtener la tasa. Asegúrate de escribir monedas válidas.'
    });
  }
};

handler.command = ['monedas'];
module.exports = handler;