import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Droplets, Battery, Signal, Thermometer } from 'lucide-react';

const DeviceDetail = ({ user }) => {
    const { id } = useParams();
    const [device, setDevice] = useState(null);
    const [telemetries, setTelemetries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeviceData();
        const interval = setInterval(fetchDeviceData, 2000); // BUG: Muito frequente
        return () => clearInterval(interval);
    }, [id]);

    const fetchDeviceData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching device detail with token:', token?.substring(0, 20) + '...'); // BUG: Log de token

            const [deviceRes, telemetriesRes] = await Promise.all([
                fetch(`/api/devices/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/telemetry/device/${id}?days=7`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (deviceRes.ok) {
                const deviceData = await deviceRes.json();
                setDevice(deviceData);
                console.log('DEVICE DETAIL LOADED:', { name: deviceData.name, location: [deviceData.latitude, deviceData.longitude] }); // BUG: Log de dados sensíveis
            }

            if (telemetriesRes.ok) {
                const telemetriesData = await telemetriesRes.json();
                setTelemetries(telemetriesData);
            }
        } catch (error) {
            console.log('Error fetching device data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dispositivo...</p>
                </div>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dispositivo não encontrado</h2>
                    <p className="text-gray-600">O dispositivo solicitado não foi encontrado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{device.name}</h1>
                    <p className="text-gray-600">Detalhes e telemetrias do dispositivo</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Device Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Dispositivo</h2>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Localização</p>
                                    <p className="text-sm text-gray-900">
                                        {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">ID do Dispositivo</p>
                                <p className="text-sm text-gray-900">{device.device_id}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {device.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700">Criado em</p>
                                <p className="text-sm text-gray-900">
                                    {new Date(device.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Latest Telemetry */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Última Telemetria</h2>

                        {telemetries.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Consumo de Água</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {telemetries[0].water_consumption.toFixed(1)} L
                                        </p>
                                    </div>

                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <Battery className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Nível da Bateria</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {telemetries[0].battery_level.toFixed(1)}%
                                        </p>
                                    </div>

                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <Signal className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Força do Sinal</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {telemetries[0].signal_strength.toFixed(1)}%
                                        </p>
                                    </div>

                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Temperatura</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {telemetries[0].temperature?.toFixed(1) || 'N/A'}°C
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center text-sm text-gray-500">
                                    Última atualização: {new Date(telemetries[0].timestamp).toLocaleString()}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Nenhuma telemetria disponível</p>
                        )}
                    </div>
                </div>

                {/* Telemetry History */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Telemetrias</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Consumo (L)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bateria (%)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sinal (%)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Temperatura (°C)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {telemetries.slice(0, 10).map((telemetry) => (
                                    <tr key={telemetry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(telemetry.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {telemetry.water_consumption.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {telemetry.battery_level.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {telemetry.signal_strength.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {telemetry.temperature?.toFixed(1) || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BUG: Debug panel sempre visível */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p>Device ID: {device?.id}</p>
                        <p>Total Telemetries: {telemetries.length}</p>
                        <p>User Role: {user?.role}</p>
                        <p>Token: {localStorage.getItem('token')?.substring(0, 20) + '...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetail;
