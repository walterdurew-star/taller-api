const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/stock.controller');

router.use(verificarToken);
router.get('/', ctrl.listar);
router.get('/bajo-stock', ctrl.bajoStock);

module.exports = router;
