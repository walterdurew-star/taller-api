const registrarMovimiento = async (tx, {
  repuestoId,
  tipo,
  cantidad,
  stockAntes,
  stockDespues,
  motivo     = null,
  ordenId    = null,
  usuarioId  = null
}) => {
  return tx.movimientoStock.create({
    data: {
      repuestoId,
      tipo,
      cantidad,
      stockAntes,
      stockDespues,
      motivo,
      ordenId,
      usuarioId
    }
  });
};

module.exports = { registrarMovimiento };
