// Fase 3: el comprador invita a su equipo desde /mi-equipo. Valida el tope
// de asientos y dispara el email de invitación (a integrar, ver TODO).
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { token, invitados } = req.body || {};
  if (!token || !Array.isArray(invitados) || invitados.length === 0) {
    res.status(400).json({ error: 'Falta el token o la lista de invitados' });
    return;
  }

  const { data: grupo, error } = await supabase
    .from('grupos')
    .select('id, nombre, clave, asientos_max')
    .eq('token_acceso', token)
    .single();

  if (error || !grupo) {
    res.status(404).json({ error: 'No encontramos ese equipo' });
    return;
  }

  if (invitados.length > grupo.asientos_max) {
    res.status(400).json({ error: `Este plan tiene hasta ${grupo.asientos_max} asientos` });
    return;
  }

  await enviarInvitaciones({ clave: grupo.clave, grupoNombre: grupo.nombre, invitados });

  res.status(200).json({ ok: true, enviados: invitados.length });
};

// TODO integración real: reemplazar por tu función existente
// /api/send-group-email, pasándole la `clave` del grupo y la lista de
// invitados para que cada uno reciba su link de acceso al diagnóstico.
async function enviarInvitaciones({ clave, grupoNombre, invitados }) {
  console.log('TODO enviar invitaciones de grupo', { clave, grupoNombre, invitados });
}
