const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Formatear número paraguayo al formato internacional
const formatearNumero = (telefono) => {
  const limpio = telefono.replace(/[\s\-\(\)]/g, '');
  if (limpio.startsWith('+595')) return limpio;
  if (limpio.startsWith('595'))  return `+${limpio}`;
  if (limpio.startsWith('0'))    return `+595${limpio.slice(1)}`;
  return `+595${limpio}`;
};

const enviarWhatsApp = async (telefono, mensaje) => {
  try {
    const numeroFormateado = formatearNumero(telefono);

    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to:   `whatsapp:${numeroFormateado}`,
      body: mensaje
    });

    return { ok: true, sid: message.sid };
  } catch (err) {
    console.error('Error WhatsApp:', err.message);
    return { ok: false, error: err.message };
  }
};

// Mensajes predefinidos
const mensajes = {
  ordenRecibida: (orden) =>
    `🔧 *Taller Mecánico*\n\n` +
    `Hola ${orden.vehiculo.cliente.nombre}! ✅\n\n` +
    `Su vehículo *${orden.vehiculo.marca} ${orden.vehiculo.modelo}* ` +
    `(Placa: ${orden.vehiculo.placa}) fue recibido.\n\n` +
    `📋 Orden N°: *${String(orden.id).padStart(5, '0')}*\n` +
    `Le avisaremos cuando esté listo 🙏`,

  enProceso: (orden) =>
    `🔧 *Taller Mecánico*\n\n` +
    `Hola ${orden.vehiculo.cliente.nombre}!\n\n` +
    `Su vehículo *${orden.vehiculo.marca} ${orden.vehiculo.modelo}* ` +
    `está siendo atendido 🔩\n\n` +
    `📋 Orden N°: *${String(orden.id).padStart(5, '0')}*`,

  vehiculoListo: (orden) =>
    `🔧 *Taller Mecánico*\n\n` +
    `Hola ${orden.vehiculo.cliente.nombre}! 🎉\n\n` +
    `Su vehículo *${orden.vehiculo.marca} ${orden.vehiculo.modelo}* ` +
    `(Placa: ${orden.vehiculo.placa}) está *LISTO* para retirar.\n\n` +
    `📋 Orden N°: *${String(orden.id).padStart(5, '0')}*\n` +
    `💰 Total: *Gs. ${orden.total.toLocaleString()}*\n\n` +
    `Horario: Lun-Vie 8:00-18:00 | Sáb 8:00-13:00`
};

module.exports = { enviarWhatsApp, mensajes };
