const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { generarFactura } = require('../controllers/pdf.controller');

router.use(verificarToken);
router.get('/orden/:id', generarFactura);

module.exports = router;
