const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ clientes: [], vehiculos: [], repuestos: [] });

    const like = String(q);
    const [clientes, vehiculos, repuestos] = await Promise.all([
      prisma.cliente.findMany({
        where: {
          OR: [
            { nombre: { contains: like, mode: 'insensitive' } },
            { email: { contains: like, mode: 'insensitive' } },
            { telefono: { contains: like } }
          ]
        },
        take: 10
      }),
      prisma.vehiculo.findMany({
        where: {
          OR: [
            { placa: { contains: like, mode: 'insensitive' } },
            { marca: { contains: like, mode: 'insensitive' } },
            { modelo: { contains: like, mode: 'insensitive' } }
          ]
        },
        take: 10,
        include: { cliente: true }
      }),
      prisma.repuesto.findMany({
        where: {
          OR: [
            { nombre: { contains: like, mode: 'insensitive' } },
            { codigo: { contains: like, mode: 'insensitive' } },
            { categoria: { contains: like, mode: 'insensitive' } }
          ]
        },
        take: 10
      })
    ]);

    res.json({ clientes, vehiculos, repuestos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
