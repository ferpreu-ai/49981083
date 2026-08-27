// Fase 1: recibe la selección de plan desde /comprar, registra el pedido
// como "pendiente" y devuelve el link de Checkout Pro de Mercado Pago.
const { Preference } = require('mercadopago');
const supabase = require('../lib/supabase');
const mpClient = require('../lib/mercadopago');
const { calcularPedido } = require('../lib/pricing');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { plan, nombre, email, empresa, asientos } = req.body || {};

  if (plan !== 'individual' && plan !== 'equipo') {
    res.status(400).json({ error: 'Plan inválido' });
    return;
  }
  if (!nombre || !email) {
    res.status(400).json({ error: 'Falta nombre o email' });
    return;
  }

  const { asientos: asientosSolicitados, montoUsd } = calcularPedido(plan, asientos);

  // Mercado Pago Argentina opera en ARS: convertimos con un tipo de cambio
  // de referencia configurado a mano. Revisalo antes de cada campaña —
  // no llama a ninguna API de cotización en tiempo real.
  const tipoCambio = Number(process.env.TIPO_CAMBIO_ARS);
  if (!tipoCambio) {
    res.status(500).json({ error: 'Falta configurar TIPO_CAMBIO_ARS' });
    return;
  }
  const montoArs = Math.round(montoUsd * tipoCambio);

  const { data: pedido, error: dbError } = await supabase
    .from('pedidos')
    .insert({
      plan,
      nombre,
      email,
      empresa: empresa || null,
      asientos_solicitados: asientosSolicitados,
      monto_usd: montoUsd,
      monto_ars: montoArs,
      estado: 'pendiente',
    })
    .select()
    .single();

  if (dbError) {
    res.status(500).json({ error: 'No se pudo registrar el pedido' });
    return;
  }

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    res.status(500).json({ error: 'Falta configurar SITE_URL' });
    return;
  }

  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            title:
              plan === 'equipo'
                ? `Escala Humana — Diagnóstico de Equipo (${asientosSolicitados} personas)`
                : 'Escala Humana — Diagnóstico Individual',
            quantity: 1,
            unit_price: montoArs,
            currency_id: 'ARS',
          },
        ],
        payer: { name: nombre, email },
        external_reference: pedido.id,
        back_urls: {
          success: `${siteUrl}/comprar/gracias.html`,
          pending: `${siteUrl}/comprar/pendiente.html`,
          failure: `${siteUrl}/comprar/error.html`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhook-mercadopago`,
      },
    });

    await supabase.from('pedidos').update({ mp_preference_id: result.id }).eq('id', pedido.id);

    res.status(200).json({ init_point: result.init_point });
  } catch (err) {
    console.error('Error creando preferencia de MP', err);
    res.status(500).json({ error: 'No se pudo iniciar el pago. Probá de nuevo en un minuto.' });
  }
};
