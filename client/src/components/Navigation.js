import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, BarChart3, MapPin, Users } from 'lucide-react';

const Navigation = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // BUG 1: Função que expõe dados sensíveis
    const handleDebug = () => {
        console.log('NAVIGATION DEBUG:', {
            user: user,
            currentPath: location.pathname,
            token: localStorage.getItem('token')?.substring(0, 20) + '...',
            windowData: window.USER_DATA
        });
    };

    // BUG 2: Função que não valida permissões adequadamente
    const canAccessUsers = () => {
        // BUG: Sempre permite acesso
        return true;
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: BarChart3 },
        { name: 'Dispositivos', href: '/devices', icon: MapPin },
        { name: 'Usuários', href: '/users', icon: Users, requiresAdmin: true },
    ];

    // BUG 3: Função que renderiza itens de navegação sem validação
    const renderNavigationItems = () => {
        return navigation.map((item) => {
            // BUG: Não verifica permissões adequadamente
            if (item.requiresAdmin && user?.role !== 'admin') {
                return null;
            }

            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
                <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                </Link>
            );
        });
    };

    return (
        <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                IoT Platform
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {renderNavigationItems()}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* BUG 4: Botão de debug sempre visível */}
                        <button
                            onClick={handleDebug}
                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                            Debug
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="ml-2 text-gray-700 hidden sm:block">
                                    {user?.name || 'Usuário'}
                                </span>
                            </button>

                            {/* BUG 5: Menu dropdown sempre visível quando aberto */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        <p className="font-medium">{user?.name}</p>
                                        <p className="text-gray-500">{user?.email}</p>
                                        {/* BUG: Informações sensíveis expostas */}
                                        <p className="text-xs text-red-500">Role: {user?.role}</p>
                                        <p className="text-xs text-red-500">ID: {user?.userId}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Perfil
                                    </Link>

                                    <button
                                        onClick={onLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {/* BUG 6: Menu mobile sempre visível quando aberto */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {renderNavigationItems()}

                        {/* BUG: Informações de usuário expostas no mobile */}
                        <div className="px-3 py-2 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                            <p className="text-xs text-red-500">Role: {user?.role}</p>
                            <p className="text-xs text-red-500">User ID: {user?.userId}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* BUG 7: Barra de status sempre visível */}
            <div className="bg-blue-50 border-t border-blue-200 px-4 py-1">
                <div className="flex items-center justify-between text-xs text-blue-700">
                    <span>Status: Conectado</span>
                    <span>Token: {localStorage.getItem('token') ? 'Ativo' : 'Inativo'}</span>
                    <span>Usuário: {user?.role || 'N/A'}</span>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
