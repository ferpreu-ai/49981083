# Módulo de cobro self-service — Escala Humana

Este directorio es un **módulo aparte**, no conectado al proyecto real
`escala-humana-diagnostico`. Implementa las fases 0–3 del plan de cobro
(ver el artifact "Plan de Cobro Self-Service"): esquema de datos, página
de compra, webhook de Mercado Pago y panel del comprador. Está pensado
para copiarse dentro del proyecto real, no para desplegarse solo.

## Qué incluye

| Archivo | Fase | Qué hace |
|---|---|---|
| `supabase/migrations/0001_cobro_self_service.sql` | 0 | Tabla `pedidos` + columnas nuevas en `grupos` |
| `public/comprar/index.html` | 1 | Selector de plan + formulario, sin backend propio (llama a `/api/crear-preferencia`) |
| `api/crear-preferencia.js` | 1 | Registra el pedido y crea la preferencia de Checkout Pro en Mercado Pago |
| `api/webhook-mercadopago.js` | 2 | Recibe la notificación de pago, confirma el pedido y da de alta el grupo automáticamente |
| `public/mi-equipo/index.html` + `api/mi-equipo.js` + `api/invitar.js` | 3 | Panel con link mágico (`?token=`) para que el comprador invite a su equipo |
| `public/comprar/gracias.html`, `pendiente.html`, `error.html` | 4 | Pantallas de retorno de Mercado Pago |

## Lo que NO resuelve (y por qué)

No tengo acceso al repo real de `escala-humana-diagnostico` — solo vi el
HTML compilado en producción. Así que este módulo asume cosas que hay que
reconciliar al integrar:

- **Tabla `grupos`**: asumo que existe con al menos `id` y `clave`. Si tus
  nombres de columna son otros, ajustá la migración y `webhook-mercadopago.js`
  antes de aplicarla.
- **Envío de emails**: `enviarAccesoPorEmail()` (en el webhook) y
  `enviarInvitaciones()` (en `invitar.js`) son *stubs* con un `console.log`.
  Reemplazalos por llamadas a tus funciones reales `/api/send-access-email`
  y `/api/send-group-email` — ya existen y funcionan, no hace falta
  reescribirlas.
- **Conteo de "quién completó"**: `/api/mi-equipo` no lo muestra porque
  vive en la tabla de resultados que usa `/api/notify-completion`, cuyo
  esquema no conozco desde acá. Sumalo donde dice el `TODO` en
  `api/mi-equipo.js`.
- **Moneda**: Mercado Pago Argentina cobra en ARS. `crear-preferencia.js`
  convierte el precio en USD a ARS con `TIPO_CAMBIO_ARS`, una variable de
  entorno que se actualiza a mano — no consulta ninguna cotización en
  tiempo real. Si vas a vender también fuera de Argentina, esto necesita
  una segunda pasarela (Stripe) más adelante.

## Cómo integrarlo

1. Revisá y ajustá `supabase/migrations/0001_cobro_self_service.sql` contra
   el esquema real de `grupos`, después aplicala.
2. Copiá `api/*.js` y `lib/*.js` a las carpetas equivalentes del proyecto
   real (usan `module.exports = async (req, res) => {}`, el formato de
   función serverless de Vercel sin framework — el mismo que ya usan
   `send-access-email` y compañía).
3. Copiá `public/comprar/` y `public/mi-equipo/` a la raíz pública del
   sitio.
4. Completá `.env.example` como `.env` (o cargalo directo en Vercel) con
   las credenciales reales de Supabase y Mercado Pago.
5. Reemplazá los dos `TODO` de envío de email por tus funciones reales.
6. Probá el circuito completo con las credenciales de **test** de
   Mercado Pago antes de mover un peso real — después cambiá `MP_ACCESS_TOKEN`
   a producción y actualizá el link "Hacer el diagnóstico" de la landing
   para que apunte a `/comprar`.

## Precios

Validados el 27/08/2026 (ver `lib/pricing.js` si cambian):

- Individual: USD 25, pago único
- Equipo: USD 150, hasta 10 personas, pago único — asiento extra USD 12
