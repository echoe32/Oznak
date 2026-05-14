import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const Landing = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await loginUser(email.trim(), password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 mb-2">Финансовый менеджер</h1>
                <p className="text-slate-600">Сохраняйте и отслеживайте свои траты.</p>
            </div>

            {isLogin ? (
                <div className="bg-slate-100 p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl text-slate-800 mb-6">Вход</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full mb-4 p-2 border rounded bg-slate-50 text-slate-900"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full mb-4 p-2 border rounded bg-slate-50 text-slate-900"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-700 text-white p-2 rounded hover:bg-slate-600 transition disabled:bg-slate-400">
                            {isSubmitting ? 'Идет авторизация...' : 'Войти'}
                        </button>
                    </form>
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Еще нет акаунта? <button onClick={() => setIsLogin(false)} className="text-emerald-600 hover:underline font-semibold ml-1">Зарегистрируйтесь</button>
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-md flex flex-col items-center">
                    <RegisterForm onRegistered={(registeredEmail) => {
                        setEmail(registeredEmail);
                        setPassword('');
                        setError('');
                        setIsLogin(true);
                    }} />
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Уже есть аккаунт? <button onClick={() => setIsLogin(true)} className="text-emerald-600 hover:underline font-semibold ml-1">Войти</button>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Landing;