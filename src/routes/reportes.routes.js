const router = require('express').Router();
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/reportes.controller');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/ingresos',  ctrl.ingresos);
router.get('/ordenes',   ctrl.resumenOrdenes);
router.get('/repuestos', ctrl.repuestosMasVendidos);
router.get('/mecanicos', ctrl.rendimientoMecanicos);

module.exports = router;
