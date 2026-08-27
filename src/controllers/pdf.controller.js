const PDFDocument = require('pdfkit');

const generarFactura = async (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `orden-${req.params.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.fontSize(18).text('Taller API - Factura', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Orden #: ${req.params.id}`);
    doc.text('Documento generado correctamente.');
    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generarFactura };
