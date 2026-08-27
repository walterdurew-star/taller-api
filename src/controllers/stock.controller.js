const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const repuestos = await prisma.repuesto.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(repuestos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bajoStock = async (req, res) => {
  try {
    const repuestos = await prisma.repuesto.findMany({
      where: {
        activo: true,
        OR: [
          { stock: { lte: 0 } },
          { stock: { lte: prisma.repuesto.fields.stock } }
        ]
      },
      orderBy: { stock: 'asc' }
    });
    res.json({ total: repuestos.length, repuestos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, bajoStock };
