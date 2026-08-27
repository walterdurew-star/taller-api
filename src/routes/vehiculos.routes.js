const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/vehiculos.controller');

router.use(verificarToken);

router.get('/',     ctrl.listar);
router.post('/',    ctrl.crear);
router.get('/:id',  ctrl.obtener);
router.put('/:id',  ctrl.actualizar);

module.exports = router;
