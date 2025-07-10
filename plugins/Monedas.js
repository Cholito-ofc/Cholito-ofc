const fetch = require('node-fetch');

const ALIASES = {
  dolar: ['USD', '$'], dólares: ['USD', '$'], usd: ['USD', '$'],
  euro: ['EUR', '€'], euros: ['EUR', '€'], eur: ['EUR', '€'],
  libra: ['GBP', '£'], libras: ['GBP', '£'], gbp: ['GBP', '£'],
  yen: ['JPY', '¥'], yenes: ['JPY', '¥'], jpy: ['JPY', '¥'],
  pesos: ['MXN', '$'], 'pesos mexicanos': ['MXN', '$'],
  'pesos argentinos': ['ARS', '$'], 'pesos colombianos': ['COP', '$'],
  'pesos chilenos': ['CLP', '$'], mxn: ['MXN', '$'],
  ars: ['ARS', '$'], cop: ['COP', '$'], clp: ['CLP', '$'],
  brl: ['BRL', 'R$'], reales: ['BRL', 'R$'],
  inr: ['INR', '₹'], rupias: ['INR', '₹'], rupees: ['INR', '₹'],
  cny: ['CNY', '¥'], yuanes: ['CNY', '¥'], yuan: ['CNY', '¥'],
  cad: ['CAD', '$'], canadienses: ['CAD', '$'],
  aud: ['AUD', '$'], australianos: ['AUD', '$'],
};

function getCurrencyData(word = '') {
  word = word.toLowerCase().trim();
  return ALIASES[word] || [word.toUpperCase(), ''];
}

const handler = async (m, { conn }) => {
  try {
    const chatId = m.chat;
    const text = m.text || '';

    if (!text.toLowerCase().includes('.monedas')) return;

    const match = text.match(/(\d+([.,]\d+)?)\s*(\w+(?:\s\w+)*)\s*(a|en)?\s*(.+)/i);
    if (!match) {
      return conn.sendMessage(chatId, {
        text: '❗ Formato incorrecto. Ej: `.monedas 10 euros en pesos colombianos`'
      });
    }

    const amount = parseFloat(match[1].replace(',', '.'));
    const [fromCode, fromSymbol] = getCurrencyData(match[3]);
    const [toCode, toSymbol] = getCurrencyData(match[5]);

    const res = await fetch(`https://api.exchangerate.host/convert?from=${fromCode}&to=${toCode}&amount=${amount}`);
    const data = await res.json();

    if (!data.success) throw new Error('Conversión fallida');

    const result = Number(data.result).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const updated = new Date(data.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const reply =
      `💱 *${amount}* ${fromSymbol || ''}${fromCode} ≈ *${toSymbol || ''}${result}* ${toCode}\n` +
      `📅 Actualizado: *${updated}*\n✨ Generado por: *KilluaBot*`;

    await conn.sendMessage(chatId, { text: reply });

  } catch (err) {
    console.error('Error en .monedas:', err);
    await conn.sendMessage(m.chat, { text: '❗ No pude obtener la tasa. Asegúrate de escribir monedas válidas.' });
  }
};

handler.command = ['monedas'];
module.exports = handler;