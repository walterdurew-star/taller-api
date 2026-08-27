const PDFDocument = require('pdfkit');

const generarOrdenPDF = (orden) => {
  const doc = new PDFDocument({ margin: 50 });

  // ─── ENCABEZADO ─────────────────────────────────────
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('TALLER MECÁNICO', { align: 'center' })
    .fontSize(10)
    .font('Helvetica')
    .text('Tel: +595 XXX XXX XXX', { align: 'center' })
    .text('Asunción, Paraguay', { align: 'center' })
    .moveDown();

  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown(0.5);

  // ─── NÚMERO DE ORDEN ────────────────────────────────
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`ORDEN DE TRABAJO N° ${String(orden.id).padStart(5, '0')}`)
    .moveDown(0.5);

  // ─── DOS COLUMNAS ────────────────────────────────────
  const col1 = 50;
  const col2 = 300;
  const y    = doc.y;

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DATOS DE LA ORDEN', col1, y)
    .font('Helvetica')
    .text(`Fecha entrada: ${new Date(orden.fechaEntrada).toLocaleDateString('es-PY')}`, col1)
    .text(`Fecha salida:  ${orden.fechaSalida
      ? new Date(orden.fechaSalida).toLocaleDateString('es-PY')
      : 'En proceso'}`, col1)
    .text(`Estado:   ${orden.estado}`, col1)
    .text(`Mecánico: ${orden.mecanico.nombre}`, col1);

  doc
    .font('Helvetica-Bold')
    .text('DATOS DEL CLIENTE', col2, y)
    .font('Helvetica')
    .text(`Cliente:  ${orden.vehiculo.cliente.nombre}`, col2)
    .text(`Teléfono: ${orden.vehiculo.cliente.telefono || '-'}`, col2)
    .text(`Email:    ${orden.vehiculo.cliente.email    || '-'}`, col2);

  doc.moveDown();

  // ─── VEHÍCULO ────────────────────────────────────────
  doc
    .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    .moveDown(0.5);

  const yVeh = doc.y;
  doc
    .font('Helvetica-Bold')
    .text('DATOS DEL VEHÍCULO', col1, yVeh)
    .font('Helvetica')
    .text(`${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.anio}`, col1)
    .text(`Placa: ${orden.vehiculo.placa}`, col2, yVeh)
    .text(`Color: ${orden.vehiculo.color || '-'}`, col2)
    .text(`KM:    ${orden.vehiculo.kilometraje || '-'}`, col1);

  doc.moveDown();

  // ─── DIAGNÓSTICO ─────────────────────────────────────
  if (orden.diagnostico) {
    doc
      .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('DIAGNÓSTICO')
      .font('Helvetica')
      .text(orden.diagnostico)
      .moveDown();
  }

  // ─── TABLA DE ITEMS ──────────────────────────────────
  doc
    .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
    .moveDown(0.5);

  const tableTop = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('DESCRIPCIÓN',    55,  tableTop)
    .text('TIPO',           290, tableTop)
    .text('CANT.',          350, tableTop)
    .text('P. UNIT.',       390, tableTop)
    .text('SUBTOTAL',       470, tableTop);

  doc
    .moveTo(50, doc.y + 4)
    .lineTo(550, doc.y + 4)
    .stroke();

  let yPos = doc.y + 10;
  doc.font('Helvetica').fontSize(9);

  orden.items.forEach((item) => {
    if (yPos > 680) {
      doc.addPage();
      yPos = 50;
    }

    doc
      .text(item.descripcion,                              55,  yPos, { width: 220 })
      .text(item.tipo,                                     290, yPos)
      .text(item.cantidad.toString(),                      350, yPos)
      .text(`Gs. ${item.precioUnitario.toLocaleString()}`, 390, yPos)
      .text(`Gs. ${item.subtotal.toLocaleString()}`,       470, yPos);

    yPos += 20;
  });

  // ─── TOTALES ─────────────────────────────────────────
  doc
    .moveTo(50, yPos + 5)
    .lineTo(550, yPos + 5)
    .stroke();

  yPos += 15;

  doc
    .font('Helvetica')
    .text('Mano de obra:', 350, yPos)
    .text(`Gs. ${orden.totalManoObra.toLocaleString()}`, 450, yPos);

  yPos += 15;
  doc
    .text('Repuestos:', 350, yPos)
    .text(`Gs. ${orden.totalRepuestos.toLocaleString()}`, 450, yPos);

  yPos += 5;
  doc.moveTo(350, yPos).lineTo(550, yPos).stroke();

  yPos += 10;
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('TOTAL:', 350, yPos)
    .text(`Gs. ${orden.total.toLocaleString()}`, 450, yPos);

  // ─── ESTADO DE PAGO ──────────────────────────────────
  yPos += 20;
  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Estado de pago: ${orden.pagado ? '✅ PAGADO' : `⏳ Pendiente Gs. ${orden.saldoPendiente.toLocaleString()}`}`,
      350, yPos);

  // ─── OBSERVACIONES ───────────────────────────────────
  if (orden.observaciones) {
    yPos += 30;
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('OBSERVACIONES:', 50, yPos)
      .font('Helvetica')
      .text(orden.observaciones, 50, yPos + 12);
  }

  // ─── PIE DE PÁGINA ───────────────────────────────────
  doc
    .fontSize(8)
    .font('Helvetica')
    .text('Gracias por su preferencia', 50, 750, {
      align: 'center',
      width: 500
    });

  return doc;
};

module.exports = { generarOrdenPDF };
