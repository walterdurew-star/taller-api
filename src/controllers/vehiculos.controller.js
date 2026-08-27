const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const { clienteId, buscar } = req.query;

    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        ...(clienteId && { clienteId: parseInt(clienteId) }),
        ...(buscar && {
          OR: [
            { placa:  { contains: buscar, mode: 'insensitive' } },
            { marca:  { contains: buscar, mode: 'insensitive' } },
            { modelo: { contains: buscar, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        cliente: { select: { id: true, nombre: true, telefono: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });

    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const { clienteId, marca, modelo, anio, placa, color, kilometraje } = req.body;

    if (!clienteId || !marca || !modelo || !anio || !placa) {
      return res.status(400).json({
        error: 'clienteId, marca, modelo, anio y placa son requeridos'
      });
    }

    const vehiculo = await prisma.vehiculo.create({
      data: {
        clienteId:   parseInt(clienteId),
        marca,
        modelo,
        color,
        anio:        parseInt(anio),
        placa:       placa.toUpperCase(),
        kilometraje: kilometraje ? parseInt(kilometraje) : null
      },
      include: {
        cliente: { select: { id: true, nombre: true } }
      }
    });

    res.status(201).json(vehiculo);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'La placa ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cliente: true,
        ordenes: {
          include: {
            mecanico: { select: { id: true, nombre: true } },
            items:    true,
            pagos:    true
          },
          orderBy: { fechaEntrada: 'desc' }
        }
      }
    });

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { marca, modelo, anio, placa, color, kilometraje } = req.body;

    const vehiculo = await prisma.vehiculo.update({
      where: { id: parseInt(req.params.id) },
      data: {
        marca, modelo, color,
        ...(anio        && { anio:        parseInt(anio) }),
        ...(placa       && { placa:       placa.toUpperCase() }),
        ...(kilometraje && { kilometraje: parseInt(kilometraje) })
      }
    });

    res.json(vehiculo);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, obtener, actualizar };
