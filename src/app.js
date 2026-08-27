require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/clientes',  require('./routes/clientes.routes'));
app.use('/api/vehiculos', require('./routes/vehiculos.routes'));
app.use('/api/repuestos', require('./routes/repuestos.routes'));
app.use('/api/ordenes',   require('./routes/ordenes.routes'));
app.use('/api/stock',     require('./routes/stock.routes'));
app.use('/api/pagos',     require('./routes/pagos.routes'));
app.use('/api/reportes',  require('./routes/reportes.routes'));
app.use('/api/buscar',    require('./routes/busqueda.routes'));
app.use('/api/pdf',       require('./routes/pdf.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    mensaje: '🔧 Taller API v1.0',
    estado:  'funcionando'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
