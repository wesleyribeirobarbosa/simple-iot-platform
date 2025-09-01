const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'iot_platform.db');
const db = new sqlite3.Database(dbPath);

// BUG 1: Senha padrão fraca e hardcoded
const DEFAULT_PASSWORD = '123456'; // BUG: Senha muito fraca

// BUG 2: Função de hash que não usa salt adequado
const hashPassword = async (password) => {
    // BUG: Salt muito pequeno (deveria ser 10+)
    return await bcrypt.hash(password, 5);
};

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabela de usuários
            db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Tabela de dispositivos
            db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          device_id TEXT UNIQUE NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Tabela de telemetrias
            db.run(`
        CREATE TABLE IF NOT EXISTS telemetry (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT NOT NULL,
          water_consumption REAL NOT NULL,
          battery_level REAL NOT NULL,
          signal_strength REAL NOT NULL,
          temperature REAL,
          humidity REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // BUG 3: Inserir usuário admin com senha fraca
            const adminPassword = DEFAULT_PASSWORD;
            hashPassword(adminPassword).then(hashedPassword => {
                db.run(`
          INSERT OR IGNORE INTO users (name, email, password, role)
          VALUES (?, ?, ?, ?)
        `, ['Admin', 'admin@iot.com', hashedPassword, 'admin']);
            });

            // BUG 4: Inserir dispositivos de teste com coordenadas inválidas
            db.run(`
        INSERT OR IGNORE INTO devices (name, device_id, latitude, longitude)
        VALUES 
          ('Dispositivo Teste 1', 'DEV001', -23.5505, -46.6333),
          ('Dispositivo Teste 2', 'DEV002', -23.5505, -46.6333),
          ('Dispositivo Teste 3', 'DEV003', 999.999, 999.999) -- BUG: Coordenadas inválidas
      `);

            // BUG 5: Inserir telemetrias com dados inconsistentes
            const now = new Date().toISOString();
            db.run(`
        INSERT OR IGNORE INTO telemetry (device_id, water_consumption, battery_level, signal_strength, temperature, humidity, timestamp)
        VALUES 
          ('DEV001', 150.5, 85.2, 75.8, 22.5, 65.3, ?),
          ('DEV002', -50.0, 120.5, 200.0, -999.9, 999.9, ?), -- BUG: Valores impossíveis
          ('DEV003', 0.0, 0.0, 0.0, 0.0, 0.0, ?)
      `, [now, now, now]);

            db.run('PRAGMA foreign_keys = ON');

            console.log('✅ Banco de dados inicializado com sucesso!');
            resolve();
        });
    });
};

// BUG 6: Função que não valida dados de entrada
const createUser = async (userData) => {
    return new Promise((resolve, reject) => {
        // BUG: Não valida se email já existe
        // BUG: Não valida força da senha
        // BUG: Não valida dados obrigatórios

        const { name, email, password, role = 'user' } = userData;

        if (!name || !email || !password) {
            reject(new Error('Dados obrigatórios não fornecidos'));
            return;
        }

        hashPassword(password).then(hashedPassword => {
            db.run(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `, [name, email, hashedPassword, role], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, name, email, role });
                }
            });
        });
    });
};

// BUG 7: Função que permite SQL injection
const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        // BUG: Query vulnerável a SQL injection
        const query = `SELECT * FROM users WHERE email = '${email}'`;

        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// BUG 8: Função que não trata erros adequadamente
const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, name, email, role, created_at FROM users', (err, rows) => {
            if (err) {
                // BUG: Não trata erro adequadamente
                console.error('Erro ao buscar usuários:', err);
                resolve([]); // BUG: Retorna array vazio em caso de erro
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    db,
    initDatabase,
    createUser,
    findUserByEmail,
    getAllUsers,
    hashPassword
};
