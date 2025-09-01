const { db } = require('../database/database');

// BUG 1: Função que gera dados inconsistentes
const generateRandomValue = (min, max, allowNegative = false) => {
    // BUG: Permite valores negativos quando não deveria
    // BUG: Permite valores fora do range esperado
    let value = Math.random() * (max - min) + min;

    if (allowNegative && Math.random() > 0.8) {
        value = -value; // BUG: Valores negativos aleatórios
    }

    if (Math.random() > 0.95) {
        value = value * 10; // BUG: Valores muito altos ocasionalmente
    }

    return parseFloat(value.toFixed(2));
};

// BUG 2: Função que gera coordenadas inválidas
const generateRandomLocation = () => {
    // BUG: Ocasionalmente gera coordenadas inválidas
    if (Math.random() > 0.95) {
        return {
            latitude: 999.999, // BUG: Latitude inválida
            longitude: 999.999  // BUG: Longitude inválida
        };
    }

    return {
        latitude: generateRandomValue(-23.6, -23.4), // São Paulo
        longitude: generateRandomValue(-46.7, -46.5)
    };
};

// BUG 3: Função que gera telemetrias com dados impossíveis
const generateTelemetryData = async () => {
    try {
        // BUG: Busca todos os dispositivos sem filtros
        db.all('SELECT * FROM devices', async (err, devices) => {
            if (err) {
                console.error('Error fetching devices for telemetry:', err);
                return;
            }

            for (const device of devices) {
                // BUG: Gera dados inconsistentes
                const waterConsumption = generateRandomValue(0, 200, true); // BUG: Consumo negativo
                const batteryLevel = generateRandomValue(0, 120); // BUG: Bateria > 100%
                const signalStrength = generateRandomValue(0, 150); // BUG: Sinal > 100%
                const temperature = generateRandomValue(-50, 80); // BUG: Temperatura extrema
                const humidity = generateRandomValue(0, 150); // BUG: Umidade > 100%

                // BUG: Log de dados sensíveis
                console.log('GENERATING TELEMETRY:', {
                    device: device.name,
                    water: waterConsumption,
                    battery: batteryLevel,
                    signal: signalStrength,
                    temp: temperature,
                    humidity: humidity
                });

                // BUG: Insere telemetria sem validação
                db.run(`
          INSERT INTO telemetry (device_id, water_consumption, battery_level, signal_strength, temperature, humidity)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
                    device.device_id,
                    waterConsumption,
                    batteryLevel,
                    signalStrength,
                    temperature,
                    humidity
                ], function (err) {
                    if (err) {
                        console.error('Error inserting telemetry:', err);
                    } else {
                        // BUG: Log de ID da telemetria criada
                        console.log('TELEMETRY INSERTED:', { id: this.lastID, device: device.name });
                    }
                });
            }
        });

    } catch (error) {
        console.error('Error generating telemetry data:', error);
    }
};

// BUG 4: Função que gera dados de teste inconsistentes
const generateTestData = async () => {
    try {
        // BUG: Gera dispositivos de teste com dados inválidos
        const testDevices = [
            {
                name: 'Dispositivo Teste Bug 1',
                device_id: 'BUG001',
                latitude: 999.999, // BUG: Coordenada inválida
                longitude: 999.999
            },
            {
                name: 'Dispositivo Teste Bug 2',
                device_id: 'BUG002',
                latitude: -23.5505,
                longitude: -46.6333
            },
            {
                name: 'Dispositivo Teste Bug 3',
                device_id: 'BUG003',
                latitude: 0, // BUG: Coordenada no meio do oceano
                longitude: 0
            }
        ];

        for (const device of testDevices) {
            // BUG: Insere dispositivo sem verificar se já existe
            db.run(`
        INSERT OR IGNORE INTO devices (name, device_id, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?)
      `, [device.name, device.device_id, device.latitude, device.longitude, 'active']);

            // BUG: Gera telemetrias de teste com dados impossíveis
            for (let i = 0; i < 10; i++) {
                const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();

                db.run(`
          INSERT OR IGNORE INTO telemetry (device_id, water_consumption, battery_level, signal_strength, temperature, humidity, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
                    device.device_id,
                    generateRandomValue(-100, 300, true), // BUG: Consumo muito negativo ou alto
                    generateRandomValue(-50, 150), // BUG: Bateria negativa ou > 100%
                    generateRandomValue(-25, 200), // BUG: Sinal negativo ou > 100%
                    generateRandomValue(-100, 150), // BUG: Temperatura extrema
                    generateRandomValue(-10, 200), // BUG: Umidade negativa ou > 100%
                    timestamp
                ]);
            }
        }

        console.log('✅ Dados de teste gerados com bugs propositais!');

    } catch (error) {
        console.error('Error generating test data:', error);
    }
};

// BUG 5: Função que limpa dados antigos de forma inadequada
const cleanupOldData = async () => {
    try {
        // BUG: Deleta dados muito recentes
        // BUG: Não verifica se operação foi bem sucedida
        db.run(`
      DELETE FROM telemetry 
      WHERE timestamp < datetime('now', '-1 day')
    `, function (err) {
            if (err) {
                console.error('Error cleaning up old data:', err);
            } else {
                // BUG: Log de dados deletados
                console.log('OLD DATA CLEANED:', { deleted: this.changes });
            }
        });

    } catch (error) {
        console.error('Error cleaning up old data:', error);
    }
};

// BUG 6: Função que valida dados de forma inadequada
const validateTelemetryData = (data) => {
    const errors = [];

    // BUG: Validações muito permissivas
    if (data.water_consumption === undefined) {
        errors.push('Consumo de água é obrigatório');
    }

    if (data.battery_level === undefined) {
        errors.push('Nível de bateria é obrigatório');
    }

    if (data.signal_strength === undefined) {
        errors.push('Força do sinal é obrigatória');
    }

    // BUG: Não valida ranges
    // BUG: Não valida tipos de dados
    // BUG: Permite valores impossíveis

    return errors;
};

// BUG 7: Função que retorna estatísticas incorretas
const getTelemetryStats = async () => {
    return new Promise((resolve, reject) => {
        // BUG: Query que pode retornar dados incorretos
        db.get(`
      SELECT 
        COUNT(*) as total,
        AVG(water_consumption) as avg_water,
        AVG(battery_level) as avg_battery,
        AVG(signal_strength) as avg_signal,
        SUM(water_consumption) as total_water
      FROM telemetry
    `, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                // BUG: Não valida se os dados fazem sentido
                // BUG: Retorna estatísticas mesmo com dados inconsistentes
                resolve(stats);
            }
        });
    });
};

module.exports = {
    generateTelemetryData,
    generateTestData,
    cleanupOldData,
    validateTelemetryData,
    getTelemetryStats
};
