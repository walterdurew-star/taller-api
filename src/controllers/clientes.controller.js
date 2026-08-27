const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const { buscar, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = buscar ? {
      OR: [
        { nombre:   { contains: buscar, mode: 'insensitive' } },
        { telefono: { contains: buscar } },
        { email:    { contains: buscar, mode: 'insensitive' } }
      ]
    } : {};

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include:  { vehiculos: true },
        orderBy:  { creadoEn: 'desc' },
        skip:     Number(skip),
        take:     Number(limit)
      }),
      prisma.cliente.count({ where })
    ]);

    res.json({ total, page: Number(page), clientes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, email, direccion }
    });

    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        vehiculos: {
          include: {
            ordenes: {
              orderBy: { fechaEntrada: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data:  { nombre, telefono, email, direccion }
    });

    res.json(cliente);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: err.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await prisma.cliente.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ mensaje: 'Cliente eliminado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar, eliminar };
