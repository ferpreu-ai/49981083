// Fase 2: Mercado Pago llama acá (notification_url) cada vez que un pago
// cambia de estado. Si se aprueba y todavía no tiene grupo asociado,
// generamos el código de acceso solos — la misma lógica que hoy hacés a mano.
const crypto = require('crypto');
const { Payment } = require('mercadopago');
const supabase = require('../lib/supabase');
const mpClient = require('../lib/mercadopago');

const ESTADO_MP_A_PEDIDO = {
  approved: 'aprobado',
  pending: 'en_revision',
  in_process: 'en_revision',
  rejected: 'rechazado',
};

function generarClave() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = async (req, res) => {
  // MP a veces pega con GET para validar la URL — respondemos 200 y listo.
  if (req.method !== 'POST') {
    res.status(200).end();
    return;
  }

  const topic = req.query?.topic || req.body?.type;
  const paymentId = req.query?.['data.id'] || req.body?.data?.id;

  if (topic !== 'payment' || !paymentId) {
    res.status(200).end();
    return;
  }

  let info;
  try {
    const payment = new Payment(mpClient);
    info = await payment.get({ id: paymentId });
  } catch (err) {
    console.error('No se pudo leer el pago desde MP', err);
    res.status(200).end(); // devolvemos 200 igual: MP reintenta si respondemos error
    return;
  }

  const pedidoId = info.external_reference;
  if (!pedidoId) {
    res.status(200).end();
    return;
  }

  const { data: pedido } = await supabase.from('pedidos').select('*').eq('id', pedidoId).single();
  if (!pedido) {
    res.status(200).end();
    return;
  }

  const estado = ESTADO_MP_A_PEDIDO[info.status] || 'en_revision';

  await supabase
    .from('pedidos')
    .update({ estado, mp_payment_id: String(paymentId), actualizado_en: new Date().toISOString() })
    .eq('id', pedidoId);

  // Alta automática de grupo — solo la primera vez que este pedido se aprueba.
  if (estado === 'aprobado' && !pedido.grupo_id) {
    const clave = generarClave();

    const { data: grupo, error: grupoError } = await supabase
      .from('grupos')
      .insert({
        nombre: pedido.empresa || pedido.nombre,
        clave,
        pedido_id: pedido.id,
        asientos_max: pedido.asientos_solicitados,
        origen: 'self_service',
      })
      .select()
      .single();

    if (!grupoError && grupo) {
      await supabase.from('pedidos').update({ grupo_id: grupo.id }).eq('id', pedido.id);
      await enviarAccesoPorEmail({
        email: pedido.email,
        nombre: pedido.nombre,
        clave,
        tokenAcceso: grupo.token_acceso,
        esEquipo: pedido.plan === 'equipo',
      });
    } else {
      console.error('No se pudo crear el grupo para el pedido', pedido.id, grupoError);
    }
  }

  res.status(200).end();
};

// TODO integración real: reemplazar esto por una llamada a tu función
// existente /api/send-access-email (la que ya usás para el alta manual),
// pasándole la `clave` y, si es plan Equipo, el link a /mi-equipo con
// `tokenAcceso` para que el comprador pueda invitar a su equipo.
async function enviarAccesoPorEmail({ email, nombre, clave, tokenAcceso, esEquipo }) {
  console.log('TODO enviar email de acceso', { email, nombre, clave, tokenAcceso, esEquipo });
}
