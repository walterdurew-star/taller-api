const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/clientes.controller');

router.use(verificarToken);

router.get('/',      ctrl.listar);
router.post('/',     ctrl.crear);
router.get('/:id',   ctrl.obtener);
router.put('/:id',   ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
