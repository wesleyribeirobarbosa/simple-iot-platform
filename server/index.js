const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const telemetryRoutes = require('./routes/telemetry');

// Importar banco de dados
const { initDatabase } = require('./database/database');
const { generateTelemetryData } = require('./services/telemetryService');

const app = express();
const PORT = process.env.PORT || 5000;

// BUG 1: CORS mal configurado - permite qualquer origem
app.use(cors({
    origin: '*', // BUG: Deveria ser restritivo
    credentials: true
}));

// BUG 2: Helmet desabilitado - expõe informações sensíveis
// app.use(helmet());

// BUG 3: Rate limiting muito permissivo
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // BUG: Deveria ser muito menor
    message: 'Muitas requisições deste IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// BUG 4: Log de todas as requisições com dados sensíveis
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2)); // BUG: Log de dados sensíveis
    }
    next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/telemetry', telemetryRoutes);

// BUG 5: Rota de debug que expõe informações sensíveis
app.get('/api/debug', (req, res) => {
    console.log('DEBUG ROUTE ACCESSED - TOKENS:', global.activeTokens); // BUG: Exposição de tokens
    res.json({
        message: 'Debug route',
        activeTokens: global.activeTokens || [],
        serverTime: new Date().toISOString()
    });
});

// BUG 6: Rota que permite acesso sem autenticação
app.get('/api/public/devices', async (req, res) => {
    try {
        const db = require('./database/database');
        const devices = await db.all('SELECT * FROM devices');
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BUG 7: Middleware de erro que vaza informações internas
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: error.message, // BUG: Deveria ser genérico
        stack: error.stack, // BUG: Stack trace exposto
        timestamp: new Date().toISOString()
    });
});

// Inicializar banco de dados
initDatabase();

// BUG 8: Cron job que roda muito frequentemente
cron.schedule('*/30 * * * * *', () => { // BUG: Deveria ser */30
    console.log('Gerando telemetrias...');
    generateTelemetryData();
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
});

// BUG 9: Variável global para armazenar tokens (inseguro)
global.activeTokens = [];

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});
