import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Droplets, Battery, Signal, Thermometer, Gauge } from 'lucide-react';
import MapView from './MapView';

const Dashboard = ({ user }) => {
    const [devices, setDevices] = useState([]);
    const [telemetries, setTelemetries] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);

    // BUG 1: useEffect que roda infinitamente
    useEffect(() => {
        fetchDashboardData();

        // BUG: Intervalo muito frequente
        const interval = setInterval(() => {
            fetchDashboardData();
            // BUG: Log de performance desnecessário
            console.log('Dashboard refresh at:', new Date().toISOString());
        }, 1000); // BUG: Deveria ser muito maior (ex: 30s)

        return () => clearInterval(interval);
    }, []); // BUG: Dependência vazia causa re-renders desnecessários

    // BUG 2: Função que não trata erros adequadamente
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            // BUG: Log de token no console
            console.log('Fetching dashboard with token:', token?.substring(0, 20) + '...');

            // BUG: Requisições paralelas sem controle de erro
            const [devicesRes, telemetriesRes, statsRes] = await Promise.all([
                fetch('/api/devices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/telemetry/realtime', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/telemetry/stats/summary', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (devicesRes.ok) {
                const devicesData = await devicesRes.json();
                setDevices(devicesData);

                // BUG: Log de dados sensíveis
                console.log('DEVICES LOADED:', devicesData.map(d => ({
                    name: d.name,
                    location: [d.latitude, d.longitude]
                })));
            }

            if (telemetriesRes.ok) {
                const telemetriesData = await telemetriesRes.json();
                setTelemetries(telemetriesData.telemetries || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            setLoading(false);
        } catch (error) {
            // BUG: Não trata erro adequadamente
            console.log('Dashboard fetch error:', error.message);
            setLoading(false);
        }
    };

    // BUG 3: Função que calcula estatísticas incorretas
    const calculateStats = () => {
        if (!telemetries.length) return {};

        // BUG: Cálculos incorretos
        const totalWater = telemetries.reduce((sum, t) => sum + (t.water_consumption || 0), 0);
        const avgBattery = telemetries.reduce((sum, t) => sum + (t.battery_level || 0), 0) / telemetries.length;
        const avgSignal = telemetries.reduce((sum, t) => sum + (t.signal_strength || 0), 0) / telemetries.length;

        // BUG: Não valida se valores fazem sentido
        return {
            totalWater: totalWater.toFixed(2),
            avgBattery: avgBattery.toFixed(1),
            avgSignal: avgSignal.toFixed(1),
            deviceCount: devices.length,
            activeDevices: devices.filter(d => d.status === 'active').length
        };
    };

    // BUG 4: Função que renderiza dados inconsistentes
    const renderDeviceCard = (device) => {
        const deviceTelemetries = telemetries.filter(t => t.device_id === device.device_id);
        const latestTelemetry = deviceTelemetries[0];

        // BUG: Não valida se telemetria existe
        // BUG: Permite valores impossíveis
        const waterConsumption = latestTelemetry?.water_consumption || 0;
        const batteryLevel = latestTelemetry?.battery_level || 0;
        const signalStrength = latestTelemetry?.signal_strength || 0;

        // BUG: Valores negativos ou impossíveis são exibidos
        const getStatusColor = (value, type) => {
            if (type === 'water' && value < 0) return 'text-red-600'; // BUG: Consumo negativo
            if (type === 'battery' && value > 100) return 'text-orange-600'; // BUG: Bateria > 100%
            if (type === 'signal' && value > 100) return 'text-purple-600'; // BUG: Sinal > 100%

            if (value < 20) return 'text-red-600';
            if (value < 50) return 'text-yellow-600';
            return 'text-green-600';
        };

        return (
            <div
                key={device.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedDevice(device)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {device.status}
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                            {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Consumo (L)</p>
                            <p className={`font-semibold ${getStatusColor(waterConsumption, 'water')}`}>
                                {waterConsumption.toFixed(1)}
                            </p>
                        </div>

                        <div className="text-center">
                            <Battery className="h-6 w-6 text-green-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Bateria (%)</p>
                            <p className={`font-semibold ${getStatusColor(batteryLevel, 'battery')}`}>
                                {batteryLevel.toFixed(1)}
                            </p>
                        </div>

                        <div className="text-center">
                            <Signal className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Sinal (%)</p>
                            <p className={`font-semibold ${getStatusColor(signalStrength, 'signal')}`}>
                                {signalStrength.toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // BUG 5: Renderização condicional que pode causar crashes
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    const dashboardStats = calculateStats();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard IoT
                    </h1>
                    <p className="text-gray-600">
                        Bem-vindo, {user?.name || 'Usuário'}! Monitore seus dispositivos em tempo real.
                    </p>

                    {/* BUG 6: Informações sensíveis expostas */}
                    <div className="mt-2 text-xs text-gray-500">
                        <p>User ID: {user?.userId}</p>
                        <p>Role: {user?.role}</p>
                        <p>Email: {user?.email}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Droplets className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Consumo</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardStats.totalWater || 0} L
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Battery className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Bateria Média</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardStats.avgBattery || 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Signal className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Sinal Médio</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardStats.avgSignal || 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <MapPin className="h-8 w-8 text-red-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Dispositivos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardStats.deviceCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Gauge className="h-8 w-8 text-indigo-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {dashboardStats.activeDevices || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map and Devices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Map */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa de Dispositivos</h2>
                        <div className="h-96 rounded-lg overflow-hidden">
                            <MapView devices={devices} onDeviceSelect={setSelectedDevice} />
                        </div>
                    </div>

                    {/* Devices List */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Dispositivos</h2>
                            <Link
                                to="/devices"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Ver Todos
                            </Link>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {devices.slice(0, 5).map(renderDeviceCard)}
                        </div>
                    </div>
                </div>

                {/* BUG 7: Debug panel sempre visível */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p>Total Telemetries: {telemetries.length}</p>
                        <p>Selected Device: {selectedDevice?.name || 'Nenhum'}</p>
                        <p>User Token: {localStorage.getItem('token')?.substring(0, 20) + '...'}</p>
                        <p>Window Data: {window.USER_DATA ? 'Presente' : 'Ausente'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
