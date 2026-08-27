const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listar = async (req, res) => {
  try {
    const { buscar, categoria } = req.query;

    const repuestos = await prisma.repuesto.findMany({
      where: {
        activo: true,
        ...(categoria && { categoria }),
        ...(buscar && {
          OR: [
            { nombre:   { contains: buscar, mode: 'insensitive' } },
            { codigo:   { contains: buscar, mode: 'insensitive' } },
            { categoria:{ contains: buscar, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(repuestos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bajoStock = async (req, res) => {
  try {
    const criticos = await prisma.$queryRaw`
      SELECT * FROM repuestos
      WHERE activo = true
      AND stock <= "stockMinimo"
      ORDER BY stock ASC
    `;

    res.json({ total: criticos.length, repuestos: criticos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtener = async (req, res) => {
  try {
    const repuesto = await prisma.repuesto.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!repuesto) {
      return res.status(404).json({ error: 'Repuesto no encontrado' });
    }

    res.json(repuesto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crear = async (req, res) => {
  try {
    const {
      codigo, nombre, descripcion,
      precioCompra, precioVenta,
      stock, stockMinimo, categoria
    } = req.body;

    if (!codigo || !nombre || !precioCompra || !precioVenta) {
      return res.status(400).json({
        error: 'codigo, nombre, precioCompra y precioVenta son requeridos'
      });
    }

    const repuesto = await prisma.repuesto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        precioCompra: parseFloat(precioCompra),
        precioVenta:  parseFloat(precioVenta),
        stock:        parseInt(stock        || 0),
        stockMinimo:  parseInt(stockMinimo  || 5),
        categoria
      }
    });

    res.status(201).json(repuesto);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'El código ya existe' });
    }
    res.status(500).json({ error: err.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const {
      nombre, descripcion, precioCompra,
      precioVenta, stock, stockMinimo,
      categoria, activo
    } = req.body;

    const repuesto = await prisma.repuesto.update({
      where: { id: parseInt(req.params.id) },
      data: {
        nombre, descripcion, categoria,
        ...(activo      !== undefined && { activo }),
        ...(precioCompra              && { precioCompra: parseFloat(precioCompra) }),
        ...(precioVenta               && { precioVenta:  parseFloat(precioVenta) }),
        ...(stock       !== undefined && { stock:        parseInt(stock) }),
        ...(stockMinimo !== undefined && { stockMinimo:  parseInt(stockMinimo) })
      }
    });

    res.json(repuesto);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Repuesto no encontrado' });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, bajoStock, obtener, crear, actualizar };
