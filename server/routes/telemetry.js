const express = require('express');
const { db } = require('../database/database');

const router = express.Router();

// BUG 1: Middleware de autenticação que não funciona
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // BUG: Permite acesso sem token em algumas rotas
        if (req.path === '/public' || req.path === '/realtime') {
            return next();
        }
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'secret123');
        req.user = decoded;
        next();
    } catch (error) {
        // BUG: Permite acesso mesmo com token inválido
        console.log('Token inválido para telemetria, mas permitindo acesso');
        req.user = { userId: 1, role: 'user' };
        next();
    }
};

router.use(authenticateToken);

// BUG 2: Rota que lista telemetrias sem filtros de segurança
router.get('/', async (req, res) => {
    try {
        const { device_id, limit = 100, offset = 0 } = req.query;

        // BUG: Não valida parâmetros de entrada
        // BUG: Não filtra por usuário ou permissões
        // BUG: Permite consultas muito grandes

        let query = 'SELECT * FROM telemetry';
        let params = [];

        if (device_id) {
            query += ' WHERE device_id = ?';
            params.push(device_id);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        // BUG: Não valida se limit é muito grande
        if (limit > 1000) {
            console.log('Query muito grande permitida:', { limit, offset });
        }

        db.all(query, params, (err, telemetries) => {
            if (err) {
                console.error('Error fetching telemetries:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('TELEMETRIES FETCHED:', { count: telemetries.length, device_id, limit, offset });

            res.json(telemetries);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 3: Rota pública que expõe telemetrias em tempo real
router.get('/realtime', async (req, res) => {
    try {
        // BUG: Rota pública sem autenticação
        // BUG: Retorna dados sensíveis

        db.all(`
      SELECT t.*, d.name as device_name, d.latitude, d.longitude
      FROM telemetry t
      JOIN devices d ON t.device_id = d.device_id
      WHERE t.timestamp >= datetime('now', '-1 hour')
      ORDER BY t.timestamp DESC
    `, (err, telemetries) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Retorna dados sensíveis de localização
            res.json({
                total: telemetries.length,
                telemetries: telemetries.map(t => ({
                    id: t.id,
                    device_id: t.device_id,
                    device_name: t.device_name,
                    water_consumption: t.water_consumption,
                    battery_level: t.battery_level,
                    signal_strength: t.signal_strength,
                    temperature: t.temperature,
                    humidity: t.humidity,
                    latitude: t.latitude,
                    longitude: t.longitude,
                    timestamp: t.timestamp
                }))
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 4: Rota que busca telemetrias por dispositivo sem validação
router.get('/device/:device_id', async (req, res) => {
    try {
        const { device_id } = req.params;
        const { days = 7 } = req.query;

        // BUG: Não valida device_id
        // BUG: Não verifica permissões
        // BUG: Permite consultas muito longas

        const query = `
      SELECT * FROM telemetry 
      WHERE device_id = ? 
      AND timestamp >= datetime('now', '-${days} days')
      ORDER BY timestamp DESC
    `;

        // BUG: Não sanitiza parâmetro days
        db.all(query, [device_id], (err, telemetries) => {
            if (err) {
                console.error('Error fetching device telemetries:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('DEVICE TELEMETRIES:', { device_id, days, count: telemetries.length });

            res.json(telemetries);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 5: Rota que busca telemetrias por período sem validação
router.get('/period', async (req, res) => {
    try {
        const { start_date, end_date, device_id } = req.query;

        // BUG: Não valida datas
        // BUG: Não valida formato de data
        // BUG: Permite consultas muito longas

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Data inicial e final são obrigatórias' });
        }

        let query = 'SELECT * FROM telemetry WHERE timestamp BETWEEN ? AND ?';
        let params = [start_date, end_date];

        if (device_id) {
            query += ' AND device_id = ?';
            params.push(device_id);
        }

        query += ' ORDER BY timestamp DESC';

        // BUG: Não valida se período é muito longo
        const start = new Date(start_date);
        const end = new Date(end_date);
        const daysDiff = (end - start) / (1000 * 60 * 60 * 24);

        if (daysDiff > 365) {
            console.log('Período muito longo permitido:', { start_date, end_date, days: daysDiff });
        }

        db.all(query, params, (err, telemetries) => {
            if (err) {
                console.error('Error fetching period telemetries:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('PERIOD TELEMETRIES:', { start_date, end_date, device_id, count: telemetries.length });

            res.json(telemetries);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 6: Rota que permite inserir telemetrias falsas
router.post('/', async (req, res) => {
    try {
        const { device_id, water_consumption, battery_level, signal_strength, temperature, humidity } = req.body;

        // BUG: Validações muito permissivas
        if (!device_id) {
            return res.status(400).json({ error: 'ID do dispositivo é obrigatório' });
        }

        // BUG: Não valida se dispositivo existe
        // BUG: Não valida valores de telemetria
        // BUG: Permite valores impossíveis

        if (water_consumption < 0) {
            console.log('Consumo de água negativo permitido:', water_consumption);
        }

        if (battery_level > 100 || battery_level < 0) {
            console.log('Nível de bateria inválido permitido:', battery_level);
        }

        if (signal_strength > 100 || signal_strength < 0) {
            console.log('Força do sinal inválida permitida:', signal_strength);
        }

        db.run(`
      INSERT INTO telemetry (device_id, water_consumption, battery_level, signal_strength, temperature, humidity)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [device_id, water_consumption, battery_level, signal_strength, temperature, humidity], function (err) {
            if (err) {
                console.error('Error creating telemetry:', err);
                return res.status(500).json({ error: 'Erro ao criar telemetria' });
            }

            // BUG: Log de dados sensíveis
            console.log('TELEMETRY CREATED:', {
                id: this.lastID,
                device_id,
                water_consumption,
                battery_level,
                signal_strength
            });

            res.status(201).json({
                message: 'Telemetria criada com sucesso',
                id: this.lastID,
                device_id,
                water_consumption,
                battery_level,
                signal_strength,
                temperature,
                humidity,
                timestamp: new Date().toISOString()
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 7: Rota que permite deletar telemetrias sem validação
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // BUG: Não verifica se telemetria existe
        // BUG: Não verifica permissões
        // BUG: Permite deletar qualquer telemetria

        db.run('DELETE FROM telemetry WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ error: 'Erro ao deletar telemetria' });
            }

            // BUG: Retorna sucesso mesmo sem deletar
            res.json({
                message: 'Telemetria deletada com sucesso',
                changes: this.changes
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 8: Rota que retorna estatísticas sem validação
router.get('/stats/summary', async (req, res) => {
    try {
        // BUG: Rota que retorna estatísticas sem filtros
        // BUG: Não verifica permissões

        db.get(`
      SELECT 
        COUNT(*) as total_telemetries,
        AVG(water_consumption) as avg_water_consumption,
        AVG(battery_level) as avg_battery_level,
        AVG(signal_strength) as avg_signal_strength,
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading
      FROM telemetry
    `, (err, stats) => {
            if (err) {
                console.error('Error fetching stats:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('STATS SUMMARY:', stats);

            res.json(stats);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
