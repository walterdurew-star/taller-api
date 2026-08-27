const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const ordenes = await prisma.orden.findMany({
      include: {
        vehiculo: true,
        mecanico: { select: { id: true, nombre: true } },
        items: true,
        pagos: true
      },
      orderBy: { fechaEntrada: 'desc' }
    });
    res.json(ordenes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { vehiculoId, mecanicoId, descripcion, estado = 'RECIBIDO' } = req.body;
    const orden = await prisma.orden.create({
      data: {
        vehiculoId: Number(vehiculoId),
        mecanicoId: mecanicoId ? Number(mecanicoId) : null,
        descripcion,
        estado,
        total: 0,
        totalManoObra: 0,
        totalRepuestos: 0,
        pagado: 0,
        saldoPendiente: 0
      }
    });
    res.status(201).json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const orden = await prisma.orden.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        vehiculo: { include: { cliente: true } },
        mecanico: { select: { id: true, nombre: true } },
        items: { include: { repuesto: true } },
        pagos: true
      }
    });
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(orden);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const orden = await prisma.orden.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(orden);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Orden no encontrada' });
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await prisma.orden.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensaje: 'Orden eliminada' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Orden no encontrada' });
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, eliminar };
