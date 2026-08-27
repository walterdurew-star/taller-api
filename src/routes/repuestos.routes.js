const router = require('express').Router();
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/repuestos.controller');

router.use(verificarToken);

router.get('/',             ctrl.listar);
router.get('/bajo-stock',   ctrl.bajoStock);
router.get('/:id',          ctrl.obtener);
router.post('/',  soloAdmin, ctrl.crear);
router.put('/:id', soloAdmin, ctrl.actualizar);

module.exports = router;
