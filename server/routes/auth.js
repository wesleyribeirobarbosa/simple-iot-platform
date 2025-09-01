const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../database/database');

const router = express.Router();

// BUG 1: Chave JWT muito fraca e hardcoded
const JWT_SECRET = 'secret123'; // BUG: Chave muito fraca e exposta

// BUG 2: Função de login que não valida adequadamente
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // BUG: Validação muito permissiva
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // BUG: Usar função vulnerável a SQL injection
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // BUG: Comparação de senha sem tratamento de erro
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // BUG: Token com expiração muito longa
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '365d' } // BUG: Deveria ser muito menor (ex: 1h)
        );

        // BUG: Armazenar token em variável global (inseguro)
        if (!global.activeTokens) {
            global.activeTokens = [];
        }
        global.activeTokens.push(token);

        // BUG: Log de informações sensíveis
        console.log('LOGIN SUCCESSFUL:', { email: user.email, role: user.role, token: token.substring(0, 20) + '...' });

        // BUG: Retornar dados sensíveis do usuário
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                password: user.password // BUG: Deveria ser removido
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 3: Rota de registro sem validações adequadas
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // BUG: Validação muito permissiva
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // BUG: Não valida força da senha
        if (password.length < 3) { // BUG: Deveria ser muito maior
            return res.status(400).json({ error: 'Senha deve ter pelo menos 3 caracteres' });
        }

        // BUG: Não valida formato do email
        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        // BUG: Não verifica se usuário já existe
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const newUser = await createUser({ name, email, password, role });

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
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// BUG 4: Rota de logout que não invalida token
router.post('/logout', (req, res) => {
    const { token } = req.body;

    if (token && global.activeTokens) {
        // BUG: Não remove token da lista
        // global.activeTokens = global.activeTokens.filter(t => t !== token);

        // BUG: Log de logout com token
        console.log('LOGOUT:', token.substring(0, 20) + '...');
    }

    res.json({ message: 'Logout realizado com sucesso' });
});

// BUG 5: Rota que verifica token sem validação adequada
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        // BUG: Não verifica se token está na lista de ativos
        const decoded = jwt.verify(token, JWT_SECRET);

        // BUG: Retornar dados sensíveis
        res.json({
            valid: true,
            user: decoded,
            token: token // BUG: Deveria ser removido
        });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;
