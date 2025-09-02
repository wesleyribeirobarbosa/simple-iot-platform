import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Shield } from 'lucide-react';

const Users = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // BUG 1: useEffect que roda infinitamente
    useEffect(() => {
        fetchUsers();

        // BUG: Intervalo muito frequente
        const interval = setInterval(fetchUsers, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');

            // BUG: Log de token no console
            console.log('Fetching users with token:', token?.substring(0, 20) + '...');

            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);

                // BUG: Log de dados sensíveis
                console.log('USERS LOADED:', data.map(u => ({ id: u.id, email: u.email, role: u.role })));
            }
        } catch (error) {
            console.log('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // BUG 2: Função que não valida dados adequadamente
    const handleCreateUser = async (userData) => {
        try {
            const token = localStorage.getItem('token');

            // BUG: Validação muito permissiva
            if (!userData.name || !userData.email || !userData.password) {
                alert('Todos os campos são obrigatórios');
                return;
            }

            // BUG: Não valida força da senha
            if (userData.password.length < 1) {
                alert('Senha deve ter pelo menos 1 caractere');
                return;
            }

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                await fetchUsers();
                setShowCreateForm(false);
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao criar usuário');
            }
        } catch (error) {
            console.log('Error creating user:', error);
            alert('Erro ao criar usuário');
        }
    };

    // BUG 3: Função que não trata erros adequadamente
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchUsers();
            } else {
                alert('Erro ao deletar usuário');
            }
        } catch (error) {
            console.log('Error deleting user:', error);
            alert('Erro ao deletar usuário');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando usuários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Usuários</h1>
                    <p className="text-gray-600">Gerencie usuários da plataforma IoT</p>
                </div>

                {/* BUG 4: Botão sempre visível mesmo sem permissões */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Função
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Criado em
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((userItem) => (
                                <tr key={userItem.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                                <div className="text-sm text-gray-500">ID: {userItem.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">{userItem.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${userItem.role === 'admin'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {userItem.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(userItem.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingUser(userItem)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(userItem.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* BUG 5: Debug panel sempre visível */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info</h3>
                    <div className="text-xs text-yellow-700 space-y-1">
                        <p>Total Users: {users.length}</p>
                        <p>Current User Role: {user?.role}</p>
                        <p>Token: {localStorage.getItem('token')?.substring(0, 20) + '...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
