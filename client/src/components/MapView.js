import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

const MapView = ({ devices, onDeviceSelect }) => {
    const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]); // São Paulo
    const [zoom, setZoom] = useState(10);
    const [selectedDevice, setSelectedDevice] = useState(null);

    // BUG 1: useEffect que roda infinitamente
    useEffect(() => {
        // BUG: Atualiza mapa a cada segundo
        const interval = setInterval(() => {
            setMapCenter(prev => [prev[0] + (Math.random() - 0.5) * 0.001, prev[1] + (Math.random() - 0.5) * 0.001]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // BUG 2: Função que não valida coordenadas
    const isValidCoordinate = (lat, lng) => {
        // BUG: Validação muito permissiva
        return lat !== undefined && lng !== undefined;
    };

    // BUG 3: Função que renderiza dispositivos com bugs
    const renderDeviceMarker = useCallback((device) => {
        // BUG: Não valida coordenadas antes de renderizar
        if (!isValidCoordinate(device.latitude, device.longitude)) {
            console.log('Invalid coordinates for device:', device.name, device.latitude, device.longitude);
            return null;
        }

        // BUG: Coordenadas inválidas são renderizadas
        const lat = device.latitude;
        const lng = device.longitude;

        // BUG: Posicionamento incorreto para coordenadas inválidas
        const left = ((lng + 180) / 360) * 100;
        const top = ((90 - lat) / 180) * 100;

        // BUG: Valores impossíveis são exibidos
        const getStatusColor = (status) => {
            if (status === 'active') return 'bg-green-500';
            if (status === 'inactive') return 'bg-red-500';
            if (status === 'error') return 'bg-yellow-500';
            return 'bg-gray-500';
        };

        return (
            <div
                key={device.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                    left: `${Math.max(0, Math.min(100, left))}%`,
                    top: `${Math.max(0, Math.min(100, top))}%`
                }}
                onClick={() => {
                    setSelectedDevice(device);
                    onDeviceSelect?.(device);

                    // BUG: Log de dados sensíveis
                    console.log('DEVICE SELECTED:', {
                        name: device.name,
                        location: [device.latitude, device.longitude],
                        id: device.id
                    });
                }}
            >
                <div className={`w-6 h-6 rounded-full ${getStatusColor(device.status)} border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}>
                    <MapPin className="w-full h-full text-white" />
                </div>

                {/* BUG 4: Tooltip sempre visível */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-100">
                    {device.name}
                </div>
            </div>
        );
    }, [onDeviceSelect]);

    // BUG 5: Função que não trata dispositivos com coordenadas inválidas
    const validDevices = devices.filter(device => {
        // BUG: Filtro muito permissivo
        return device && device.latitude !== null && device.longitude !== null;
    });

    // BUG 6: Função que calcula centro do mapa incorretamente
    const calculateMapCenter = () => {
        if (validDevices.length === 0) return mapCenter;

        // BUG: Cálculo incorreto do centro
        const totalLat = validDevices.reduce((sum, device) => sum + device.latitude, 0);
        const totalLng = validDevices.reduce((sum, device) => sum + device.longitude, 0);

        // BUG: Não valida se valores fazem sentido
        const avgLat = totalLat / validDevices.length;
        const avgLng = totalLng / validDevices.length;

        // BUG: Permite coordenadas inválidas
        if (isNaN(avgLat) || isNaN(avgLng)) {
            console.log('Invalid average coordinates:', { avgLat, avgLng });
            return mapCenter;
        }

        return [avgLat, avgLng];
    };

    // BUG 7: Função que renderiza alertas desnecessários
    const renderAlerts = () => {
        const invalidDevices = devices.filter(device =>
            !isValidCoordinate(device.latitude, device.longitude)
        );

        if (invalidDevices.length === 0) return null;

        return (
            <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 max-w-xs">
                <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                        <h4 className="text-sm font-medium text-yellow-800">Dispositivos com Problemas</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                            {invalidDevices.length} dispositivo(s) com coordenadas inválidas
                        </p>
                    </div>
                </div>

                {/* BUG: Lista de dispositivos problemáticos sempre visível */}
                <div className="mt-2 text-xs text-yellow-700">
                    {invalidDevices.slice(0, 3).map(device => (
                        <p key={device.id}>• {device.name}: [{device.latitude}, {device.longitude}]</p>
                    ))}
                    {invalidDevices.length > 3 && (
                        <p>... e mais {invalidDevices.length - 3}</p>
                    )}
                </div>
            </div>
        );
    };

    // BUG 8: Função que renderiza controles de zoom desnecessários
    const renderZoomControls = () => {
        return (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                <button
                    onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                    +
                </button>
                <button
                    onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                    -
                </button>
                <div className="text-xs text-gray-500 text-center mt-1">
                    {zoom}x
                </div>
            </div>
        );
    };

    // BUG 9: Função que renderiza informações de debug sempre visíveis
    const renderDebugInfo = () => {
        return (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                <p>Zoom: {zoom}</p>
                <p>Center: [{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}]</p>
                <p>Devices: {validDevices.length}/{devices.length}</p>
                <p>Selected: {selectedDevice?.name || 'Nenhum'}</p>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
            {/* BUG 10: Mapa estático com posicionamento incorreto */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative">
                {/* Grid de fundo */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className="absolute border-l border-gray-300 h-full" style={{ left: `${i * 5}%` }} />
                    ))}
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className="absolute border-t border-gray-300 w-full" style={{ top: `${i * 5}%` }} />
                    ))}
                </div>

                {/* Dispositivos */}
                {validDevices.map(renderDeviceMarker)}

                {/* BUG: Dispositivos com coordenadas inválidas são renderizados em posições incorretas */}
                {devices.filter(device => !isValidCoordinate(device.latitude, device.longitude)).map(device => (
                    <div
                        key={`invalid-${device.id}`}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap">
                            {device.name} (Inválido)
                        </div>
                    </div>
                ))}
            </div>

            {/* Controles e informações */}
            {renderZoomControls()}
            {renderAlerts()}
            {renderDebugInfo()}

            {/* BUG: Painel de informações sempre visível */}
            {selectedDevice && (
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedDevice.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>ID: {selectedDevice.device_id}</p>
                        <p>Status: {selectedDevice.status}</p>
                        <p>Lat: {selectedDevice.latitude.toFixed(6)}</p>
                        <p>Lng: {selectedDevice.longitude.toFixed(6)}</p>
                        <p>Criado: {new Date(selectedDevice.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={() => setSelectedDevice(null)}
                        className="mt-3 w-full bg-gray-200 text-gray-700 py-1 px-2 rounded text-sm hover:bg-gray-300"
                    >
                        Fechar
                    </button>
                </div>
            )}
        </div>
    );
};

export default MapView;
