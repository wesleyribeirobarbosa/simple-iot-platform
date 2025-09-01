const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/database');

const router = express.Router();

// BUG 1: Middleware de autenticação que não funciona adequadamente
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // BUG: Permite acesso sem token em algumas rotas
        if (req.path === '/public' || req.path === '/list') {
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
        console.log('Token inválido para dispositivos, mas permitindo acesso');
        req.user = { userId: 1, role: 'user' };
        next();
    }
};

router.use(authenticateToken);

// BUG 2: Rota que lista dispositivos sem filtros de segurança
router.get('/', async (req, res) => {
    try {
        // BUG: Não filtra por usuário ou permissões
        db.all('SELECT * FROM devices ORDER BY created_at DESC', (err, devices) => {
            if (err) {
                console.error('Error fetching devices:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('DEVICES LISTED:', devices.map(d => ({ id: d.id, name: d.name, location: [d.latitude, d.longitude] })));

            res.json(devices);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 3: Rota pública que expõe todos os dispositivos
router.get('/public', async (req, res) => {
    try {
        // BUG: Rota pública sem autenticação
        db.all('SELECT * FROM devices WHERE status = "active"', (err, devices) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Retorna dados sensíveis de localização
            res.json({
                total: devices.length,
                devices: devices.map(d => ({
                    id: d.id,
                    name: d.name,
                    device_id: d.device_id,
                    latitude: d.latitude,
                    longitude: d.longitude,
                    status: d.status,
                    created_at: d.created_at
                }))
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 4: Rota de criação sem validações adequadas
router.post('/', async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        // BUG: Validações muito permissivas
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // BUG: Não valida coordenadas
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Coordenadas são obrigatórias' });
        }

        // BUG: Não valida se coordenadas são válidas
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            // BUG: Permite coordenadas inválidas
            console.log('Coordenadas inválidas permitidas:', { latitude, longitude });
        }

        const deviceId = uuidv4();

        // BUG: Não verifica se nome já existe
        // BUG: Não valida dados de entrada

        db.run(`
      INSERT INTO devices (name, device_id, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?)
    `, [name, deviceId, latitude, longitude, 'active'], function (err) {
            if (err) {
                console.error('Error creating device:', err);
                return res.status(500).json({ error: 'Erro ao criar dispositivo' });
            }

            // BUG: Log de dados sensíveis
            console.log('DEVICE CREATED:', { id: this.lastID, name, deviceId, location: [latitude, longitude] });

            res.status(201).json({
                message: 'Dispositivo criado com sucesso',
                device: {
                    id: this.lastID,
                    name,
                    device_id: deviceId,
                    latitude,
                    longitude,
                    status: 'active'
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 5: Rota de atualização que permite qualquer alteração
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, latitude, longitude, status } = req.body;

        // BUG: Não valida se dispositivo existe
        // BUG: Não valida dados de entrada
        // BUG: Permite alterar qualquer campo

        let updateQuery = 'UPDATE devices SET ';
        let params = [];
        let updates = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (latitude !== undefined) {
            updates.push('latitude = ?');
            params.push(latitude);
        }

        if (longitude !== undefined) {
            updates.push('longitude = ?');
            params.push(longitude);
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        updateQuery += updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        // BUG: Não verifica se update foi bem sucedido
        db.run(updateQuery, params, function (err) {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ error: 'Erro ao atualizar dispositivo' });
            }

            // BUG: Retorna sucesso mesmo sem alterações
            res.json({
                message: 'Dispositivo atualizado com sucesso',
                changes: this.changes,
                id: id
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 6: Rota de exclusão que não verifica dependências
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // BUG: Não verifica se dispositivo existe
        // BUG: Não verifica se dispositivo tem telemetrias
        // BUG: Permite deletar qualquer dispositivo

        db.run('DELETE FROM devices WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ error: 'Erro ao deletar dispositivo' });
            }

            // BUG: Retorna sucesso mesmo sem deletar
            res.json({
                message: 'Dispositivo deletado com sucesso',
                changes: this.changes
            });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 7: Rota que busca dispositivo por ID sem validação
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // BUG: Não valida se ID é numérico
        // BUG: Não verifica permissões

        db.get('SELECT * FROM devices WHERE id = ?', [id], (err, device) => {
            if (err) {
                console.error('Error fetching device:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            if (!device) {
                return res.status(404).json({ error: 'Dispositivo não encontrado' });
            }

            // BUG: Log de dados sensíveis
            console.log('DEVICE FETCHED:', { id: device.id, name: device.name, location: [device.latitude, device.longitude] });

            res.json(device);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 8: Rota que busca dispositivos por localização sem validação
router.get('/location/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;

        // BUG: Não valida coordenadas
        // BUG: Não sanitiza entrada
        // BUG: Permite SQL injection

        const query = `
      SELECT * FROM devices 
      WHERE ABS(latitude - ${lat}) < 0.1 
      AND ABS(longitude - ${lng}) < 0.1
    `;

        db.all(query, (err, devices) => {
            if (err) {
                console.error('Error fetching devices by location:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }

            // BUG: Log de dados sensíveis
            console.log('DEVICES BY LOCATION:', { lat, lng, count: devices.length });

            res.json(devices);
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 9: Rota que permite upload de arquivo sem validação
router.post('/:id/upload', async (req, res) => {
    try {
        const { id } = req.params;
        const { fileData, fileName } = req.body;

        // BUG: Não valida tipo de arquivo
        // BUG: Não valida tamanho
        // BUG: Não sanitiza nome do arquivo
        // BUG: Permite qualquer upload

        if (!fileData || !fileName) {
            return res.status(400).json({ error: 'Dados do arquivo são obrigatórios' });
        }

        // BUG: Log de dados sensíveis
        console.log('FILE UPLOAD:', { deviceId: id, fileName, fileSize: fileData.length });

        // BUG: Simula sucesso sem realmente processar
        res.json({
            message: 'Arquivo enviado com sucesso',
            fileName,
            fileSize: fileData.length,
            deviceId: id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
