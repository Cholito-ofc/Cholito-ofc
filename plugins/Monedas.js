
const fetch = require('node-fetch');

constante ALIAS = {
  dólar: 'USD',
  dólares: 'USD',
  usd: 'USD',
  euro: 'EUR',
  euros: 'EUR',
  euros: 'EUR',
  libra: 'GBP',
  libras: 'GBP',
  gbp: 'GBP',
  yen: 'JPY',
  yenes: 'JPY',
  yen: 'JPY',
  pesos: 'MXN',
  'pesos mexicanos': 'MXN',
  'pesos argentinos': 'ARS',
  'pesos colombianos': 'COP',
  'pesos chilenos': 'CLP',
  mxn: 'MXN',
  ars: 'ARS',
  policía: 'POLICÍA',
  clp: 'CLP',
  brl: 'BRL',
  reales: 'BRL',
  inr: 'INR',
  rupias: 'INR',
  rupias: 'INR',
  chino: 'chino',
  yuanes: 'CNY',
  yuan: 'CNY',
  cad: 'CAD',
  canadienses: 'CAD',
  aud: 'AUD',
  australianos: 'AUD',
};

función obtenerCódigoDeCurrencia(palabra = '') {
  palabra = palabra.toLowerCase().trim();
  devolver ALIASES[palabra] || palabra.toUpperCase();
}

controlador constante = async (m, { conn }) => {
  constante chatId = m.chat;
  constante texto = m.texto || '';

  si (!texto || !texto.toLowerCase().includes('.monedas')) {
    devolver conn.sendMessage(chatId, {
      text: 'â — Uso: .monedas <cantidad> <moneda_origen> <a|en> <moneda_destino>\nEj: `.monedas 10 dólares en pesos colombianos`'
    });
  }

  const match = texto.match(/(\d+([.,]\d+)?)\s*(\w+)\s*(a|en)?\s*(.+)/i);
  si (!coincidencia) {
    devolver conn.sendMessage(chatId, {
      text: 'â — Uso: .monedas <cantidad> <moneda_origen> <a|en> <moneda_destino>\nEj: `.monedas 10 dólares en pesos colombianos`'
    });
  }

  constante cantidad = parseFloat(match[1].replace(',', '.'));
  constante fromRaw = match[3];
  constante toRaw = match[5];

  const from = obtenerCódigoDeCurrency(fromRaw);
  constante to = obtenerCódigoDeCurrency(toRaw);

  intentar {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    const datos = await res.json();

    if (!data.success) throw new Error('Conversión fallida');

    const resultado = Número(datos.resultado).toLocaleString('es-ES', {
      dígitosFracciónMínimos: 2,
      máximoFracciónDígitos: 2
    });

    const actualizado = new Date(data.date).toLocaleDateString('es-ES', {
      día: 'numérico', mes: 'largo', año: 'numérico'
    });

    respuesta constante =
      `ðŸ'± *${cantidad}*â€¯${desde.aUpperCase()} â‰ˆ *${resultado}*â€¯${a.aUpperCase()}\n` +
      `ðŸ“… Actualizado: *${actualizado}*\n` +
      `âœ¨ Generado por: *KilluaBot*`;

    esperar conn.sendMessage(chatId, { texto: responder });

  } atrapar (err) {
    consola.error(err);
    esperar conn.sendMessage(chatId, {
      texto: 'â — No pude obtener la tasa. Asegúrate de escribir monedas válidas.'
    });
  }
};

handler.command = ['monedas'];
módulo.exports = manejador;