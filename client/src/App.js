import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Devices from './components/Devices';
import DeviceDetail from './components/DeviceDetail';
import Navigation from './components/Navigation';
import './App.css';

// BUG 1: Token armazenado em localStorage sem criptografia
// BUG 2: Variável global para armazenar dados sensíveis
window.USER_DATA = null;
window.API_TOKENS = [];

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // BUG 3: Verificação de autenticação muito permissiva
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // BUG: Não valida token no servidor
            // BUG: Assume que token é válido
            setIsAuthenticated(true);

            // BUG: Armazena token em variável global
            window.API_TOKENS.push(token);

            // BUG: Log de token no console
            console.log('TOKEN LOADED:', token.substring(0, 20) + '...');

            // BUG: Busca dados do usuário sem validação
            fetchUserData(token);
        } else {
            setIsAuthenticated(false);
        }

        setLoading(false);
    }, []);

    // BUG 4: Função que não trata erros adequadamente
    const fetchUserData = async (token) => {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // BUG: Armazena dados sensíveis em variável global
                window.USER_DATA = data.user;

                // BUG: Log de dados sensíveis
                console.log('USER DATA LOADED:', data.user);

                setUser(data.user);
            } else {
                // BUG: Não limpa dados inválidos
                console.log('Token inválido, mas mantendo dados');
            }
        } catch (error) {
            // BUG: Não trata erro adequadamente
            console.log('Erro ao verificar token:', error.message);
        }
    };

    // BUG 5: Função de login que não valida dados
    const handleLogin = async (credentials) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();

                // BUG: Armazena token sem validação
                localStorage.setItem('token', data.token);

                // BUG: Armazena dados sensíveis em variável global
                window.USER_DATA = data.user;
                window.API_TOKENS.push(data.token);

                // BUG: Log de dados sensíveis
                console.log('LOGIN SUCCESS:', {
                    user: data.user.email,
                    token: data.token.substring(0, 20) + '...',
                    password: data.user.password // BUG: Senha exposta
                });

                setIsAuthenticated(true);
                setUser(data.user);

                // BUG: Redireciona sem verificar permissões
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.error };
            }
        } catch (error) {
            // BUG: Não trata erro adequadamente
            console.log('Erro no login:', error.message);
            return { success: false, error: 'Erro de conexão' };
        }
    };

    // BUG 6: Função de logout que não limpa dados adequadamente
    const handleLogout = () => {
        // BUG: Não invalida token no servidor
        // BUG: Não limpa variáveis globais
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);

        // BUG: Log de logout
        console.log('LOGOUT - Tokens ativos:', window.API_TOKENS);
    };

    // BUG 7: Renderização condicional que pode expor dados
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                    {/* BUG: Exposição de dados sensíveis durante carregamento */}
                    {window.USER_DATA && (
                        <p className="mt-2 text-sm text-red-500">
                            Usuário: {window.USER_DATA.email}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // BUG 8: Roteamento que não verifica permissões adequadamente
    return (
        <Router>
            <div className="App">
                <Toaster position="top-right" />

                {isAuthenticated ? (
                    <>
                        {/* BUG: Navegação sempre visível mesmo sem permissões */}
                        <Navigation user={user} onLogout={handleLogout} />

                        <main className="pt-16">
                            <Routes>
                                <Route path="/" element={<Dashboard user={user} />} />
                                <Route path="/users" element={<Users user={user} />} />
                                <Route path="/devices" element={<Devices user={user} />} />
                                <Route path="/devices/:id" element={<DeviceDetail user={user} />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </>
                ) : (
                    <Login onLogin={handleLogin} />
                )}
            </div>
        </Router>
    );
}

export default App;
