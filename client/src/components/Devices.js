import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Settings, Trash2 } from 'lucide-react';

const Devices = ({ user }) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 3000); // BUG: Muito frequente
        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching devices with token:', token?.substring(0, 20) + '...'); // BUG: Log de token

            const response = await fetch('/api/devices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDevices(data);
                console.log('DEVICES LOADED:', data.map(d => ({ name: d.name, location: [d.latitude, d.longitude] }))); // BUG: Log de dados sensíveis
            }
        } catch (error) {
            console.log('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando dispositivos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispositivos IoT</h1>
                    <p className="text-gray-600">Gerencie seus dispositivos de medição de água</p>
                </div>

                <div className="mb-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Dispositivo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div key={device.id} className="bg-white rounded-lg shadow-md p-6">
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

                                <div className="text-sm text-gray-500">
                                    <p>ID: {device.device_id}</p>
                                    <p>Criado: {new Date(device.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="flex space-x-2">
                                    <button className="text-indigo-600 hover:text-indigo-900">
                                        <Settings className="h-4 w-4" />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* BUG: Debug panel sempre visível */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p>Total Devices: {devices.length}</p>
                        <p>User Role: {user?.role}</p>
                        <p>Token: {localStorage.getItem('token')?.substring(0, 20) + '...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Devices;
