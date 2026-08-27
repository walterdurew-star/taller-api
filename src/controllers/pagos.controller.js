const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      include: { orden: true },
      orderBy: { fecha: 'desc' }
    });
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { ordenId, monto, metodo } = req.body;
    const pago = await prisma.pago.create({
      data: {
        ordenId: Number(ordenId),
        monto: Number(monto),
        metodo: metodo || 'EFECTIVO'
      }
    });
    res.status(201).json(pago);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: Number(req.params.id) },
      include: { orden: true }
    });
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, obtener };
