// Fase 3: el comprador entra a /mi-equipo?token=... (link mágico, sin
// contraseña) y esta función le devuelve el estado de su grupo.
//
// NO cuenta cuántas personas ya completaron el diagnóstico: eso vive en la
// tabla de resultados que ya tenés (la que usa /api/notify-completion) y
// cuyo nombre/columnas no conozco desde este módulo aparte. Sumalo donde
// dice el TODO de abajo cuando integres esto al proyecto real.
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { token } = req.query || {};
  if (!token) {
    res.status(400).json({ error: 'Falta el token' });
    return;
  }

  const { data: grupo, error } = await supabase
    .from('grupos')
    .select('id, nombre, clave, asientos_max, origen')
    .eq('token_acceso', token)
    .single();

  if (error || !grupo) {
    res.status(404).json({ error: 'No encontramos ese equipo' });
    return;
  }

  // TODO integración real: reemplazar por un count() contra tu tabla de
  // resultados filtrando por grupo.clave, para mostrar "6 de 10 completaron".
  const asientosUsados = null;

  res.status(200).json({
    nombre: grupo.nombre,
    clave: grupo.clave,
    asientosMax: grupo.asientos_max,
    asientosUsados,
  });
};
