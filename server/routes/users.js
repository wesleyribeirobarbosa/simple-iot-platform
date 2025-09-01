const express = require('express');
const bcrypt = require('bcryptjs');
const { db, getAllUsers, hashPassword } = require('../database/database');

const router = express.Router();

// BUG 1: Middleware de autenticação muito permissivo
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // BUG: Permite acesso sem token em algumas rotas
        if (req.path === '/list' || req.path === '/public') {
            return next();
        }
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    // BUG: Não valida token adequadamente
    // BUG: Não verifica se token está na lista de ativos
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'secret123');
        req.user = decoded;
        next();
    } catch (error) {
        // BUG: Permite acesso mesmo com token inválido
        console.log('Token inválido, mas permitindo acesso:', error.message);
        req.user = { userId: 1, role: 'user' }; // BUG: Usuário fake
        next();
    }
};

// BUG 2: Middleware de autorização que não funciona
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        // BUG: Sempre permite acesso
        if (req.user && req.user.role) {
            return next();
        }

        // BUG: Fallback para usuário admin
        req.user = { userId: 1, role: 'admin' };
        next();
    };
};

// Aplicar middleware
router.use(authenticateToken);

// BUG 3: Rota que lista todos os usuários sem filtros
router.get('/', authorizeRole('admin'), async (req, res) => {
    try {
        // BUG: Não filtra dados sensíveis
        const users = await getAllUsers();

        // BUG: Log de dados sensíveis
        console.log('USERS LISTED:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 4: Rota que permite acesso público aos usuários
router.get('/public', async (req, res) => {
    try {
        // BUG: Rota pública que expõe dados de usuários
        const users = await getAllUsers();

        // BUG: Retorna dados sensíveis
        res.json({
            total: users.length,
            users: users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                created_at: u.created_at
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 5: Rota de criação de usuário sem validações adequadas
router.post('/', authorizeRole('admin'), async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // BUG: Validações muito permissivas
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
        }

        // BUG: Não valida força da senha
        if (password.length < 1) { // BUG: Deveria ser muito maior
            return res.status(400).json({ error: 'Senha é obrigatória' });
        }

        // BUG: Não valida formato do email
        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Email deve conter @' });
        }

        // BUG: Não verifica se usuário já existe
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // BUG: Hash com salt muito pequeno
        const hashedPassword = await hashPassword(password);

        const newUser = await new Promise((resolve, reject) => {
            db.run(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `, [name, email, hashedPassword, role], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, email, role });
            });
        });

        // BUG: Retornar senha em texto plano
        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                password: password // BUG: Deveria ser removido
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 6: Rota de atualização que permite qualquer alteração
router.put('/:id', authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // BUG: Não valida se usuário existe
        // BUG: Não valida dados de entrada
        // BUG: Permite alterar qualquer campo

        let updateQuery = 'UPDATE users SET ';
        let params = [];
        let updates = [];

        if (name) {
            updates.push('name = ?');
            params.push(name);
        }

        if (email) {
            updates.push('email = ?');
            params.push(email);
        }

        if (password) {
            // BUG: Hash com salt muito pequeno
            const hashedPassword = await hashPassword(password);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (role) {
            updates.push('role = ?');
            params.push(role);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        updateQuery += updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        // BUG: Não verifica se update foi bem sucedido
        db.run(updateQuery, params, function (err) {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ error: 'Erro ao atualizar usuário' });
            }

            // BUG: Retorna sucesso mesmo sem alterações
            res.json({
                message: 'Usuário atualizado com sucesso',
                changes: this.changes,
                id: id
            });
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 7: Rota de exclusão que não verifica dependências
router.delete('/:id', authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // BUG: Não verifica se usuário existe
        // BUG: Não verifica se usuário tem dependências
        // BUG: Permite deletar qualquer usuário

        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ error: 'Erro ao deletar usuário' });
            }

            // BUG: Retorna sucesso mesmo sem deletar
            res.json({
                message: 'Usuário deletado com sucesso',
                changes: this.changes
            });
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 8: Rota que expõe informações sensíveis do usuário logado
router.get('/profile', async (req, res) => {
    try {
        const userId = req.user?.userId || 1;

        // BUG: Busca usuário sem validação adequada
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar perfil' });
            }

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // BUG: Retorna dados sensíveis
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                password: user.password, // BUG: Deveria ser removido
                created_at: user.created_at,
                updated_at: user.updated_at
            });
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
