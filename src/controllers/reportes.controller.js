const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── INGRESOS POR PERÍODO ───────────────────────────
const ingresos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const fechaDesde = desde
      ? new Date(`${desde}T00:00:00`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const fechaHasta = hasta
      ? new Date(`${hasta}T23:59:59`)
      : new Date();

    const ordenes = await prisma.orden.findMany({
      where: {
        estado:      'ENTREGADO',
        fechaSalida: { gte: fechaDesde, lte: fechaHasta }
      },
      select: {
        id:             true,
        total:          true,
        totalManoObra:  true,
        totalRepuestos: true,
        pagado:         true,
        saldoPendiente: true,
        fechaSalida:    true
      }
    });

    const resumen = {
      periodo: {
        desde: fechaDesde,
        hasta: fechaHasta
      },
      totalOrdenes:     ordenes.length,
      ingresoTotal:     ordenes.reduce((acc, o) => acc + o.total,          0),
      ingresoManoObra:  ordenes.reduce((acc, o) => acc + o.totalManoObra,  0),
      ingresoRepuestos: ordenes.reduce((acc, o) => acc + o.totalRepuestos, 0),
      totalCobrado:     ordenes.reduce((acc, o) => acc + (o.total - o.saldoPendiente), 0),
      totalPendiente:   ordenes.reduce((acc, o) => acc + o.saldoPendiente, 0),
      ordenes
    };

    res.json(resumen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── RESUMEN DE ÓRDENES ─────────────────────────────
const resumenOrdenes = async (req, res) => {
  try {
    const [recibido, enProceso, listo, entregado] = await Promise.all([
      prisma.orden.count({ where: { estado: 'RECIBIDO'   } }),
      prisma.orden.count({ where: { estado: 'EN_PROCESO' } }),
      prisma.orden.count({ where: { estado: 'LISTO'      } }),
      prisma.orden.count({ where: { estado: 'ENTREGADO'  } })
    ]);

    const total = recibido + enProceso + listo + entregado;

    res.json({
      resumen: {
        RECIBIDO:   recibido,
        EN_PROCESO: enProceso,
        LISTO:      listo,
        ENTREGADO:  entregado,
        TOTAL:      total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── REPUESTOS MÁS VENDIDOS ─────────────────────────
const repuestosMasVendidos = async (req, res) => {
  try {
    const { desde, hasta, limit = 10 } = req.query;

    const resultado = await prisma.ordenItem.groupBy({
      by:      ['repuestoId'],
      where: {
        tipo:       'REPUESTO',
        repuestoId: { not: null },
        ...(desde && hasta && {
          orden: {
            fechaEntrada: {
              gte: new Date(`${desde}T00:00:00`),
              lte: new Date(`${hasta}T23:59:59`)
            }
          }
        })
      },
      _sum:    { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take:    Number(limit)
    });

    const ids = resultado.map(r => r.repuestoId);

    const repuestos = await prisma.repuesto.findMany({
      where:  { id: { in: ids } },
      select: { id: true, nombre: true, codigo: true, stock: true }
    });

    const data = resultado.map(r => ({
      repuesto:        repuestos.find(rp => rp.id === r.repuestoId),
      totalVendido:    r._sum.cantidad,
      ingresoGenerado: r._sum.subtotal
    }));

    res.json({ total: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── RENDIMIENTO POR MECÁNICO ───────────────────────
const rendimientoMecanicos = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    const whereOrdenes = {
      ...(desde && hasta && {
        fechaEntrada: {
          gte: new Date(`${desde}T00:00:00`),
          lte: new Date(`${hasta}T23:59:59`)
        }
      })
    };

    const mecanicos = await prisma.usuario.findMany({
      where: { rol: 'MECANICO', activo: true },
      select: {
        id:     true,
        nombre: true,
        ordenes: {
          where: whereOrdenes,
          select: {
            id:            true,
            estado:        true,
            total:         true,
            totalManoObra: true,
            fechaEntrada:  true,
            fechaSalida:   true
          }
        }
      }
    });

    const data = mecanicos.map(m => ({
      mecanico: {
        id:     m.id,
        nombre: m.nombre
      },
      totalOrdenes:      m.ordenes.length,
      ordenesActivas:    m.ordenes.filter(o => o.estado !== 'ENTREGADO').length,
      ordenesTerminadas: m.ordenes.filter(o => o.estado === 'ENTREGADO').length,
      ingresoTotal:      m.ordenes.reduce((acc, o) => acc + o.total,         0),
      manoObraTotal:     m.ordenes.reduce((acc, o) => acc + o.totalManoObra, 0)
    }));

    res.json({ total: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  ingresos,
  resumenOrdenes,
  repuestosMasVendidos,
  rendimientoMecanicos
};
