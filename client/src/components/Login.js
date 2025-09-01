import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

    // BUG 1: Validação muito permissiva
    const validateEmail = (email) => {
        // BUG: Validação muito simples
        return email.includes('@');
    };

    // BUG 2: Validação de senha muito fraca
    const validatePassword = (password) => {
        // BUG: Permite senhas muito fracas
        return password.length >= 1;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        // BUG 3: Log de dados sensíveis
        console.log('LOGIN ATTEMPT:', {
            email: data.email,
            password: data.password, // BUG: Senha exposta no console
            timestamp: new Date().toISOString()
        });

        // BUG 4: Validação client-side muito permissiva
        if (!validateEmail(data.email)) {
            setError('Email deve conter @');
            setIsLoading(false);
            return;
        }

        if (!validatePassword(data.password)) {
            setError('Senha é obrigatória');
            setIsLoading(false);
            return;
        }

        try {
            const result = await onLogin(data);

            if (result.success) {
                // BUG 5: Log de sucesso com dados sensíveis
                console.log('LOGIN SUCCESSFUL:', {
                    email: data.email,
                    timestamp: new Date().toISOString()
                });
            } else {
                setError(result.error || 'Erro no login');
            }
        } catch (error) {
            // BUG 6: Não trata erro adequadamente
            console.log('Login error:', error);
            setError('Erro de conexão');
        } finally {
            setIsLoading(false);
        }
    };

    // BUG 7: Função que expõe dados sensíveis
    const handleDebug = () => {
        // BUG: Botão de debug que expõe informações
        console.log('DEBUG INFO:', {
            currentUser: window.USER_DATA,
            activeTokens: window.API_TOKENS,
            localStorage: {
                token: localStorage.getItem('token'),
                otherData: Object.keys(localStorage)
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Plataforma IoT
                    </h1>
                    <p className="text-gray-600">
                        Gestão de Dispositivos de Medição de Água
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    {...register('email', {
                                        required: 'Email é obrigatório',
                                        validate: validateEmail
                                    })}
                                    type="email"
                                    id="email"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    {...register('password', {
                                        required: 'Senha é obrigatória',
                                        validate: validatePassword
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* BUG 8: Botão de debug visível */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleDebug}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                Debug Info
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Credenciais de teste:
                        </p>
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {/* BUG 9: Credenciais expostas na interface */}
                            <p>Admin: admin@iot.com / 123456</p>
                            <p>Usuário: user@iot.com / 123456</p>
                        </div>
                    </div>
                </div>

                {/* BUG 10: Informações sensíveis expostas */}
                <div className="text-center text-xs text-gray-500">
                    <p>Versão: 1.0.0</p>
                    <p>Ambiente: Desenvolvimento</p>
                    <p>Token JWT: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
