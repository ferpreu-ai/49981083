// Precios validados con Fernando el 27/08/2026 — ver el artifact "Niveles de Escala Humana".
const PRECIOS_USD = { individual: 25, equipo: 150 };
const ASIENTO_EXTRA_USD = 12;
const ASIENTOS_INCLUIDOS = 10;
const ASIENTOS_MAX = 50;

function calcularPedido(plan, asientosSolicitadosRaw) {
  if (plan === 'individual') {
    return { asientos: 1, montoUsd: PRECIOS_USD.individual };
  }

  const asientos = Math.max(1, Math.min(ASIENTOS_MAX, Number(asientosSolicitadosRaw) || ASIENTOS_INCLUIDOS));
  const asientosExtra = Math.max(0, asientos - ASIENTOS_INCLUIDOS);
  const montoUsd = PRECIOS_USD.equipo + asientosExtra * ASIENTO_EXTRA_USD;

  return { asientos, montoUsd };
}

module.exports = { PRECIOS_USD, ASIENTO_EXTRA_USD, ASIENTOS_INCLUIDOS, ASIENTOS_MAX, calcularPedido };
