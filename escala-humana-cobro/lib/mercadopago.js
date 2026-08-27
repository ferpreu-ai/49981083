const { MercadoPagoConfig } = require('mercadopago');

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('Falta MP_ACCESS_TOKEN en las variables de entorno');
}

module.exports = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
